<?php
/**
 * PB WC AJAX checkout path (same-domain cutover prerequisite)
 *
 * Version: 1.0.0
 * Updated: 2026-07-09
 *
 * Install as:
 * - Code Snippets plugin (PHP snippet, "Run snippet everywhere"), OR
 * - mu-plugin: wp-content/mu-plugins/pb-wc-ajax-checkout-path.php
 *
 * Why:
 * WooCommerce builds its front-end AJAX URLs on the site root, e.g.
 * "/?wc-ajax=update_order_review". After the cutover the site root belongs to
 * the Next.js Worker (Cloudflare Worker routes match paths only, not query
 * strings), so those calls would hit Next.js and checkout would break.
 *
 * This snippet moves all wc-ajax calls under /checkout/ — a path excluded
 * from the Worker routes — so they always reach WordPress. WooCommerce
 * handles wc-ajax on any front-end URL, so this is safe to enable before the
 * cutover as well.
 *
 * Verify after enabling: view source on /checkout/ and confirm
 * wc_ajax_url ends with "/checkout/?wc-ajax=%%endpoint%%".
 * Also compare live file header Version with docs/wordpress/SNIPPETS.md.
 */)

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_WC_AJAX_CHECKOUT_PATH_SNIPPET_VERSION')) {
	define('PB_WC_AJAX_CHECKOUT_PATH_SNIPPET_VERSION', '1.0.0');
}

add_filter('woocommerce_ajax_get_endpoint', 'pb_wc_ajax_checkout_path', 10, 2);

function pb_wc_ajax_checkout_path($url, $request) {
	return add_query_arg(
		'wc-ajax',
		$request ? $request : '%%endpoint%%',
		home_url('/checkout/', 'relative')
	);
}
