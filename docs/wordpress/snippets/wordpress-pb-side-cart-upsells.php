<?php
/**
 * PB Side cart upsells (WooCommerce linked products)
 *
 * Version: 1.0.0
 * Updated: 2026-07-09
 *
 * Superseded for headless storefront: use {@see wordpress-pb-side-cart-order-bumps.php}
 * (CheckoutWC order bumps + bump discount pricing). Keep this file only if you still
 * need linked-product upsells for another client.
 *
 * Install as:
 * - mu-plugin: wp-content/mu-plugins/pb-side-cart-upsells.php (recommended), OR
 * - Code Snippets plugin (PHP snippet, run everywhere)
 *
 * Routes:
 * - POST /wp-json/pb/v1/side-cart-upsells
 * - GET  /wp-json/pb/v1/side-cart-upsells/health
 *
 * Check installed version: GET /wp-json/pb/v1/side-cart-upsells/health → snippetVersion
 * Inventory / deploy: docs/wordpress/SNIPPETS.md
 *
 * Request body (JSON):
 * {
 *   "items": [ { "productId": 123, "quantity": 1 }, ... ]
 * }
 *
 * Response (JSON):
 * {
 *   "ok": true,
 *   "upsells": [
 *     {
 *       "databaseId": 456,
 *       "slug": "product-slug",
 *       "name": "Product name",
 *       "price": "1 234 kr",
 *       "priceNumeric": 1234,
 *       "regularPrice": "1 499 kr",
 *       "onSale": false,
 *       "imageUrl": "https://...",
 *       "imageAlt": ""
 *     }
 *   ]
 * }
 *
 * Optional shared secret (define in wp-config.php):
 *   define('PB_SIDE_CART_UPSELLS_SECRET', 'your-secret');
 * Send header: X-PB-Side-Cart-Upsells-Secret
 *
 * Manual test:
 * curl -sS "https://YOUR_HOST/wp-json/pb/v1/side-cart-upsells/health"
 * curl -sS -X POST "https://YOUR_HOST/wp-json/pb/v1/side-cart-upsells" \
 *   -H "Content-Type: application/json" \
 *   -d '{"items":[{"productId":123,"quantity":1}]}'
 */

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_SIDE_CART_UPSELLS_SNIPPET_VERSION')) {
	define('PB_SIDE_CART_UPSELLS_SNIPPET_VERSION', '1.0.0');
}

/** Max upsell cards returned (stable order: first-seen wins). */
const PB_SIDE_CART_UPSELLS_MAX = 8;

