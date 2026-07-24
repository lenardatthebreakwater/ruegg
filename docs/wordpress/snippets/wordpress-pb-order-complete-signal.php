<?php
/**
 * PB Order complete signal (headless cart clear)
 *
 * Version: 1.0.0
 * Updated: 2026-07-22
 *
 * Install as: Code Snippets plugin (PHP snippet, "Run snippet everywhere").
 * Never as an mu-plugin.
 *
 * Why:
 * After same-domain cutover, Woo thank-you stays on /checkout/order-received/…
 * (WordPress). The Next.js cart lives in localStorage and is intentionally kept
 * when the shopper abandons checkout or uses browser Back.
 *
 * This snippet sets a short-lived first-party cookie on the order-received page
 * so the Next storefront can clear its local cart on the next visit — with no
 * work on the cart-sync / checkout handoff path.
 *
 * Does NOT touch cart-sync, side-cart bumps, or checkout performance.
 *
 * Changelog:
 * - 1.0.0: Set pb_order_complete cookie on successful order-received.
 */

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_ORDER_COMPLETE_SIGNAL_SNIPPET_VERSION')) {
	define('PB_ORDER_COMPLETE_SIGNAL_SNIPPET_VERSION', '1.0.0');
}

/** Cookie name — must match lib/cart/checkout-handoff.ts ORDER_COMPLETE_COOKIE_NAME. */
if (!defined('PB_ORDER_COMPLETE_COOKIE')) {
	define('PB_ORDER_COMPLETE_COOKIE', 'pb_order_complete');
}

/**
 * On Woo order-received (CheckoutWC / classic), set a JS-readable cookie for Next.
 * Runs on template_redirect so headers are still available.
 */
add_action('template_redirect', 'pb_order_complete_signal_set_cookie', 5);

function pb_order_complete_signal_set_cookie() {
	if (!function_exists('is_wc_endpoint_url') || !is_wc_endpoint_url('order-received')) {
		return;
	}

	if (empty($_GET['key']) || !function_exists('wc_get_order_id_by_order_key')) {
		return;
	}

	$order_key = wc_clean(wp_unslash($_GET['key']));
	if ($order_key === '') {
		return;
	}

	$order_id = wc_get_order_id_by_order_key($order_key);
	$order = $order_id ? wc_get_order($order_id) : false;
	if (!$order || $order->has_status('failed')) {
		return;
	}

	if (headers_sent()) {
		return;
	}

	$expires = time() + (2 * DAY_IN_SECONDS);
	setcookie(
		PB_ORDER_COMPLETE_COOKIE,
		(string) $order->get_id(),
		array(
			'expires' => $expires,
			'path' => '/',
			'secure' => is_ssl(),
			'httponly' => false,
			'samesite' => 'Lax',
		)
	);
}
