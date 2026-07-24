<?php
/**
 * PB Side cart order bumps (CheckoutWC / Checkout for WooCommerce)
 *
 * Version: 1.1.0
 * Updated: 2026-07-21
 *
 * Install as:
 * - Code Snippets plugin (PHP snippet, run everywhere) — agent deploys via API
 *   (see docs/wordpress/SNIPPETS.md). Do not dual-enable legacy headless-cart-sync.
 *
 * Requires: WooCommerce + Checkout for WooCommerce (Objectiv) with Order Bumps feature.
 *
 * Routes:
 * - POST /wp-json/pb/v1/side-cart-order-bumps
 * - GET  /wp-json/pb/v1/side-cart-order-bumps/health
 * - GET  /wp-json/pb/v1/cart-sync?items=JSON[&redirect=1]
 *
 * Check installed version: GET /wp-json/pb/v1/side-cart-order-bumps/health → snippetVersion
 * Inventory / deploy: docs/wordpress/SNIPPETS.md
 *
 * Request body (JSON):
 * { "items": [ { "productId": 123, "quantity": 1 }, ... ] }
 *
 * Response (JSON): same shape as legacy side-cart-upsells for Next.js compatibility:
 * { "ok": true, "upsells": [ { "databaseId", "slug", "name", "price", "priceNumeric", "regularPrice", "onSale", "imageUrl", "imageAlt" } ] }
 *
 * Behaviour:
 * - Replays items into a temporary WC cart (REST bootstrap) so CFW bump rules see real cart contents.
 * - Uses BumpFactory::get_all() and each bump's is_displayable(), plus cfw_display_bump filter.
 * - Includes bumps whose display location is checkout or side cart; excludes post-purchase one-click and after-submit modal bumps.
 * - Prices: unit display price after bump discount (matches CFW bump pricing); strikethrough when bump reduces price vs regular display price.
 *
 * Guest-only: REST calls have no logged-in WP user. Customer-history rules in CFW typically do not apply to guests (see CheckoutWC docs).
 *
 * Optional secret (define in wp-config.php), same as upsells snippet for easy rollout:
 *   define('PB_SIDE_CART_UPSELLS_SECRET', 'your-secret');
 * Or dedicated:
 *   define('PB_SIDE_CART_ORDER_BUMPS_SECRET', 'your-secret');
 * Headers accepted: X-PB-Side-Cart-Order-Bumps-Secret or X-PB-Side-Cart-Upsells-Secret
 *
 * Manual test:
 * curl -sS "https://YOUR_HOST/wp-json/pb/v1/side-cart-order-bumps/health"
 * curl -sS -X POST "https://YOUR_HOST/wp-json/pb/v1/side-cart-order-bumps" \
 *   -H "Content-Type: application/json" \
 *   -d '{"items":[{"productId":123,"quantity":1}]}'
 *
 * Headless checkout cart sync (same snippet):
 * - GET /wp-json/pb/v1/cart-sync?items=[{"productId":123,"quantity":1}]&redirect=1
 * - Without redirect=1: returns { ok: true }, sets Woo cart cookies (warm sync).
 * - Replays the cart on WordPress; second empty/add pass only when CheckoutWC bump
 *   unit sale prices must persist (cart item data + woocommerce_before_calculate_totals).
 * - Response header X-PB-Cart-Sync-Ms: duration in milliseconds (debug).
 *
 * Optional hardening (wp-config.php): define('PB_CART_SYNC_SECRET', '...');
 * Then pass matching query arg: &secret=...
 *
 * Changelog:
 * - 1.1.0 (2026-07-21) — Slim cart-sync: single empty/add/totals when no bump sale
 *   map; keep second replay only for persistent bump unit prices. Non-redirect mode
 *   still returns {ok:true} + cookies. Adds X-PB-Cart-Sync-Ms timing header.
 * - 1.0.0 (2026-07-09) — Side-cart bumps API + cart-sync with bump price persistence.
 */

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_SIDE_CART_ORDER_BUMPS_SNIPPET_VERSION')) {
	define('PB_SIDE_CART_ORDER_BUMPS_SNIPPET_VERSION', '1.1.0');
}

