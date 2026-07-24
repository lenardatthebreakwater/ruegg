<?php
/**
 * PB Frontend Revalidate (Next.js cache purge on product changes)
 *
 * Version: 1.0.0
 * Updated: 2026-07-09
 *
 * Install as:
 * - Code Snippets plugin (PHP snippet, "Run snippet everywhere"), OR
 * - mu-plugin: wp-content/mu-plugins/pb-frontend-revalidate.php
 *
 * What it does:
 * Whenever a WooCommerce product is created, updated, trashed, restored,
 * deleted or has its stock changed, this snippet POSTs the affected product
 * slug(s) to the Next.js frontend:
 *
 *   POST {PB_FRONTEND_REVALIDATE_URL}
 *   Header: X-Revalidate-Secret: {PB_FRONTEND_REVALIDATE_SECRET}
 *   Body:   {"slugs": ["produkt-slug-1", "produkt-slug-2"]}
 *
 * The frontend purges the matching cache tags (product detail, archives,
 * search index, sitemap), so pages regenerate with fresh data on the next
 * visit. Multiple hooks firing during one save are deduped and sent as a
 * single request on shutdown.
 *
 * Check installed version: file header Version / PB_FRONTEND_REVALIDATE_SNIPPET_VERSION
 * (no REST health). Inventory: docs/wordpress/SNIPPETS.md
 */)

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_FRONTEND_REVALIDATE_SNIPPET_VERSION')) {
	define('PB_FRONTEND_REVALIDATE_SNIPPET_VERSION', '1.0.0');
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

if (!defined('PB_FRONTEND_REVALIDATE_URL')) {
	// Production URL (Next.js on the apex domain after cutover). For testing
	// before cutover, the same endpoint is reachable on the preview URL:
	// https://peisbutikken-frontend.ingar.workers.dev/api/revalidate/products
	define('PB_FRONTEND_REVALIDATE_URL', 'https://peisbutikken.no/api/revalidate/products');
}

if (!defined('PB_FRONTEND_REVALIDATE_SECRET')) {
	// Must match the PRODUCT_REVALIDATE_SECRET secret on the Cloudflare Worker.
	define('PB_FRONTEND_REVALIDATE_SECRET', 'njZbth32vIqnAbHVCu_s0qAfEDKD6bDkcCN7f75YMK0a1dK-');
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/** Queue a product slug for revalidation (deduped, flushed on shutdown). */
function pb_frontend_revalidate_queue_slug($slug) {
	static $registered = false;

	$slug = is_string($slug) ? trim($slug) : '';
	if ($slug === '') {
		return;
	}

	global $pb_frontend_revalidate_slugs;
	if (!is_array($pb_frontend_revalidate_slugs)) {
		$pb_frontend_revalidate_slugs = [];
	}
	$pb_frontend_revalidate_slugs[$slug] = true;

	if (!$registered) {
		add_action('shutdown', 'pb_frontend_revalidate_flush', 100);
		$registered = true;
	}
}

/** Queue by product ID; resolves variations to their parent product. */
function pb_frontend_revalidate_queue_product($product) {
	if (is_numeric($product)) {
		$product = wc_get_product($product);
	}
	if (!$product instanceof WC_Product) {
		return;
	}

	$parent_id = $product->get_parent_id();
	if ($parent_id > 0) {
		$parent = wc_get_product($parent_id);
		if ($parent instanceof WC_Product) {
			pb_frontend_revalidate_queue_slug($parent->get_slug());
			return;
		}
	}

	pb_frontend_revalidate_queue_slug($product->get_slug());
}

/** Send one deduped request to the frontend at end of request. */
function pb_frontend_revalidate_flush() {
	global $pb_frontend_revalidate_slugs;

	if (empty($pb_frontend_revalidate_slugs)) {
		return;
	}
	if (PB_FRONTEND_REVALIDATE_URL === '' || PB_FRONTEND_REVALIDATE_SECRET === '') {
		return;
	}

	$slugs = array_keys($pb_frontend_revalidate_slugs);
	$pb_frontend_revalidate_slugs = [];

	wp_remote_post(PB_FRONTEND_REVALIDATE_URL, [
		'timeout'  => 5,
		'blocking' => false, // fire-and-forget; do not slow down wp-admin saves
		'headers'  => [
			'Content-Type'        => 'application/json',
			'X-Revalidate-Secret' => PB_FRONTEND_REVALIDATE_SECRET,
		],
		'body'     => wp_json_encode(['slugs' => $slugs]),
	]);
}

// Product created / updated (fires for admin saves, imports, REST, bulk edit).
add_action('woocommerce_new_product', 'pb_frontend_revalidate_queue_product', 10, 1);
add_action('woocommerce_update_product', 'pb_frontend_revalidate_queue_product', 10, 1);

// Variation changes (price/stock edits on a variation don't always fire the
// parent product's update hook).
add_action('woocommerce_new_product_variation', 'pb_frontend_revalidate_queue_product', 10, 1);
add_action('woocommerce_update_product_variation', 'pb_frontend_revalidate_queue_product', 10, 1);

// Stock changes from orders / stock API.
add_action('woocommerce_product_set_stock', 'pb_frontend_revalidate_queue_product', 10, 1);
add_action('woocommerce_variation_set_stock', 'pb_frontend_revalidate_queue_product', 10, 1);

// Trash / restore / permanent delete. Queue the slug BEFORE deletion so it can
// still be resolved.
function pb_frontend_revalidate_on_status_change($post_id) {
	if (get_post_type($post_id) !== 'product') {
		return;
	}
	pb_frontend_revalidate_queue_product($post_id);
}
add_action('wp_trash_post', 'pb_frontend_revalidate_on_status_change', 10, 1);
add_action('untrashed_post', 'pb_frontend_revalidate_on_status_change', 10, 1);
add_action('before_delete_post', 'pb_frontend_revalidate_on_status_change', 10, 1);
