<?php
/**
 * PB Shipping Quote endpoint (hardened)
 *
 * Version: 1.0.0
 * Updated: 2026-07-09
 *
 * Install as:
 * - mu-plugin: wp-content/mu-plugins/pb-shipping-quote.php (recommended), OR
 * - Code Snippets plugin (PHP snippet, run everywhere)
 *
 * Routes:
 * - POST /wp-json/pb/v1/shipping-quote
 * - GET  /wp-json/pb/v1/shipping-quote/health
 *
 * Check installed version: GET /wp-json/pb/v1/shipping-quote/health → snippetVersion
 * Inventory / deploy: docs/wordpress/SNIPPETS.md
 */

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_SHIPPING_QUOTE_SNIPPET_VERSION')) {
	define('PB_SHIPPING_QUOTE_SNIPPET_VERSION', '1.0.0');
}

add_action('rest_api_init', function () {
	register_rest_route('pb/v1', '/shipping-quote', [
		'methods' => 'POST',
		'callback' => 'pb_shipping_quote_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/shipping-quote/health', [
		'methods' => 'GET',
		'callback' => 'pb_shipping_quote_health_handler',
		'permission_callback' => '__return_true',
	]);
});

function pb_shipping_quote_health_handler(WP_REST_Request $request) {
	$rest_ready = class_exists('WooCommerce') && function_exists('WC');
	return rest_ensure_response([
		'ok' => true,
		'route' => 'pb/v1/shipping-quote',
		'snippetVersion' => PB_SHIPPING_QUOTE_SNIPPET_VERSION,
		'woocommerce_ready' => $rest_ready,
	]);
}

function pb_shipping_quote_validate_secret(WP_REST_Request $request) {
	/**
	 * Optional secret:
	 * define('PB_SHIPPING_QUOTE_SECRET', 'your-secret');
	 */
	$expected = defined('PB_SHIPPING_QUOTE_SECRET') ? (string) PB_SHIPPING_QUOTE_SECRET : '';
	if ($expected === '') {
		return true;
	}

	$provided = (string) $request->get_header('x-pb-shipping-secret');
	if ($provided !== '' && hash_equals($expected, $provided)) {
		return true;
	}

	return new WP_Error('forbidden', 'Invalid shipping quote secret.', ['status' => 403]);
}

function pb_shipping_quote_bootstrap_wc() {
	if (!class_exists('WooCommerce') || !function_exists('WC')) {
		return new WP_Error('woocommerce_missing', 'WooCommerce is not active.', ['status' => 500]);
	}

	$woocommerce = WC();
	if (!$woocommerce) {
		return new WP_Error('woocommerce_unavailable', 'WooCommerce instance is unavailable.', ['status' => 500]);
	}

	// Session
	if (null === $woocommerce->session) {
		$session_class = apply_filters('woocommerce_session_handler', 'WC_Session_Handler');
		if (!class_exists($session_class)) {
			return new WP_Error('session_handler_missing', 'WooCommerce session handler is missing.', ['status' => 500]);
		}
		$woocommerce->session = new $session_class();
		$woocommerce->session->init();
	}

	// Customer
	if (null === $woocommerce->customer || !is_a($woocommerce->customer, 'WC_Customer')) {
		$woocommerce->customer = new WC_Customer(get_current_user_id(), true);
	}

	// Cart
	if (null === $woocommerce->cart || !is_a($woocommerce->cart, 'WC_Cart')) {
		$woocommerce->cart = new WC_Cart();
	}

	return true;
}

function pb_shipping_quote_get_payload(WP_REST_Request $request) {
	$payload = $request->get_json_params();
	if (!is_array($payload)) {
		$payload = [];
	}

	// Also support query/body params for easier manual testing.
	foreach (['country', 'postcode', 'postalCode', 'product_id', 'productId', 'quantity'] as $key) {
		$value = $request->get_param($key);
		if ($value !== null && !array_key_exists($key, $payload)) {
			$payload[$key] = $value;
		}
	}

	return $payload;
}

function pb_shipping_quote_handler(WP_REST_Request $request) {
	try {
		$secret_ok = pb_shipping_quote_validate_secret($request);
		if (is_wp_error($secret_ok)) {
			return $secret_ok;
		}

		$boot_ok = pb_shipping_quote_bootstrap_wc();
		if (is_wp_error($boot_ok)) {
			return $boot_ok;
		}

		$payload = pb_shipping_quote_get_payload($request);
		$country = strtoupper(sanitize_text_field((string) ($payload['country'] ?? '')));
		$postcode = sanitize_text_field((string) ($payload['postcode'] ?? $payload['postalCode'] ?? ''));
		$product_id = absint($payload['product_id'] ?? $payload['productId'] ?? 0);
		$quantity = max(1, absint($payload['quantity'] ?? 1));

		if ($country === '' || $postcode === '') {
			return new WP_Error('invalid_address', 'country and postcode are required.', ['status' => 400]);
		}
		if ($product_id <= 0) {
			return new WP_Error('invalid_product', 'product_id is required.', ['status' => 400]);
		}

		$product = wc_get_product($product_id);
		if (!$product) {
			return new WP_Error('product_not_found', 'Product not found.', ['status' => 404]);
		}
		if (!$product->needs_shipping()) {
			return rest_ensure_response([
				'ok' => true,
				'methods' => [],
				'notes' => ['Product does not require shipping.'],
			]);
		}

		$customer = WC()->customer;
		$customer->set_shipping_country($country);
		$customer->set_shipping_postcode($postcode);
		$customer->set_shipping_state('');
		$customer->set_shipping_city('');
		$customer->set_shipping_address('');
		$customer->set_shipping_address_2('');

		$line_total = (float) wc_get_price_excluding_tax($product, ['qty' => $quantity]);
		$package = [
			'contents' => [
				'pb_quote_' . $product_id => [
					'key' => 'pb_quote_' . $product_id,
					'product_id' => $product_id,
					'variation_id' => 0,
					'variation' => [],
					'quantity' => $quantity,
					'data' => $product,
					'line_subtotal' => $line_total,
					'line_total' => $line_total,
					'line_subtotal_tax' => 0,
					'line_tax' => 0,
					'line_tax_data' => ['subtotal' => [], 'total' => []],
				],
			],
			'contents_cost' => $line_total,
			'applied_coupons' => [],
			'user' => ['ID' => get_current_user_id()],
			'destination' => [
				'country' => $country,
				'state' => '',
				'postcode' => $postcode,
				'city' => '',
				'address' => '',
				'address_2' => '',
			],
			'cart_subtotal' => $line_total,
		];

		$packages = [$package];
		$packages = apply_filters('woocommerce_cart_shipping_packages', $packages);

		WC()->shipping()->reset_shipping();
		WC()->shipping()->calculate_shipping($packages);

		$calculated_packages = WC()->shipping()->get_packages();
		$rates = [];
		if (!empty($calculated_packages[0]['rates']) && is_array($calculated_packages[0]['rates'])) {
			$rates = $calculated_packages[0]['rates'];
		} elseif (!empty($packages[0]['rates']) && is_array($packages[0]['rates'])) {
			$rates = $packages[0]['rates'];
		}

		$methods = [];
		foreach ($rates as $rate_id => $rate) {
			if (!is_a($rate, 'WC_Shipping_Rate')) {
				continue;
			}
			$cost = (float) $rate->get_cost();
			$taxes = $rate->get_taxes();
			$tax_total = 0.0;
			if (is_array($taxes)) {
				foreach ($taxes as $tax) {
					$tax_total += (float) $tax;
				}
			}
			$total = $cost + $tax_total;

			$methods[] = [
				'id' => (string) $rate_id,
				'name' => (string) $rate->get_label(),
				'price' => $total,
				'priceLabel' => html_entity_decode(wp_strip_all_tags(wc_price($total)), ENT_QUOTES, 'UTF-8'),
			];
		}

		return rest_ensure_response([
			'ok' => true,
			'methods' => $methods,
		]);
	} catch (Throwable $e) {
		error_log('[pb-shipping-quote] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
		return new WP_Error(
			'internal_server_error',
			'Shipping quote failed. Check wp-content/debug.log for details.',
			['status' => 500]
		);
	}
}