const PB_SIDE_CART_ORDER_BUMPS_MAX = 10;

/** Display locations not surfaced in the headless side cart (modal / thank-you flows). */
const PB_CFW_HEADLESS_EXCLUDED_DISPLAY_LOCATIONS = [
	'post_purchase_one_click',
	'complete_order',
];

add_action('rest_api_init', function () {
	register_rest_route('pb/v1', '/side-cart-order-bumps', [
		'methods' => 'POST',
		'callback' => 'pb_side_cart_order_bumps_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/side-cart-order-bumps/health', [
		'methods' => 'GET',
		'callback' => 'pb_side_cart_order_bumps_health_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/cart-sync', [
		'methods' => 'GET',
		'callback' => 'pb_cart_sync_rest_handler',
		'permission_callback' => '__return_true',
	]);
});

function pb_side_cart_order_bumps_health_handler(WP_REST_Request $request) {
	$wc = class_exists('WooCommerce') && function_exists('WC');
	$cfw = class_exists('\Objectiv\Plugins\Checkout\Factories\BumpFactory');
	$post_type = $wc && $cfw && class_exists('\Objectiv\Plugins\Checkout\Model\Bumps\BumpAbstract')
		? (string) \Objectiv\Plugins\Checkout\Model\Bumps\BumpAbstract::get_post_type()
		: '';

	return rest_ensure_response([
		'ok' => true,
		'route' => 'pb/v1/side-cart-order-bumps',
		'snippetVersion' => PB_SIDE_CART_ORDER_BUMPS_SNIPPET_VERSION,
		'cart_sync_route' => 'pb/v1/cart-sync',
		'woocommerce_ready' => $wc,
		'checkoutwc_bump_factory_ready' => $cfw,
		'cfw_order_bump_post_type' => $post_type,
	]);
}

function pb_side_cart_order_bumps_expected_secret(): string {
	if (defined('PB_SIDE_CART_ORDER_BUMPS_SECRET') && (string) PB_SIDE_CART_ORDER_BUMPS_SECRET !== '') {
		return (string) PB_SIDE_CART_ORDER_BUMPS_SECRET;
	}
	if (defined('PB_SIDE_CART_UPSELLS_SECRET') && (string) PB_SIDE_CART_UPSELLS_SECRET !== '') {
		return (string) PB_SIDE_CART_UPSELLS_SECRET;
	}
	return '';
}

function pb_side_cart_order_bumps_validate_secret(WP_REST_Request $request) {
	$expected = pb_side_cart_order_bumps_expected_secret();
	if ($expected === '') {
		return true;
	}

	$provided = (string) $request->get_header('x-pb-side-cart-order-bumps-secret');
	if ($provided === '') {
		$provided = (string) $request->get_header('x-pb-side-cart-upsells-secret');
	}
	if ($provided !== '' && hash_equals($expected, $provided)) {
		return true;
	}

	return new WP_Error('forbidden', 'Invalid side cart order bumps secret.', ['status' => 403]);
}

function pb_side_cart_order_bumps_bootstrap_wc() {
	if (!class_exists('WooCommerce') || !function_exists('WC')) {
		return new WP_Error('woocommerce_missing', 'WooCommerce is not active.', ['status' => 500]);
	}

	$woocommerce = WC();
	if (!$woocommerce) {
		return new WP_Error('woocommerce_unavailable', 'WooCommerce instance is unavailable.', ['status' => 500]);
	}

	if (null === $woocommerce->session) {
		$session_class = apply_filters('woocommerce_session_handler', 'WC_Session_Handler');
		if (!class_exists($session_class)) {
			return new WP_Error('session_handler_missing', 'WooCommerce session handler is missing.', ['status' => 500]);
		}
		$woocommerce->session = new $session_class();
		$woocommerce->session->init();
	}

	if (null === $woocommerce->customer || !is_a($woocommerce->customer, 'WC_Customer')) {
		$woocommerce->customer = new WC_Customer(get_current_user_id(), true);
	}

	if (null === $woocommerce->cart || !is_a($woocommerce->cart, 'WC_Cart')) {
		$woocommerce->cart = new WC_Cart();
	}

	return true;
}

/**
 * @param object $bump BumpAbstract instance
 */
function pb_side_cart_order_bumps_get_display_location($bump): string {
	$ref = new ReflectionClass($bump);
	if (!$ref->hasMethod('get_display_location')) {
		return 'below_cart_items';
	}
	$m = $ref->getMethod('get_display_location');
	if ($m->isPublic()) {
		return (string) $bump->get_display_location();
	}
	$m->setAccessible(true);
	return (string) $m->invoke($bump);
}

/**
 * @param object $bump
 */
function pb_side_cart_order_bumps_is_published($bump): bool {
	if (is_object($bump) && method_exists($bump, 'is_published')) {
		return (bool) $bump->is_published();
	}
	$id = method_exists($bump, 'get_id') ? (int) $bump->get_id() : 0;
	return $id > 0 && get_post_status($id) === 'publish';
}

/**
 * @param object $bump
 * @return WC_Product|null
 */
function pb_side_cart_order_bumps_resolve_offer_product($bump) {
	$ref = new ReflectionClass($bump);
	if (!$ref->hasMethod('get_offer_product')) {
		return null;
	}
	$m = $ref->getMethod('get_offer_product');
	$m->setAccessible(true);
	$product = $m->invoke($bump);
	if (!($product instanceof WC_Product)) {
		return null;
	}

	if ($product->is_type('variable') && $ref->hasMethod('get_matched_variation_attributes_from_cart_search_product')) {
		$mv = $ref->getMethod('get_matched_variation_attributes_from_cart_search_product');
		$mv->setAccessible(true);
		$matched = $mv->invoke($bump, $product);
		if (is_object($matched) && method_exists($matched, 'get_id')) {
			$vid = $matched->get_id();
			if (!empty($vid)) {
				$var = wc_get_product((int) $vid);
				if ($var instanceof WC_Product) {
					return $var;
				}
			}
		}
	}

	if ($product->is_type('variable')) {
		foreach ($product->get_children() as $child_id) {
			$variation = wc_get_product((int) $child_id);
			if ($variation && $variation->is_purchasable() && ($variation->is_in_stock() || $variation->backorders_allowed())) {
				return $variation;
			}
		}
	}

	return $product;
}

/**
 * Bump discount unit (same basis as CheckoutWC BumpAbstract::get_offer_product_sale_price)
 * applied to the resolved offer product (variation or simple). Using meta avoids 0 prices when
 * CFW's internal get_offer_product() is still a variable parent while the cart matched a variation.
 *
 * @param object $bump BumpAbstract instance
 */
function pb_side_cart_order_bumps_compute_sale_unit_base(WC_Product $product, $bump): float {
	$bid = method_exists($bump, 'get_id') ? (int) $bump->get_id() : 0;
	if ($bid <= 0) {
		return 0.0;
	}

	$discount_type = (string) get_post_meta($bid, 'cfw_ob_discount_type', true);
	$discount = (float) get_post_meta($bid, 'cfw_ob_offer_discount', true);

	if (wc_prices_include_tax()) {
		$price = (float) wc_get_price_including_tax($product);
	} else {
		$price = (float) wc_get_price_excluding_tax($product);
	}

	$discount_value = 'percent' === $discount_type ? ($price / 100) * $discount : $discount;

	return max(0.0, $price - $discount_value);
}

/**
 * @return array<string, mixed>
 */
function pb_side_cart_order_bumps_format_product(WC_Product $product, float $bump_sale_unit_base) {
	$id = (int) $product->get_id();

	$catalog_display = (float) wc_get_price_to_display($product, ['qty' => 1]);
	$sale_display = (float) wc_get_price_to_display($product, [
		'qty' => 1,
		'price' => $bump_sale_unit_base,
	]);

	if ($sale_display <= 0 && $catalog_display > 0) {
		$sale_display = $catalog_display;
	}

	$has_bump_discount = $catalog_display > $sale_display + 0.0001;

	$price_html = html_entity_decode(wp_strip_all_tags(wc_price($sale_display)), ENT_QUOTES, 'UTF-8');

	$regular_label = '';
	if ($has_bump_discount && $catalog_display > 0) {
		$regular_label = html_entity_decode(wp_strip_all_tags(wc_price($catalog_display)), ENT_QUOTES, 'UTF-8');
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
		'priceNumeric' => round($sale_display, 2),
		'regularPrice' => $has_bump_discount && $regular_label !== '' ? $regular_label : null,
		'onSale' => $has_bump_discount,
		'imageUrl' => $image_url,
		'imageAlt' => $image_id ? (string) get_post_meta($image_id, '_wp_attachment_image_alt', true) : '',
	];
}

/**
 * @return \Objectiv\Plugins\Checkout\Model\Bumps\BumpAbstract[]
 */
function pb_side_cart_order_bumps_factory_get_all(): array {
	if (!class_exists('\Objectiv\Plugins\Checkout\Factories\BumpFactory')) {
		return [];
	}
	try {
		$rm = new ReflectionMethod('\Objectiv\Plugins\Checkout\Factories\BumpFactory', 'get_all');
		if ($rm->getNumberOfParameters() >= 1) {
			return \Objectiv\Plugins\Checkout\Factories\BumpFactory::get_all('publish');
		}
		return \Objectiv\Plugins\Checkout\Factories\BumpFactory::get_all();
	} catch (Throwable $e) {
		return \Objectiv\Plugins\Checkout\Factories\BumpFactory::get_all();
	}
}

/**
 * @param array<int, array{productId:int,quantity:int}> $items
 */
function pb_side_cart_order_bumps_replay_cart(array $items): void {
	$cart = WC()->cart;
	$cart->empty_cart(true);

	foreach ($items as $row) {
		$pid = (int) ($row['productId'] ?? 0);
		$qty = max(1, (int) ($row['quantity'] ?? 1));
		if ($pid <= 0) {
			continue;
		}

		$product = wc_get_product($pid);
		if (!$product) {
			continue;
		}

		if ($product->is_type('variation')) {
			$parent_id = (int) $product->get_parent_id();
			$cart->add_to_cart($parent_id, $qty, $pid, $product->get_variation_attributes(), []);
			continue;
		}

		$cart->add_to_cart($pid, $qty);
	}

	$cart->calculate_totals();
}

function pb_side_cart_order_bumps_location_allowed(string $location): bool {
	if ($location === '') {
		return false;
	}
	return !in_array($location, PB_CFW_HEADLESS_EXCLUDED_DISPLAY_LOCATIONS, true);
}

function pb_side_cart_order_bumps_handler(WP_REST_Request $request) {
	try {
		$secret_ok = pb_side_cart_order_bumps_validate_secret($request);
		if (is_wp_error($secret_ok)) {
			return $secret_ok;
		}

		if (!class_exists('\Objectiv\Plugins\Checkout\Factories\BumpFactory')) {
			return new WP_Error(
				'checkoutwc_missing',
				'Checkout for WooCommerce (order bumps) is not available.',
				['status' => 500]
			);
		}

		$boot_ok = pb_side_cart_order_bumps_bootstrap_wc();
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

		if ($normalized === []) {
			return rest_ensure_response([
				'ok' => true,
				'upsells' => [],
			]);
		}

		pb_side_cart_order_bumps_replay_cart($normalized);

		$bumps = pb_side_cart_order_bumps_factory_get_all();
		$out = [];
		$seen_offer_ids = [];

		foreach ($bumps as $bump) {
			if (count($out) >= PB_SIDE_CART_ORDER_BUMPS_MAX) {
				break;
			}

			if (!pb_side_cart_order_bumps_is_published($bump)) {
				continue;
			}

			$location = pb_side_cart_order_bumps_get_display_location($bump);
			if (!pb_side_cart_order_bumps_location_allowed($location)) {
				continue;
			}

			$eligible = $bump->is_displayable();
			$eligible = (bool) apply_filters('cfw_display_bump', $eligible, $bump, $location);
			if (!$eligible) {
				continue;
			}

			$offer = pb_side_cart_order_bumps_resolve_offer_product($bump);
			if (!$offer instanceof WC_Product) {
				continue;
			}

			$oid = (int) $offer->get_id();
			if (isset($seen_offer_ids[$oid])) {
				continue;
			}
			$seen_offer_ids[$oid] = true;

			$sale_base = pb_side_cart_order_bumps_compute_sale_unit_base($offer, $bump);
			$out[] = pb_side_cart_order_bumps_format_product($offer, $sale_base);
		}

		WC()->cart->empty_cart(true);

		return rest_ensure_response([
			'ok' => true,
			'upsells' => $out,
		]);
	} catch (Throwable $e) {
		if (function_exists('WC') && WC()->cart) {
			WC()->cart->empty_cart(true);
		}
		error_log('[pb-side-cart-order-bumps] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
		return new WP_Error(
			'internal_server_error',
			'Side cart order bumps failed. Check wp-content/debug.log for details.',
			['status' => 500]
		);
	}
}


/**
 * Optional query secret for headless cart sync GET (wp-config.php).
 *
 * @return true|WP_Error
 */
function pb_cart_sync_validate_query_secret(WP_REST_Request $request) {
	if (!defined('PB_CART_SYNC_SECRET') || (string) PB_CART_SYNC_SECRET === '') {
		return true;
	}

	$expected = (string) PB_CART_SYNC_SECRET;
	$provided = (string) $request->get_param('secret');
	if ($provided !== '' && hash_equals($expected, $provided)) {
		return true;
	}

	return new WP_Error('forbidden', 'Ugyldig cart sync-nøkkel.', ['status' => 403]);
}

/**
 * Build map variation/simple product id => bump sale unit (same basis as compute_sale_unit_base).
 *
 * @return array<int, float>
 */
function pb_side_cart_order_bumps_build_bump_sale_map(WC_Cart $cart): array {
	if (!class_exists('\Objectiv\Plugins\Checkout\Factories\BumpFactory')) {
		return [];
	}

	$line_ids = [];
	foreach ($cart->get_cart() as $cart_item) {
		if (!empty($cart_item['data']) && $cart_item['data'] instanceof WC_Product) {
			$line_ids[(int) $cart_item['data']->get_id()] = true;
		}
	}

	if ($line_ids === []) {
		return [];
	}

	$bumps = pb_side_cart_order_bumps_factory_get_all();
	$map = [];
	$assigned = [];

	foreach ($bumps as $bump) {
		if (!pb_side_cart_order_bumps_is_published($bump)) {
			continue;
		}

		$location = pb_side_cart_order_bumps_get_display_location($bump);
		if (!pb_side_cart_order_bumps_location_allowed($location)) {
			continue;
		}

		$eligible = $bump->is_displayable();
		$eligible = (bool) apply_filters('cfw_display_bump', $eligible, $bump, $location);
		if (!$eligible) {
			continue;
		}

		$offer = pb_side_cart_order_bumps_resolve_offer_product($bump);
		if (!$offer instanceof WC_Product) {
			continue;
		}

		$oid = (int) $offer->get_id();
		if (!isset($line_ids[$oid]) || isset($assigned[$oid])) {
			continue;
		}

		$sale_base = pb_side_cart_order_bumps_compute_sale_unit_base($offer, $bump);
		if ($sale_base <= 0) {
			continue;
		}

		$map[$oid] = $sale_base;
		$assigned[$oid] = true;
	}

	return $map;
}

/**
 * Replay cart from headless lines. When CheckoutWC bump unit sale prices apply,
 * do a second empty/add so prices persist in cart item data for
 * woocommerce_before_calculate_totals. When the bump sale map is empty, keep a
 * single empty/add/totals pass (faster warm sync + common checkout path).
 *
 * @param array<int, array{productId:int,quantity:int}> $items
 */
function pb_side_cart_order_bumps_replay_cart_with_persistent_bump_prices(array $items): void {
	pb_side_cart_order_bumps_replay_cart($items);

	$sale_map = pb_side_cart_order_bumps_build_bump_sale_map(WC()->cart);
	if ($sale_map === []) {
		return;
	}

	$cart = WC()->cart;
	$cart->empty_cart(true);

	foreach ($items as $row) {
		$pid = (int) ($row['productId'] ?? 0);
		$qty = max(1, (int) ($row['quantity'] ?? 1));
		if ($pid <= 0) {
			continue;
		}

		$product = wc_get_product($pid);
		if (!$product) {
			continue;
		}

		$cart_item_data = [];
		if (isset($sale_map[$pid])) {
			$cart_item_data['pb_cfw_bump_unit_sale'] = (float) $sale_map[$pid];
		}

		if ($product->is_type('variation')) {
			$parent_id = (int) $product->get_parent_id();
			$cart->add_to_cart($parent_id, $qty, $pid, $product->get_variation_attributes(), $cart_item_data);
			continue;
		}

		$cart->add_to_cart($pid, $qty, 0, [], $cart_item_data);
	}

	$cart->calculate_totals();
}

/**
 * Apply pb_cfw_bump_unit_sale from cart item data (persisted in session) each totals pass.
 *
 * @param WC_Cart $cart
 */
function pb_side_cart_order_bumps_apply_stored_sale_prices_to_cart($cart): void {
	if (!($cart instanceof WC_Cart)) {
		return;
	}

	if ((is_admin() && !defined('DOING_AJAX')) || !$cart->get_cart_contents()) {
		return;
	}

	foreach ($cart->get_cart() as $cart_item) {
		if (empty($cart_item['pb_cfw_bump_unit_sale']) || empty($cart_item['data']) || !($cart_item['data'] instanceof WC_Product)) {
			continue;
		}

		$cart_item['data']->set_price((float) $cart_item['pb_cfw_bump_unit_sale']);
	}
}

/**
 * GET /wp-json/pb/v1/cart-sync?items=JSON[&redirect=1] — headless checkout handoff / warm sync.
 *
 * With redirect=1 (or true): 302 to Woo checkout after replaying the cart.
 * Without redirect: JSON { ok: true } and Woo session cookies (browser warm sync).
 *
 * @return WP_REST_Response|WP_Error
 */
function pb_cart_sync_rest_handler(WP_REST_Request $request) {
	$started = microtime(true);

	try {
		$secret_ok = pb_cart_sync_validate_query_secret($request);
		if (is_wp_error($secret_ok)) {
			return $secret_ok;
		}

		$boot_ok = pb_side_cart_order_bumps_bootstrap_wc();
		if (is_wp_error($boot_ok)) {
			return $boot_ok;
		}

		$items_raw = $request->get_param('items');
		if (!is_string($items_raw) || $items_raw === '') {
			return new WP_Error('invalid_items', 'Parameteret items mangler.', ['status' => 400]);
		}

		$items = json_decode($items_raw, true);
		if (!is_array($items)) {
			return new WP_Error('invalid_items', 'items må være en JSON-array.', ['status' => 400]);
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

		if ($normalized === []) {
			return new WP_Error('invalid_items', 'Ingen gyldige handlekurvlinjer.', ['status' => 400]);
		}

		pb_side_cart_order_bumps_replay_cart_with_persistent_bump_prices($normalized);

		if (WC()->cart) {
			WC()->cart->maybe_set_cart_cookies();
		}

		$elapsed_ms = (string) (int) round((microtime(true) - $started) * 1000);

		$redirect = (string) $request->get_param('redirect');
		if ($redirect !== '1' && strtolower($redirect) !== 'true') {
			$response = rest_ensure_response(['ok' => true]);
			$response->header('X-PB-Cart-Sync-Ms', $elapsed_ms);
			return $response;
		}

		$checkout_url = wc_get_checkout_url();
		$response = new WP_REST_Response(null, 302);
		$response->header('Location', $checkout_url);
		$response->header('X-PB-Cart-Sync-Ms', $elapsed_ms);
		return $response;
	} catch (Throwable $e) {
		error_log('[pb-cart-sync] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
		return new WP_Error(
			'internal_server_error',
			'Synkronisering av handlekurv feilet.',
			['status' => 500]
		);
	}
}

add_action('woocommerce_before_calculate_totals', 'pb_side_cart_order_bumps_apply_stored_sale_prices_to_cart', 15, 1);