add_action('rest_api_init', function () {
	register_rest_route('pb/v1', '/side-cart-upsells', [
		'methods' => 'POST',
		'callback' => 'pb_side_cart_upsells_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/side-cart-upsells/health', [
		'methods' => 'GET',
		'callback' => 'pb_side_cart_upsells_health_handler',
		'permission_callback' => '__return_true',
	]);
});

function pb_side_cart_upsells_health_handler(WP_REST_Request $request) {
	$rest_ready = class_exists('WooCommerce') && function_exists('WC');
	return rest_ensure_response([
		'ok' => true,
		'route' => 'pb/v1/side-cart-upsells',
		'snippetVersion' => PB_SIDE_CART_UPSELLS_SNIPPET_VERSION,
		'woocommerce_ready' => $rest_ready,
	]);
}

function pb_side_cart_upsells_validate_secret(WP_REST_Request $request) {
	/**
	 * Optional secret:
	 * define('PB_SIDE_CART_UPSELLS_SECRET', 'your-secret');
	 */
	$expected = defined('PB_SIDE_CART_UPSELLS_SECRET') ? (string) PB_SIDE_CART_UPSELLS_SECRET : '';
	if ($expected === '') {
		return true;
	}

	$provided = (string) $request->get_header('x-pb-side-cart-upsells-secret');
	if ($provided !== '' && hash_equals($expected, $provided)) {
		return true;
	}

	return new WP_Error('forbidden', 'Invalid side cart upsells secret.', ['status' => 403]);
}

function pb_side_cart_upsells_bootstrap_wc() {
	if (!class_exists('WooCommerce') || !function_exists('WC')) {
		return new WP_Error('woocommerce_missing', 'WooCommerce is not active.', ['status' => 500]);
	}

	$woocommerce = WC();
	if (!$woocommerce) {
		return new WP_Error('woocommerce_unavailable', 'WooCommerce instance is unavailable.', ['status' => 500]);
	}

	return true;
}

/**
 * @param array<int, array{productId:int,quantity:int}> $items
 * @return array<int, int> Ordered unique candidate product IDs (upsells + cross-sells).
 */
function pb_side_cart_upsells_collect_candidate_ids(array $items) {
	$candidates = [];
	$seen = [];

	foreach ($items as $row) {
		$pid = isset($row['productId']) ? absint($row['productId']) : 0;
		if ($pid <= 0) {
			continue;
		}

		$product = wc_get_product($pid);
		if (!$product) {
			continue;
		}

		$base_id = $product->is_type('variation') ? (int) $product->get_parent_id() : $pid;
		$parent = $base_id !== $pid ? wc_get_product($base_id) : $product;
		if (!$parent) {
			continue;
		}

		$upsell_ids = $parent->get_upsell_ids();
		if (is_array($upsell_ids)) {
			foreach ($upsell_ids as $uid) {
				$uid = absint($uid);
				if ($uid > 0 && !isset($seen[$uid])) {
					$seen[$uid] = true;
					$candidates[] = $uid;
				}
			}
		}

		$cross_ids = $parent->get_cross_sell_ids();
		if (is_array($cross_ids)) {
			foreach ($cross_ids as $cid) {
				$cid = absint($cid);
				if ($cid > 0 && !isset($seen[$cid])) {
					$seen[$cid] = true;
					$candidates[] = $cid;
				}
			}
		}
	}

	return $candidates;
}

/**
 * @param WC_Product $product
 */
function pb_side_cart_upsells_product_is_eligible($product, array $cart_product_ids) {
	if (!$product->is_purchasable()) {
		return false;
	}
	if (!$product->is_in_stock()) {
		return false;
	}
	$pid = (int) $product->get_id();
	if (isset($cart_product_ids[$pid])) {
		return false;
	}
	return true;
}

/**
 * @return array<string, mixed>
 */
function pb_side_cart_upsells_format_product(WC_Product $product) {
	$id = (int) $product->get_id();
	$regular = $product->get_regular_price();
	$price_numeric = (float) wc_get_price_to_display($product, ['qty' => 1]);
	$on_sale = $product->is_on_sale();

	$price_html = html_entity_decode(wp_strip_all_tags(wc_price($price_numeric)), ENT_QUOTES, 'UTF-8');

	$regular_label = '';
	if ($regular !== '' && $regular !== null && $on_sale) {
		$regular_display = (float) wc_get_price_to_display($product, ['qty' => 1, 'price' => (float) $regular]);
		$regular_label = html_entity_decode(wp_strip_all_tags(wc_price($regular_display)), ENT_QUOTES, 'UTF-8');
	}

	$image_id = $product->get_image_id();
	$image_url = $image_id ? (string) wp_get_attachment_image_url($image_id, 'woocommerce_thumbnail') : '';
	if ($image_url === '' && $product->is_type('variation')) {
		$parent = wc_get_product($product->get_parent_id());
		if ($parent) {
			$parent_image_id = $parent->get_image_id();
			if ($parent_image_id) {
				$image_url = (string) wp_get_attachment_image_url($parent_image_id, 'woocommerce_thumbnail');
			}
		}
	}

	return [
		'databaseId' => $id,
		'slug' => (string) $product->get_slug(),
		'name' => (string) $product->get_name(),
		'price' => $price_html,
		'priceNumeric' => round($price_numeric, 2),
		'regularPrice' => $on_sale && $regular_label !== '' ? $regular_label : null,
		'onSale' => $on_sale,
		'imageUrl' => $image_url,
		'imageAlt' => $image_id ? (string) get_post_meta($image_id, '_wp_attachment_image_alt', true) : '',
	];
}

function pb_side_cart_upsells_handler(WP_REST_Request $request) {
	try {
		$secret_ok = pb_side_cart_upsells_validate_secret($request);
		if (is_wp_error($secret_ok)) {
			return $secret_ok;
		}

		$boot_ok = pb_side_cart_upsells_bootstrap_wc();
		if (is_wp_error($boot_ok)) {
			return $boot_ok;
		}

		$params = $request->get_json_params();
		if (!is_array($params)) {
			$params = [];
		}

		$items = $params['items'] ?? [];
		if (!is_array($items)) {
			return new WP_Error('invalid_items', 'items must be an array.', ['status' => 400]);
		}

		$normalized = [];
		foreach ($items as $row) {
			if (!is_array($row)) {
				continue;
			}
			$product_id = absint($row['productId'] ?? $row['product_id'] ?? 0);
			$quantity = isset($row['quantity']) ? max(1, absint($row['quantity'])) : 1;
			if ($product_id > 0) {
				$normalized[] = ['productId' => $product_id, 'quantity' => $quantity];
			}
		}

		$cart_product_ids = [];
		foreach ($normalized as $row) {
			$cart_product_ids[$row['productId']] = true;
		}

		$candidate_ids = pb_side_cart_upsells_collect_candidate_ids($normalized);

		$upsells = [];
		foreach ($candidate_ids as $cid) {
			if (count($upsells) >= PB_SIDE_CART_UPSELLS_MAX) {
				break;
			}
			if (isset($cart_product_ids[$cid])) {
				continue;
			}

			$candidate = wc_get_product($cid);
			if (!$candidate) {
				continue;
			}

			if ($candidate->is_type('variable')) {
				$children = $candidate->get_children();
				$chosen = null;
				foreach ($children as $child_id) {
					$variation = wc_get_product($child_id);
					if ($variation && pb_side_cart_upsells_product_is_eligible($variation, $cart_product_ids)) {
						$chosen = $variation;
						break;
					}
				}
				if (!$chosen) {
					continue;
				}
				$upsells[] = pb_side_cart_upsells_format_product($chosen);
				$cart_product_ids[(int) $chosen->get_id()] = true;
				continue;
			}

			if (!pb_side_cart_upsells_product_is_eligible($candidate, $cart_product_ids)) {
				continue;
			}

			$upsells[] = pb_side_cart_upsells_format_product($candidate);
			$cart_product_ids[$cid] = true;
		}

		return rest_ensure_response([
			'ok' => true,
			'upsells' => $upsells,
		]);
	} catch (Throwable $e) {
		error_log('[pb-side-cart-upsells] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
		return new WP_Error(
			'internal_server_error',
			'Side cart upsells failed. Check wp-content/debug.log for details.',
			['status' => 500]
		);
	}
}
