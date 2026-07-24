/**
 * PB Headless Cart Sync Redirect (Multi-item) — LEGACY / SUPERSEDED
 *
 * Version: 1.0.0
 * Updated: 2026-07-09
 *
 * Do not deploy if wordpress-pb-side-cart-order-bumps.php is active (same
 * /wp-json/pb/v1/cart-sync route). Prefer that snippet for headless checkout.
 * Inventory: docs/wordpress/SNIPPETS.md
 *
 * Creates: /wp-json/pb/v1/cart-sync
 *
 * Supports:
 * - GET  /wp-json/pb/v1/cart-sync?items=<urlencoded-json>&redirect=1
 * - POST /wp-json/pb/v1/cart-sync   with JSON body: { "items": [ { "productId": 123, "quantity": 2 } ] }
 *
 * Example items JSON:
 * [{"productId":59747,"quantity":1},{"productId":59748,"quantity":2}]
 *
 * No REST health endpoint — verify via file header Version only (or remove).
 */)

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_HEADLESS_CART_SYNC_SNIPPET_VERSION')) {
	define('PB_HEADLESS_CART_SYNC_SNIPPET_VERSION', '1.0.0');
}

add_action('rest_api_init', function () {
	register_rest_route('pb/v1', '/cart-sync', [
		[
			'methods'             => [WP_REST_Server::READABLE, WP_REST_Server::CREATABLE],
			'callback'            => 'pb_headless_cart_sync_handler',
			'permission_callback' => '__return_true', // public by design (session/cart scoped)
		],
	]);
});

function pb_headless_cart_sync_boot_woocommerce() {
	if (!function_exists('WC')) {
		return new WP_Error('woocommerce_missing', 'WooCommerce is not available.', ['status' => 500]);
	}

	// Ensure session exists (guest + logged-in)
	if (null === WC()->session) {
		$session_class = apply_filters('woocommerce_session_handler', 'WC_Session_Handler');
		WC()->session = new $session_class();
		WC()->session->init();
	}

	// Ensure customer exists
	if (null === WC()->customer) {
		WC()->customer = new WC_Customer(get_current_user_id(), true);
	}

	// Ensure cart exists
	if (null === WC()->cart) {
		WC()->cart = new WC_Cart();
	}

	return true;
}

function pb_headless_cart_sync_get_items(WP_REST_Request $request) {
	// 1) POST JSON body preferred
	$body_params = $request->get_json_params();
	if (is_array($body_params) && isset($body_params['items']) && is_array($body_params['items'])) {
		return $body_params['items'];
	}

	// 2) GET ?items=<urlencoded-json>
	$items_raw = $request->get_param('items');
	if (is_string($items_raw) && $items_raw !== '') {
		$decoded = json_decode(wp_unslash($items_raw), true);
		if (is_array($decoded)) {
			return $decoded;
		}
	}

	return new WP_Error('invalid_items', 'Missing or invalid items payload.', ['status' => 400]);
}

function pb_headless_cart_sync_handler(WP_REST_Request $request) {
	$boot = pb_headless_cart_sync_boot_woocommerce();
	if (is_wp_error($boot)) {
		return $boot;
	}

	$items = pb_headless_cart_sync_get_items($request);
	if (is_wp_error($items)) {
		return $items;
	}

	$normalized = [];
	foreach ($items as $item) {
		if (!is_array($item)) {
			continue;
		}

		$product_id = isset($item['productId']) ? absint($item['productId']) : 0;
		$quantity   = isset($item['quantity']) ? absint($item['quantity']) : 0;

		if ($product_id <= 0 || $quantity <= 0) {
			continue;
		}

		// Safety clamp
		$quantity = min($quantity, 99);

		$normalized[] = [
			'product_id' => $product_id,
			'quantity'   => $quantity,
		];
	}

	if (empty($normalized)) {
		return new WP_Error('empty_items', 'No valid cart items.', ['status' => 400]);
	}

	// Replace cart with synced payload
	WC()->cart->empty_cart(true);

	$failed = [];
	foreach ($normalized as $row) {
		$added = WC()->cart->add_to_cart($row['product_id'], $row['quantity']);
		if (!$added) {
			$failed[] = $row['product_id'];
		}
	}

	WC()->cart->calculate_totals();
	WC()->cart->set_session();
	WC()->cart->maybe_set_cart_cookies();

	$checkout_url = wc_get_checkout_url();
	$cart_url     = wc_get_cart_url();

	$redirect = $request->get_param('redirect');
	$should_redirect = in_array(strtolower((string) $redirect), ['1', 'true', 'yes'], true);

	if ($should_redirect) {
		wp_safe_redirect($checkout_url);
		exit;
	}

	return new WP_REST_Response([
		'ok'          => empty($failed),
		'failed'      => $failed,
		'checkoutUrl' => $checkout_url,
		'cartUrl'     => $cart_url,
		'itemCount'   => WC()->cart->get_cart_contents_count(),
	], 200);
}