<?php
/**
 * PB Auth endpoints (headless-friendly customer auth bridge)
 *
 * Version: 1.7.0
 * Updated: 2026-07-19
 *
 * Install as:
 * - Code Snippets plugin (PHP snippet, run everywhere) — agent deploys via API
 *   (see docs/wordpress/SNIPPETS.md). Do not use mu-plugins for this snippet.
 *
 * Routes:
 * - POST /wp-json/pb/v1/auth/login
 * - POST /wp-json/pb/v1/auth/signup
 * - GET  /wp-json/pb/v1/auth/me
 * - POST /wp-json/pb/v1/auth/logout
 * - POST /wp-json/pb/v1/auth/password/request-reset
 * - POST /wp-json/pb/v1/auth/password/reset
 * - POST /wp-json/pb/v1/auth/password/change   (logged-in: current + new password)
 * - GET  /wp-json/pb/v1/auth/orders            (thin wc_get_orders list)
 *     Query: limit, status (e.g. completed), includeLineItems=1
 *     Line-item slugs use parent product slug for variations.
 *     Skips orders with meta `_pb_hidden_from_customer` truthy.
 * - GET  /wp-json/pb/v1/auth/orders/{id}       (single owned order + line items)
 *     Hidden-from-customer orders return NOT_FOUND (same as non-owned).
 *     Includes datePaid, dateCompleted, and customerNotes (email + SMS).
 * - POST /wp-json/pb/v1/auth/orders/{id}/hide  (customer hides order from account)
 *     Only failed | cancelled | refunded. Sets `_pb_hidden_from_customer` = 1.
 *     Does NOT delete the WooCommerce order. Idempotent if already hidden.
 * - GET  /wp-json/pb/v1/auth/addresses         (billing + shipping)
 * - PUT  /wp-json/pb/v1/auth/addresses         (update billing and/or shipping)
 * - GET  /wp-json/pb/v1/auth/payment-methods   (saved payment tokens)
 * - DELETE /wp-json/pb/v1/auth/payment-methods/{id}
 * - POST /wp-json/pb/v1/auth/payment-methods/{id}/default
 * - POST /wp-json/pb/v1/auth/sso-code          (mint one-time login code, server-to-server)
 * - GET  /wp-json/pb/v1/auth/sso?code=...      (browser: logs in + redirects, e.g. to order-pay)
 * - GET  /wp-json/pb/v1/auth/health
 *
 * Check installed version: GET /wp-json/pb/v1/auth/health → snippetVersion
 * Inventory / deploy steps: docs/wordpress/SNIPPETS.md
 *
 * Changelog:
 * - 1.7.0 (2026-07-19) — customerNotes also includes standard WooCommerce
 *   “email sent” private notes (Email "…" sent. / Order details sent…).
 *   On WC < 10.9, logs successful customer emails as private notes via
 *   woocommerce_email_sent (skipped when core EmailLogger exists). Formats
 *   note bodies for Min konto (Norwegian-friendly labels). Still omits admin
 *   New order notes, SMS delivery noise, and failed-to-send notes.
 * - 1.6.0 (2026-07-19) — Order detail exposes datePaid, dateCompleted, and
 *   customerNotes: Woo customer-note emails + SMS notes from the "SMS To
 *   Customer" snippet (private notes with SMS + --- body). Omits internal
 *   admin / delivery-status notes.
 * - 1.5.0 (2026-07-18) — Hide order (POST .../orders/{id}/hide); list/detail
 *   respect `_pb_hidden_from_customer`; orders list supports includeLineItems=1
 *   (Min peis). Parent product slug on variation line items.
 * - 1.4.0 — Thin orders list/detail, addresses, payment methods, SSO.
 */

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_AUTH_SNIPPET_VERSION')) {
	define('PB_AUTH_SNIPPET_VERSION', '1.7.0');
}

if (!defined('PB_AUTH_ORDER_HIDDEN_META_KEY')) {
	define('PB_AUTH_ORDER_HIDDEN_META_KEY', '_pb_hidden_from_customer');
}

if (!defined('PB_AUTH_ORDERS_LIMIT')) {
	define('PB_AUTH_ORDERS_LIMIT', 30);
}

if (!defined('PB_AUTH_SSO_CODE_TTL')) {
	define('PB_AUTH_SSO_CODE_TTL', 2 * MINUTE_IN_SECONDS);
}

if (!defined('PB_AUTH_SHARED_SECRET')) {
	// Must match WORDPRESS_AUTH_SHARED_SECRET on the Next.js side.
	// Prefer overriding in wp-config.php:
	//   define('PB_AUTH_SHARED_SECRET', '...');
	define('PB_AUTH_SHARED_SECRET', 'pb_auth_2026_Y8sV3mL7qN2xH5kR9tP4wC6z');
}

if (!defined('PB_AUTH_TOKEN_TTL')) {
	define('PB_AUTH_TOKEN_TTL', 7 * DAY_IN_SECONDS);
}

add_action('rest_api_init', function () {
	register_rest_route('pb/v1', '/auth/login', [
		'methods' => 'POST',
		'callback' => 'pb_auth_login_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/auth/signup', [
		'methods' => 'POST',
		'callback' => 'pb_auth_signup_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/auth/me', [
		'methods' => 'GET',
		'callback' => 'pb_auth_me_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/auth/logout', [
		'methods' => 'POST',
		'callback' => 'pb_auth_logout_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/auth/password/request-reset', [
		'methods' => 'POST',
		'callback' => 'pb_auth_password_request_reset_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/auth/password/reset', [
		'methods' => 'POST',
		'callback' => 'pb_auth_password_reset_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/auth/password/change', [
		'methods' => 'POST',
		'callback' => 'pb_auth_password_change_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/auth/orders', [
		'methods' => 'GET',
		'callback' => 'pb_auth_orders_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/auth/orders/(?P<id>\d+)', [
		'methods' => 'GET',
		'callback' => 'pb_auth_order_by_id_handler',
		'permission_callback' => '__return_true',
		'args' => [
			'id' => [
				'required' => true,
				'type' => 'integer',
			],
		],
	]);

	register_rest_route('pb/v1', '/auth/orders/(?P<id>\d+)/hide', [
		'methods' => 'POST',
		'callback' => 'pb_auth_order_hide_handler',
		'permission_callback' => '__return_true',
		'args' => [
			'id' => [
				'required' => true,
				'type' => 'integer',
			],
		],
	]);

	register_rest_route('pb/v1', '/auth/addresses', [
		[
			'methods' => 'GET',
			'callback' => 'pb_auth_addresses_get_handler',
			'permission_callback' => '__return_true',
		],
		[
			'methods' => 'PUT',
			'callback' => 'pb_auth_addresses_put_handler',
			'permission_callback' => '__return_true',
		],
	]);

	register_rest_route('pb/v1', '/auth/payment-methods', [
		'methods' => 'GET',
		'callback' => 'pb_auth_payment_methods_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/auth/payment-methods/(?P<id>\d+)', [
		'methods' => 'DELETE',
		'callback' => 'pb_auth_payment_method_delete_handler',
		'permission_callback' => '__return_true',
		'args' => [
			'id' => [
				'required' => true,
				'type' => 'integer',
			],
		],
	]);

	register_rest_route('pb/v1', '/auth/payment-methods/(?P<id>\d+)/default', [
		'methods' => 'POST',
		'callback' => 'pb_auth_payment_method_default_handler',
		'permission_callback' => '__return_true',
		'args' => [
			'id' => [
				'required' => true,
				'type' => 'integer',
			],
		],
	]);

	register_rest_route('pb/v1', '/auth/sso-code', [
		'methods' => 'POST',
		'callback' => 'pb_auth_sso_code_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/auth/sso', [
		'methods' => 'GET',
		'callback' => 'pb_auth_sso_login_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/auth/health', [
		'methods' => 'GET',
		'callback' => 'pb_auth_health_handler',
		'permission_callback' => '__return_true',
	]);
});

function pb_auth_ok($payload = [], $status = 200) {
	return new WP_REST_Response(array_merge(['ok' => true], $payload), $status);
}

function pb_auth_error($code, $message, $status = 400) {
	return new WP_REST_Response([
		'ok' => false,
		'errorCode' => $code,
		'message' => $message,
	], $status);
}

function pb_auth_validate_secret(WP_REST_Request $request) {
	$expected = defined('PB_AUTH_SHARED_SECRET') ? (string) PB_AUTH_SHARED_SECRET : '';
	if ($expected === '') {
		return true;
	}

	$provided = (string) $request->get_header('x-pb-auth-secret');
	if ($provided !== '' && hash_equals($expected, $provided)) {
		return true;
	}

	return pb_auth_error('UNAUTHORIZED', 'Unauthorized request.', 403);
}

function pb_auth_get_payload(WP_REST_Request $request) {
	$payload = $request->get_json_params();
	if (!is_array($payload)) {
		$payload = [];
	}
	return $payload;
}

function pb_auth_extract_bearer_token(WP_REST_Request $request) {
	$auth = (string) $request->get_header('authorization');
	if (stripos($auth, 'Bearer ') !== 0) {
		return '';
	}
	return trim(substr($auth, 7));
}

function pb_auth_token_key($token) {
	return 'pb_auth_token_' . hash('sha256', (string) $token);
}

function pb_auth_issue_token($user_id) {
	$token = bin2hex(random_bytes(32));
	$data = [
		'user_id' => absint($user_id),
		'issued_at' => time(),
	];
	set_transient(pb_auth_token_key($token), $data, PB_AUTH_TOKEN_TTL);
	return $token;
}

function pb_auth_get_user_from_token($token) {
	if (!is_string($token) || $token === '') {
		return null;
	}
	$data = get_transient(pb_auth_token_key($token));
	if (!is_array($data)) {
		return null;
	}
	$user_id = absint($data['user_id'] ?? 0);
	if ($user_id <= 0) {
		return null;
	}
	$user = get_user_by('id', $user_id);
	if (!$user) {
		return null;
	}
	return $user;
}

function pb_auth_invalidate_token($token) {
	if (!is_string($token) || $token === '') {
		return;
	}
	delete_transient(pb_auth_token_key($token));
}

function pb_auth_user_payload(WP_User $user) {
	return [
		'id' => (int) $user->ID,
		'email' => (string) $user->user_email,
		'firstName' => (string) $user->first_name,
		'lastName' => (string) $user->last_name,
		'displayName' => (string) $user->display_name,
	];
}

function pb_auth_health_handler(WP_REST_Request $request) {
	return pb_auth_ok([
		'route' => 'pb/v1/auth',
		'snippetVersion' => PB_AUTH_SNIPPET_VERSION,
		'wordpress' => get_bloginfo('version'),
		'authSecretConfigured' => defined('PB_AUTH_SHARED_SECRET') && PB_AUTH_SHARED_SECRET !== '',
		'tokenTtl' => (int) PB_AUTH_TOKEN_TTL,
		'woocommerceReady' => function_exists('wc_get_orders'),
		'ordersRoutes' => [
			'GET /wp-json/pb/v1/auth/orders',
			'GET /wp-json/pb/v1/auth/orders/{id}',
			'POST /wp-json/pb/v1/auth/orders/{id}/hide',
			'GET /wp-json/pb/v1/auth/addresses',
			'PUT /wp-json/pb/v1/auth/addresses',
			'GET /wp-json/pb/v1/auth/payment-methods',
			'DELETE /wp-json/pb/v1/auth/payment-methods/{id}',
			'POST /wp-json/pb/v1/auth/payment-methods/{id}/default',
			'POST /wp-json/pb/v1/auth/sso-code',
			'GET /wp-json/pb/v1/auth/sso',
		],
		'features' => [
			'hideOrder' => true,
			'ordersIncludeLineItems' => true,
			'orderCustomerNotes' => true,
		],
	]);
}

function pb_auth_login_handler(WP_REST_Request $request) {
	$secret_ok = pb_auth_validate_secret($request);
	if ($secret_ok !== true) return $secret_ok;

	$payload = pb_auth_get_payload($request);
	$email_raw = sanitize_text_field((string) ($payload['email'] ?? ''));
	$password = (string) ($payload['password'] ?? '');

	$email = sanitize_email($email_raw);
	if ($email === '' || $password === '') {
		return pb_auth_error('INVALID_INPUT', 'E-post og passord er påkrevd.', 400);
	}

	$user = get_user_by('email', $email);
	$login = $user ? $user->user_login : $email;

	$authenticated = wp_authenticate($login, $password);
	if (is_wp_error($authenticated) || !($authenticated instanceof WP_User)) {
		return pb_auth_error('INVALID_CREDENTIALS', 'Feil e-post eller passord.', 401);
	}

	$token = pb_auth_issue_token($authenticated->ID);
	return pb_auth_ok([
		'token' => $token,
		'expiresIn' => (int) PB_AUTH_TOKEN_TTL,
		'user' => pb_auth_user_payload($authenticated),
	]);
}

function pb_auth_signup_handler(WP_REST_Request $request) {
	$secret_ok = pb_auth_validate_secret($request);
	if ($secret_ok !== true) return $secret_ok;

	$payload = pb_auth_get_payload($request);
	$email_raw = sanitize_text_field((string) ($payload['email'] ?? ''));
	$password = (string) ($payload['password'] ?? '');
	$first_name = sanitize_text_field((string) ($payload['firstName'] ?? ''));
	$last_name = sanitize_text_field((string) ($payload['lastName'] ?? ''));

	$email = sanitize_email($email_raw);
	if ($email === '' || $password === '') {
		return pb_auth_error('INVALID_INPUT', 'E-post og passord er påkrevd.', 400);
	}
	if (!is_email($email)) {
		return pb_auth_error('INVALID_INPUT', 'Ugyldig e-postadresse.', 400);
	}
	if (strlen($password) < 8) {
		return pb_auth_error('WEAK_PASSWORD', 'Passordet må være minst 8 tegn.', 400);
	}
	if (email_exists($email)) {
		return pb_auth_error('EMAIL_IN_USE', 'E-posten er allerede registrert.', 409);
	}

	$base_login = sanitize_user(current(explode('@', $email)), true);
	if ($base_login === '') {
		$base_login = 'kunde';
	}
	$login = $base_login;
	$index = 2;
	while (username_exists($login)) {
		$login = $base_login . $index;
		$index++;
	}

	$role = get_role('customer') ? 'customer' : 'subscriber';
	$user_id = wp_insert_user([
		'user_login' => $login,
		'user_pass' => $password,
		'user_email' => $email,
		'first_name' => $first_name,
		'last_name' => $last_name,
		'display_name' => trim($first_name . ' ' . $last_name),
		'role' => $role,
	]);

	if (is_wp_error($user_id)) {
		return pb_auth_error('UNKNOWN_ERROR', 'Kunne ikke opprette konto.', 500);
	}

	$user = get_user_by('id', absint($user_id));
	if (!$user) {
		return pb_auth_error('UNKNOWN_ERROR', 'Kunne ikke opprette konto.', 500);
	}

	$token = pb_auth_issue_token($user->ID);
	return pb_auth_ok([
		'token' => $token,
		'expiresIn' => (int) PB_AUTH_TOKEN_TTL,
		'user' => pb_auth_user_payload($user),
	], 201);
}

function pb_auth_me_handler(WP_REST_Request $request) {
	$secret_ok = pb_auth_validate_secret($request);
	if ($secret_ok !== true) return $secret_ok;

	$token = pb_auth_extract_bearer_token($request);
	$user = pb_auth_get_user_from_token($token);
	if (!$user) {
		return pb_auth_error('UNAUTHORIZED', 'Ugyldig eller utløpt økt.', 401);
	}

	return pb_auth_ok([
		'user' => pb_auth_user_payload($user),
	]);
}

function pb_auth_logout_handler(WP_REST_Request $request) {
	$secret_ok = pb_auth_validate_secret($request);
	if ($secret_ok !== true) return $secret_ok;

	$token = pb_auth_extract_bearer_token($request);
	pb_auth_invalidate_token($token);

	return pb_auth_ok([
		'message' => 'Du er logget ut.',
	]);
}

function pb_auth_password_request_reset_handler(WP_REST_Request $request) {
	$secret_ok = pb_auth_validate_secret($request);
	if ($secret_ok !== true) return $secret_ok;

	$payload = pb_auth_get_payload($request);
	$email_raw = sanitize_text_field((string) ($payload['email'] ?? ''));
	$email = sanitize_email($email_raw);

	// Always return success to avoid account enumeration.
	if ($email !== '' && is_email($email)) {
		$user = get_user_by('email', $email);
		if ($user) {
			retrieve_password($user->user_login);
		}
	}

	return pb_auth_ok([
		'message' => 'Hvis e-posten finnes, sender vi deg en tilbakestillingslenke.',
	]);
}

function pb_auth_password_reset_handler(WP_REST_Request $request) {
	$secret_ok = pb_auth_validate_secret($request);
	if ($secret_ok !== true) return $secret_ok;

	$payload = pb_auth_get_payload($request);
	$login = sanitize_user((string) ($payload['login'] ?? ''));
	$key = sanitize_text_field((string) ($payload['key'] ?? ''));
	$new_password = (string) ($payload['newPassword'] ?? '');

	if ($login === '' || $key === '' || $new_password === '') {
		return pb_auth_error('INVALID_INPUT', 'Mangler påkrevde felt.', 400);
	}
	if (strlen($new_password) < 8) {
		return pb_auth_error('WEAK_PASSWORD', 'Passordet må være minst 8 tegn.', 400);
	}

	$user_or_error = check_password_reset_key($key, $login);
	if (is_wp_error($user_or_error)) {
		$error_code = $user_or_error->get_error_code();
		if ($error_code === 'expired_key') {
			return pb_auth_error('TOKEN_EXPIRED', 'Lenken har utløpt.', 400);
		}
		return pb_auth_error('TOKEN_INVALID', 'Lenken er ugyldig.', 400);
	}

	reset_password($user_or_error, $new_password);
	return pb_auth_ok([
		'message' => 'Passordet er oppdatert.',
	]);
}

/**
 * Logged-in password change (requires current password + new password).
 * Auth: X-PB-Auth-Secret + Authorization: Bearer <pb-token>.
 */
function pb_auth_password_change_handler(WP_REST_Request $request) {
	$secret_ok = pb_auth_validate_secret($request);
	if ($secret_ok !== true) return $secret_ok;

	$token = pb_auth_extract_bearer_token($request);
	$user = pb_auth_get_user_from_token($token);
	if (!$user) {
		return pb_auth_error('UNAUTHORIZED', 'Ugyldig eller utløpt økt.', 401);
	}

	$payload = pb_auth_get_payload($request);
	$current_password = (string) ($payload['currentPassword'] ?? '');
	$new_password = (string) ($payload['newPassword'] ?? '');

	if ($current_password === '' || $new_password === '') {
		return pb_auth_error('INVALID_INPUT', 'Nåværende og nytt passord er påkrevd.', 400);
	}
	if (strlen($new_password) < 8) {
		return pb_auth_error('WEAK_PASSWORD', 'Passordet må være minst 8 tegn.', 400);
	}
	if (!wp_check_password($current_password, $user->user_pass, $user->ID)) {
		return pb_auth_error('INVALID_CREDENTIALS', 'Nåværende passord er feil.', 401);
	}
	if (hash_equals($current_password, $new_password)) {
		return pb_auth_error('INVALID_INPUT', 'Det nye passordet må være forskjellig fra det gamle.', 400);
	}

	wp_set_password($new_password, $user->ID);

	// Invalidate the current token so the client must log in again with the new password.
	pb_auth_invalidate_token($token);

	return pb_auth_ok([
		'message' => 'Passordet er oppdatert. Logg inn på nytt.',
		'requiresReauth' => true,
	]);
}

/**
 * Resolve the authenticated WP_User from secret + Bearer token.
 * Returns WP_User or a WP_REST_Response error.
 */
function pb_auth_require_user(WP_REST_Request $request) {
	$secret_ok = pb_auth_validate_secret($request);
	if ($secret_ok !== true) {
		return $secret_ok;
	}

	$token = pb_auth_extract_bearer_token($request);
	$user = pb_auth_get_user_from_token($token);
	if (!$user) {
		return pb_auth_error('UNAUTHORIZED', 'Ugyldig eller utløpt økt.', 401);
	}

	return $user;
}

/** Customer-facing order statuses (excludes checkout drafts and other internals). */
function pb_auth_customer_order_statuses() {
	return ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'];
}

/**
 * Statuses a customer may hide from their account overview (not delete).
 * Normalized without `wc-` prefix.
 */
function pb_auth_hideable_order_statuses() {
	return ['failed', 'cancelled', 'refunded'];
}

function pb_auth_normalize_order_status($status) {
	return strtolower(str_replace('wc-', '', (string) $status));
}

function pb_auth_order_is_hidden_from_customer(WC_Order $order) {
	$value = $order->get_meta(PB_AUTH_ORDER_HIDDEN_META_KEY, true);
	if ($value === true || $value === 1 || $value === '1') {
		return true;
	}
	if (is_string($value)) {
		$normalized = strtolower(trim($value));
		return $normalized === '1' || $normalized === 'true' || $normalized === 'yes';
	}
	return false;
}

function pb_auth_map_order_address($order, $type) {
	$prefix = $type === 'shipping' ? 'shipping' : 'billing';
	$get = static function ($field) use ($order, $prefix) {
		$method = "get_{$prefix}_{$field}";
		if (!method_exists($order, $method)) {
			return null;
		}
		$value = $order->{$method}();
		$value = is_string($value) ? trim($value) : '';
		return $value === '' ? null : $value;
	};

	$address = [
		'firstName' => $get('first_name'),
		'lastName' => $get('last_name'),
		'address1' => $get('address_1'),
		'address2' => $get('address_2'),
		'postcode' => $get('postcode'),
		'city' => $get('city'),
		'country' => $get('country'),
	];

	if ($prefix === 'billing') {
		$address['email'] = $get('email');
		$address['phone'] = $get('phone');
	}

	$has_any = false;
	foreach ($address as $value) {
		if ($value !== null && $value !== '') {
			$has_any = true;
			break;
		}
	}

	return $has_any ? $address : null;
}

/**
 * Product thumbnail for an order line (variation falls back to parent image).
 *
 * @return array{sourceUrl: string|null, altText: string|null}
 */
function pb_auth_map_product_image($product, $fallback_alt = '') {
	$empty = ['sourceUrl' => null, 'altText' => null];
	if (!$product instanceof WC_Product) {
		return $empty;
	}

	$image_id = (int) $product->get_image_id();
	if ($image_id <= 0 && $product->is_type('variation')) {
		$parent_id = (int) $product->get_parent_id();
		if ($parent_id > 0) {
			$parent = wc_get_product($parent_id);
			if ($parent instanceof WC_Product) {
				$image_id = (int) $parent->get_image_id();
			}
		}
	}

	if ($image_id <= 0) {
		return $empty;
	}

	$url = wp_get_attachment_image_url($image_id, 'woocommerce_thumbnail');
	if (!is_string($url) || $url === '') {
		$url = wp_get_attachment_image_url($image_id, 'thumbnail');
	}
	if (!is_string($url) || $url === '') {
		return $empty;
	}

	$alt = trim((string) get_post_meta($image_id, '_wp_attachment_image_alt', true));
	if ($alt === '') {
		$alt = trim((string) $fallback_alt);
	}

	return [
		'sourceUrl' => $url,
		'altText' => $alt !== '' ? $alt : null,
	];
}

function pb_auth_map_order_line_items(WC_Order $order) {
	$items = [];
	foreach ($order->get_items('line_item') as $item) {
		if (!$item instanceof WC_Order_Item_Product) {
			continue;
		}

		$name = trim((string) $item->get_name());
		$product = $item->get_product();
		$slug = null;
		if ($product instanceof WC_Product) {
			// Catalog / GraphQL slug must be the parent for variations.
			if ($product->is_type('variation')) {
				$parent_id = (int) $product->get_parent_id();
				$parent = $parent_id > 0 ? wc_get_product($parent_id) : null;
				if ($parent instanceof WC_Product) {
					$slug = trim((string) $parent->get_slug());
				}
			}
			if ($slug === null || $slug === '') {
				$slug = trim((string) $product->get_slug());
			}
			if ($slug === '') {
				$slug = null;
			}
			if ($name === '') {
				$name = trim((string) $product->get_name());
			}
		}

		$display_name = $name !== '' ? $name : 'Produkt';
		$image = pb_auth_map_product_image($product, $display_name);

		// Include tax so line items match the order total (Norwegian prices are incl. mva).
		$line_total = (float) $item->get_total() + (float) $item->get_total_tax();

		$items[] = [
			'name' => $display_name,
			'slug' => $slug,
			'quantity' => (int) $item->get_quantity(),
			// Plain numeric string — avoid HTML-formatted money.
			'total' => wc_format_decimal($line_total, wc_get_price_decimals()),
			'image' => $image,
		];
	}
	return $items;
}

function pb_auth_map_order_summary(WC_Order $order) {
	$id = (int) $order->get_id();
	// Canonical WooCommerce check (handles zero totals + gateway filters).
	$needs_payment = $order->needs_payment();
	$order_key = (string) $order->get_order_key();
	$date = $order->get_date_created();

	return [
		'id' => $id,
		'orderNumber' => (string) $order->get_order_number(),
		'date' => $date ? $date->date('c') : null,
		'status' => (string) $order->get_status(),
		// Plain numeric string (no HTML entities like kr&nbsp;…).
		'total' => (string) $order->get_total(),
		'orderKey' => $order_key !== '' ? $order_key : null,
		'needsPayment' => $needs_payment,
		'paymentMethodTitle' => (string) $order->get_payment_method_title() ?: null,
	];
}

/**
 * Extract customer-facing SMS body from private order notes created by the
 * "SMS To Customer" Code Snippet: "{queued msg}\n\n---\n{sms body}".
 * Delivery-status notes ("SMS sent…", "SMS delivered…") have no --- body.
 *
 * @return string|null SMS body for the customer, or null if not an SMS note.
 */
function pb_auth_extract_sms_customer_content($note_content) {
	$content = trim((string) $note_content);
	if ($content === '' || !preg_match('/^SMS\b/u', $content)) {
		return null;
	}

	$parts = preg_split('/\R---\R/', $content, 2);
	if (!is_array($parts) || count($parts) < 2) {
		return null;
	}

	$body = trim((string) $parts[1]);
	return $body !== '' ? $body : null;
}

/**
 * Map WooCommerce email titles (EN/NO) to short Norwegian labels for Min konto.
 *
 * @param string $title Email title from the order note.
 * @return string
 */
function pb_auth_customer_email_title_label($title) {
	$key = function_exists('mb_strtolower')
		? mb_strtolower(trim((string) $title), 'UTF-8')
		: strtolower(trim((string) $title));

	$map = [
		'failed order' => 'Betaling mislyktes',
		'order failed' => 'Betaling mislyktes',
		'mislykket ordre' => 'Betaling mislyktes',
		'ordre mislyktes' => 'Betaling mislyktes',
		'processing order' => 'Ordre under behandling',
		'ordre under behandling' => 'Ordre under behandling',
		'completed order' => 'Ordre fullført',
		'fullført ordre' => 'Ordre fullført',
		'order on-hold' => 'Ordre på vent',
		'order on hold' => 'Ordre på vent',
		'on-hold order' => 'Ordre på vent',
		'ordre på vent' => 'Ordre på vent',
		'refunded order' => 'Ordre refundert',
		'refundert ordre' => 'Ordre refundert',
		'partial refund' => 'Delvis refusjon',
		'customer invoice' => 'Faktura / ordredetaljer',
		'invoice' => 'Faktura / ordredetaljer',
		'kundefaktura' => 'Faktura / ordredetaljer',
		'customer note' => 'Melding fra butikken',
		'kundenotat' => 'Melding fra butikken',
		'cancelled order' => 'Ordre kansellert',
		'canceled order' => 'Ordre kansellert',
		'kansellert ordre' => 'Ordre kansellert',
	];

	return isset($map[$key]) ? $map[$key] : trim((string) $title);
}

/**
 * Whether a Woo email title is admin-only (never show in customer timeline).
 *
 * @param string $title
 * @return bool
 */
function pb_auth_is_admin_email_title($title) {
	$key = function_exists('mb_strtolower')
		? mb_strtolower(trim((string) $title), 'UTF-8')
		: strtolower(trim((string) $title));

	$admin = [
		'new order',
		'ny ordre',
		'ny bestilling',
	];

	return in_array($key, $admin, true);
}

/**
 * If $content is a standard WooCommerce “email was sent” private note,
 * return a customer-facing Norwegian label; otherwise null.
 *
 * Matched patterns (private notes, customer_note=false):
 * - Email "Processing order" sent.          (WC EmailLogger / PB Auth logger)
 * - Order details manually sent to customer.
 * - Order details sent to customer@example.com…
 * - … email sent to …                       (legacy phrasing)
 *
 * Excludes: failed-to-send notes, admin “New order”, SMS noise.
 *
 * @param string $content Stripped note body.
 * @return string|null
 */
function pb_auth_extract_wc_email_sent_content($content) {
	$content = trim((string) $content);
	if ($content === '') {
		return null;
	}

	// Core EmailLogger / our logger: Email "Title" sent.
	if (preg_match('/^Email\s+"([^"]+)"\s+sent\.?\s*$/iu', $content, $m)) {
		$title = trim((string) $m[1]);
		if ($title === '' || pb_auth_is_admin_email_title($title)) {
			return null;
		}
		return pb_auth_customer_email_title_label($title);
	}

	// Do not expose delivery failures to customers.
	if (preg_match('/^Email\s+"[^"]+"\s+failed to send/iu', $content)) {
		return null;
	}

	// Manual / REST resend of order details.
	if (preg_match('/^Order details (manually )?sent\b/iu', $content)) {
		return 'Ordredetaljer sendt på e-post';
	}
	if (preg_match('/^Ordredetaljer (manuelt )?sendt\b/iu', $content)) {
		return 'Ordredetaljer sendt på e-post';
	}

	// Legacy: "Payment failed email sent to …" / "… email sent to …"
	if (
		preg_match('/\bemail sent to\b/iu', $content)
		&& !preg_match('/\b(failed to send|could not be sent)\b/iu', $content)
	) {
		if (preg_match('/^(.+?)\s+email sent to\b/iu', $content, $m)) {
			$prefix = trim((string) $m[1]);
			if ($prefix !== '' && !pb_auth_is_admin_email_title($prefix)) {
				return pb_auth_customer_email_title_label($prefix);
			}
		}
		return 'E-post sendt';
	}

	if (
		preg_match('/\be-post sendt til\b/iu', $content)
		&& !preg_match('/\b(kunne ikke|mislyktes)\b/iu', $content)
	) {
		return 'E-post sendt';
	}

	return null;
}

/**
 * On WC < 10.9, core does not write “Email … sent.” order notes.
 * Mirror that behaviour for successful customer emails only.
 * Skipped when Automattic\WooCommerce\Internal\Email\EmailLogger exists.
 *
 * @param bool     $success Whether wp_mail / send succeeded.
 * @param string   $email_id WC email id (e.g. customer_failed_order).
 * @param WC_Email $email Email instance.
 */
function pb_auth_log_customer_email_sent_note($success, $email_id, $email) {
	if (!$success || !is_object($email)) {
		return;
	}

	// WC 10.9+ EmailLogger already adds private notes for transactional emails.
	if (class_exists('\\Automattic\\WooCommerce\\Internal\\Email\\EmailLogger')) {
		return;
	}

	$is_customer = false;
	if (method_exists($email, 'is_customer_email')) {
		$is_customer = (bool) $email->is_customer_email();
	} elseif (isset($email->customer_email)) {
		$is_customer = (bool) $email->customer_email;
	}
	if (!$is_customer) {
		return;
	}

	$order = isset($email->object) ? $email->object : null;
	if (!$order instanceof WC_Order) {
		return;
	}

	$title = method_exists($email, 'get_title') ? (string) $email->get_title() : (string) $email_id;
	$title = trim($title);
	if ($title === '' || pb_auth_is_admin_email_title($title)) {
		return;
	}

	$note = sprintf('Email "%s" sent.', $title);
	$order->add_order_note($note, false, true);
}

add_action('woocommerce_email_sent', 'pb_auth_log_customer_email_sent_note', 20, 3);

/**
 * Customer-relevant order notes for Min konto timeline:
 * - Email: Woo customer notes (customer_note flag) + standard WC “email sent” notes
 * - SMS: private notes from SMS snippet with queued marker + --- body
 * Omits internal admin notes, admin New order emails, and SMS delivery-status noise.
 *
 * @return array<int, array{id:int,type:string,date:?string,content:string}>
 */
function pb_auth_map_customer_facing_notes(WC_Order $order) {
	$mapped = [];

	if (function_exists('wc_get_order_notes')) {
		$raw_notes = wc_get_order_notes([
			'order_id' => (int) $order->get_id(),
			'limit' => 100,
			'orderby' => 'date_created',
			'order' => 'ASC',
		]);
	} else {
		$raw_notes = $order->get_customer_order_notes();
	}

	if (!is_array($raw_notes)) {
		return [];
	}

	foreach ($raw_notes as $note) {
		$content_raw = '';
		$note_id = 0;
		$is_customer_note = false;
		$date = null;

		if (is_object($note)) {
			$note_id = isset($note->id) ? (int) $note->id : 0;
			$content_raw = isset($note->content) ? (string) $note->content : '';
			$is_customer_note = !empty($note->customer_note);
			if (!empty($note->date_created) && is_object($note->date_created) && method_exists($note->date_created, 'date')) {
				$date = $note->date_created->date('c');
			}
		} elseif (is_array($note)) {
			$note_id = isset($note['id']) ? (int) $note['id'] : 0;
			$content_raw = isset($note['content']) ? (string) $note['content'] : '';
			$is_customer_note = !empty($note['customer_note']);
		}

		$content = trim(wp_strip_all_tags($content_raw));
		if ($content === '') {
			continue;
		}

		if ($is_customer_note) {
			$mapped[] = [
				'id' => $note_id,
				'type' => 'email',
				'date' => $date,
				'content' => $content,
			];
			continue;
		}

		$email_label = pb_auth_extract_wc_email_sent_content($content);
		if ($email_label !== null) {
			$mapped[] = [
				'id' => $note_id,
				'type' => 'email',
				'date' => $date,
				'content' => $email_label,
			];
			continue;
		}

		$sms_body = pb_auth_extract_sms_customer_content($content);
		if ($sms_body !== null) {
			$mapped[] = [
				'id' => $note_id,
				'type' => 'sms',
				'date' => $date,
				'content' => $sms_body,
			];
		}
	}

	return $mapped;
}

/**
 * ISO date helper for WC_DateTime|null.
 *
 * @param mixed $date
 * @return string|null
 */
function pb_auth_order_datetime_iso($date) {
	if ($date && is_object($date) && method_exists($date, 'date')) {
		return $date->date('c');
	}
	return null;
}

/**
 * Thin order list via wc_get_orders — bypasses WooGraphQL resolvers.
 * Auth: X-PB-Auth-Secret + Authorization: Bearer <pb-token>.
 */
function pb_auth_orders_handler(WP_REST_Request $request) {
	$user = pb_auth_require_user($request);
	if (!$user instanceof WP_User) {
		return $user;
	}

	if (!function_exists('wc_get_orders')) {
		return pb_auth_error('WOOCOMMERCE_UNAVAILABLE', 'WooCommerce er ikke tilgjengelig.', 503);
	}

	$limit = absint($request->get_param('limit'));
	if ($limit <= 0) {
		$limit = (int) PB_AUTH_ORDERS_LIMIT;
	}
	$limit = min(100, max(1, $limit));

	$status_param = trim((string) $request->get_param('status'));
	$allowed_statuses = pb_auth_customer_order_statuses();
	$status = $allowed_statuses;
	if ($status_param !== '') {
		$normalized_status = pb_auth_normalize_order_status($status_param);
		if (in_array($normalized_status, $allowed_statuses, true)) {
			$status = [$normalized_status];
		}
	}

	$include_line_items = filter_var(
		$request->get_param('includeLineItems'),
		FILTER_VALIDATE_BOOLEAN
	);

	// Over-fetch slightly so hidden rows can be skipped without short lists.
	$fetch_limit = min(100, $limit + 20);

	$orders = wc_get_orders([
		'customer_id' => (int) $user->ID,
		'limit' => $fetch_limit,
		'orderby' => 'date',
		'order' => 'DESC',
		'return' => 'objects',
		'status' => $status,
	]);

	$mapped = [];
	foreach ($orders as $order) {
		if (!$order instanceof WC_Order) {
			continue;
		}
		if (pb_auth_order_is_hidden_from_customer($order)) {
			continue;
		}
		$row = pb_auth_map_order_summary($order);
		if ($include_line_items) {
			$row['lineItems'] = pb_auth_map_order_line_items($order);
		}
		$mapped[] = $row;
		if (count($mapped) >= $limit) {
			break;
		}
	}

	return pb_auth_ok([
		'orders' => $mapped,
		'count' => count($mapped),
	]);
}

/**
 * Single owned order + line items / addresses.
 * Auth: X-PB-Auth-Secret + Authorization: Bearer <pb-token>.
 */
function pb_auth_order_by_id_handler(WP_REST_Request $request) {
	$user = pb_auth_require_user($request);
	if (!$user instanceof WP_User) {
		return $user;
	}

	if (!function_exists('wc_get_order')) {
		return pb_auth_error('WOOCOMMERCE_UNAVAILABLE', 'WooCommerce er ikke tilgjengelig.', 503);
	}

	$order_id = absint($request['id']);
	if ($order_id <= 0) {
		return pb_auth_error('INVALID_INPUT', 'Ugyldig ordre-ID.', 400);
	}

	$order = wc_get_order($order_id);
	if (!$order instanceof WC_Order) {
		return pb_auth_error('NOT_FOUND', 'Fant ikke ordren.', 404);
	}

	if ((int) $order->get_customer_id() !== (int) $user->ID) {
		return pb_auth_error('NOT_FOUND', 'Fant ikke ordren.', 404);
	}

	if (pb_auth_order_is_hidden_from_customer($order)) {
		return pb_auth_error('NOT_FOUND', 'Fant ikke ordren.', 404);
	}

	$summary = pb_auth_map_order_summary($order);
	$summary['lineItems'] = pb_auth_map_order_line_items($order);
	$summary['billing'] = pb_auth_map_order_address($order, 'billing');
	$summary['shipping'] = pb_auth_map_order_address($order, 'shipping');
	$summary['datePaid'] = pb_auth_order_datetime_iso($order->get_date_paid());
	$summary['dateCompleted'] = pb_auth_order_datetime_iso($order->get_date_completed());
	$summary['customerNotes'] = pb_auth_map_customer_facing_notes($order);

	return pb_auth_ok([
		'order' => $summary,
	]);
}

/**
 * Hide an owned order from the customer account overview (meta flag only).
 * Does not delete or change the WooCommerce order for admin.
 * Auth: X-PB-Auth-Secret + Authorization: Bearer <pb-token>.
 */
function pb_auth_order_hide_handler(WP_REST_Request $request) {
	$user = pb_auth_require_user($request);
	if (!$user instanceof WP_User) {
		return $user;
	}

	if (!function_exists('wc_get_order')) {
		return pb_auth_error('WOOCOMMERCE_UNAVAILABLE', 'WooCommerce er ikke tilgjengelig.', 503);
	}

	$order_id = absint($request['id']);
	if ($order_id <= 0) {
		return pb_auth_error('INVALID_INPUT', 'Ugyldig ordre-ID.', 400);
	}

	$order = wc_get_order($order_id);
	if (!$order instanceof WC_Order) {
		return pb_auth_error('NOT_FOUND', 'Fant ikke ordren.', 404);
	}

	if ((int) $order->get_customer_id() !== (int) $user->ID) {
		return pb_auth_error('NOT_FOUND', 'Fant ikke ordren.', 404);
	}

	if (pb_auth_order_is_hidden_from_customer($order)) {
		return pb_auth_ok([
			'message' => 'Ordren er allerede skjult fra oversikten din.',
			'orderId' => $order_id,
		]);
	}

	$status = pb_auth_normalize_order_status($order->get_status());
	if (!in_array($status, pb_auth_hideable_order_statuses(), true)) {
		return pb_auth_error(
			'INVALID_INPUT',
			'Bare mislykkede, kansellerte eller refunderte ordrer kan skjules.',
			400
		);
	}

	$order->update_meta_data(PB_AUTH_ORDER_HIDDEN_META_KEY, '1');
	$order->save();

	return pb_auth_ok([
		'message' => 'Ordren er skjult fra oversikten din.',
		'orderId' => $order_id,
	]);
}

function pb_auth_sso_code_key($code) {
	return 'pb_auth_sso_' . hash('sha256', (string) $code);
}

/**
 * Mint a one-time SSO login code (server-to-server only).
 * Auth: X-PB-Auth-Secret + Authorization: Bearer <pb-token>.
 * Body: { "redirect": "/checkout/order-pay/123/?pay_for_order=true&key=..." }
 *
 * The Next.js BFF calls this, then redirects the browser to the returned
 * loginUrl. WordPress logs the user in and forwards to the redirect path,
 * so e.g. the order-pay page opens without a login form.
 */
function pb_auth_sso_code_handler(WP_REST_Request $request) {
	$user = pb_auth_require_user($request);
	if (!$user instanceof WP_User) {
		return $user;
	}

	$payload = pb_auth_get_payload($request);
	$redirect = (string) ($payload['redirect'] ?? '');

	// Relative same-site paths only (no protocol-relative "//host" tricks).
	if ($redirect === '' || $redirect[0] !== '/' || substr($redirect, 0, 2) === '//') {
		return pb_auth_error('INVALID_INPUT', 'Ugyldig redirect.', 400);
	}

	$code = bin2hex(random_bytes(16));
	set_transient(pb_auth_sso_code_key($code), [
		'user_id' => (int) $user->ID,
		'redirect' => $redirect,
		'issued_at' => time(),
	], PB_AUTH_SSO_CODE_TTL);

	return pb_auth_ok([
		'code' => $code,
		'loginUrl' => add_query_arg('code', rawurlencode($code), rest_url('pb/v1/auth/sso')),
		'expiresIn' => (int) PB_AUTH_SSO_CODE_TTL,
	]);
}

/**
 * Browser endpoint: consumes a one-time SSO code, logs the user in
 * (WordPress auth cookie) and redirects to the stored same-site path.
 */
function pb_auth_sso_login_handler(WP_REST_Request $request) {
	$fallback = home_url('/');
	$code = (string) $request->get_param('code');
	if ($code === '') {
		wp_safe_redirect($fallback);
		exit;
	}

	$key = pb_auth_sso_code_key($code);
	$data = get_transient($key);
	delete_transient($key); // One-time use, even on failure.

	if (!is_array($data)) {
		wp_safe_redirect($fallback);
		exit;
	}

	$redirect = (string) ($data['redirect'] ?? '/');
	$target = wp_validate_redirect(home_url($redirect), $fallback);

	$user = get_user_by('id', absint($data['user_id'] ?? 0));
	if ($user instanceof WP_User) {
		wp_set_current_user($user->ID);
		wp_set_auth_cookie($user->ID, false, is_ssl());
		// Let plugins react as on a normal login (e.g. Woo cart/session merge).
		do_action('wp_login', $user->user_login, $user);
	}

	wp_safe_redirect($target);
	exit;
}

/**
 * Map a WC_Customer address type (billing|shipping) to the API shape.
 */
function pb_auth_map_customer_address(WC_Customer $customer, $type) {
	$prefix = $type === 'shipping' ? 'shipping' : 'billing';
	$get = static function ($field) use ($customer, $prefix) {
		$method = "get_{$prefix}_{$field}";
		if (!method_exists($customer, $method)) {
			return null;
		}
		$value = $customer->{$method}();
		$value = is_string($value) ? trim($value) : '';
		return $value === '' ? null : $value;
	};

	$address = [
		'firstName' => $get('first_name'),
		'lastName' => $get('last_name'),
		'company' => $get('company'),
		'address1' => $get('address_1'),
		'address2' => $get('address_2'),
		'postcode' => $get('postcode'),
		'city' => $get('city'),
		'state' => $get('state'),
		'country' => $get('country'),
	];

	if ($prefix === 'billing') {
		$address['email'] = $get('email');
		$address['phone'] = $get('phone');
	}

	return $address;
}

/**
 * Apply a partial address payload onto a WC_Customer.
 * Only keys present in $data are updated (null clears the field).
 */
function pb_auth_apply_customer_address(WC_Customer $customer, $type, $data) {
	if (!is_array($data)) {
		return;
	}

	$prefix = $type === 'shipping' ? 'shipping' : 'billing';
	$map = [
		'firstName' => 'first_name',
		'lastName' => 'last_name',
		'company' => 'company',
		'address1' => 'address_1',
		'address2' => 'address_2',
		'postcode' => 'postcode',
		'city' => 'city',
		'state' => 'state',
		'country' => 'country',
	];
	if ($prefix === 'billing') {
		$map['email'] = 'email';
		$map['phone'] = 'phone';
	}

	foreach ($map as $api_key => $wc_field) {
		if (!array_key_exists($api_key, $data)) {
			continue;
		}
		$raw = $data[$api_key];
		$value = is_string($raw) ? sanitize_text_field($raw) : '';
		if ($api_key === 'email' && $value !== '') {
			$value = sanitize_email($value);
		}
		if ($api_key === 'country' && $value !== '') {
			$value = strtoupper($value);
		}
		if ($api_key === 'postcode') {
			$value = wc_format_postcode($value, (string) ($data['country'] ?? $customer->{"get_{$prefix}_country"}()));
		}

		$setter = "set_{$prefix}_{$wc_field}";
		if (method_exists($customer, $setter)) {
			$customer->{$setter}($value);
		}
	}
}

/**
 * GET billing + shipping addresses for the authenticated customer.
 */
function pb_auth_addresses_get_handler(WP_REST_Request $request) {
	$user = pb_auth_require_user($request);
	if (!$user instanceof WP_User) {
		return $user;
	}

	if (!class_exists('WC_Customer')) {
		return pb_auth_error('WOOCOMMERCE_UNAVAILABLE', 'WooCommerce er ikke tilgjengelig.', 503);
	}

	$customer = new WC_Customer((int) $user->ID);
	return pb_auth_ok([
		'billing' => pb_auth_map_customer_address($customer, 'billing'),
		'shipping' => pb_auth_map_customer_address($customer, 'shipping'),
	]);
}

/**
 * PUT billing and/or shipping. Body: { "billing"?: {...}, "shipping"?: {...} }
 */
function pb_auth_addresses_put_handler(WP_REST_Request $request) {
	$user = pb_auth_require_user($request);
	if (!$user instanceof WP_User) {
		return $user;
	}

	if (!class_exists('WC_Customer')) {
		return pb_auth_error('WOOCOMMERCE_UNAVAILABLE', 'WooCommerce er ikke tilgjengelig.', 503);
	}

	$payload = pb_auth_get_payload($request);
	$has_billing = array_key_exists('billing', $payload) && is_array($payload['billing']);
	$has_shipping = array_key_exists('shipping', $payload) && is_array($payload['shipping']);

	if (!$has_billing && !$has_shipping) {
		return pb_auth_error('INVALID_INPUT', 'Mangler faktura- eller leveringsadresse.', 400);
	}

	if ($has_billing) {
		$email = isset($payload['billing']['email']) ? sanitize_email((string) $payload['billing']['email']) : '';
		if ($email !== '' && !is_email($email)) {
			return pb_auth_error('INVALID_INPUT', 'Ugyldig e-postadresse.', 400);
		}
	}

	$customer = new WC_Customer((int) $user->ID);
	if ($has_billing) {
		pb_auth_apply_customer_address($customer, 'billing', $payload['billing']);
	}
	if ($has_shipping) {
		pb_auth_apply_customer_address($customer, 'shipping', $payload['shipping']);
	}
	$customer->save();

	return pb_auth_ok([
		'billing' => pb_auth_map_customer_address($customer, 'billing'),
		'shipping' => pb_auth_map_customer_address($customer, 'shipping'),
		'message' => 'Adressene er oppdatert.',
	]);
}

/**
 * Map a WC_Payment_Token to a safe display payload (never expose raw gateway tokens).
 */
function pb_auth_map_payment_token($token) {
	if (!$token instanceof WC_Payment_Token) {
		return null;
	}

	$id = (int) $token->get_id();
	if ($id <= 0) {
		return null;
	}

	$type = (string) $token->get_type();
	$gateway_id = (string) $token->get_gateway_id();
	$gateway_title = $gateway_id;
	if (function_exists('WC') && WC()->payment_gateways()) {
		$gateways = WC()->payment_gateways()->payment_gateways();
		if (isset($gateways[$gateway_id]) && is_object($gateways[$gateway_id])) {
			$gateway_title = (string) $gateways[$gateway_id]->get_title();
		}
	}

	$brand = null;
	$last4 = null;
	$expiryMonth = null;
	$expiryYear = null;

	if ($token instanceof WC_Payment_Token_CC) {
		$brand = (string) $token->get_card_type();
		$last4 = (string) $token->get_last4();
		$expiryMonth = (string) $token->get_expiry_month();
		$expiryYear = (string) $token->get_expiry_year();
	} elseif (method_exists($token, 'get_last4')) {
		$last4 = (string) $token->get_last4();
	}

	$display = trim(($brand ? ucfirst($brand) . ' ' : '') . ($last4 ? '•••• ' . $last4 : ''));
	if ($display === '') {
		$display = $gateway_title !== '' ? $gateway_title : 'Lagret betalingsmetode';
	}

	return [
		'id' => $id,
		'type' => $type !== '' ? $type : 'unknown',
		'gatewayId' => $gateway_id !== '' ? $gateway_id : null,
		'gatewayTitle' => $gateway_title !== '' ? $gateway_title : null,
		'brand' => $brand !== '' ? $brand : null,
		'last4' => $last4 !== '' ? $last4 : null,
		'expiryMonth' => $expiryMonth !== '' ? $expiryMonth : null,
		'expiryYear' => $expiryYear !== '' ? $expiryYear : null,
		'isDefault' => (bool) $token->is_default(),
		'display' => $display,
	];
}

/**
 * GET saved payment methods (WooCommerce payment tokens) for the customer.
 */
function pb_auth_payment_methods_handler(WP_REST_Request $request) {
	$user = pb_auth_require_user($request);
	if (!$user instanceof WP_User) {
		return $user;
	}

	if (!class_exists('WC_Payment_Tokens')) {
		return pb_auth_error('WOOCOMMERCE_UNAVAILABLE', 'WooCommerce er ikke tilgjengelig.', 503);
	}

	$tokens = WC_Payment_Tokens::get_customer_tokens((int) $user->ID);
	$methods = [];
	foreach ($tokens as $token) {
		$mapped = pb_auth_map_payment_token($token);
		if ($mapped !== null) {
			$methods[] = $mapped;
		}
	}

	return pb_auth_ok([
		'paymentMethods' => $methods,
		'count' => count($methods),
	]);
}

/**
 * DELETE a saved payment method owned by the authenticated customer.
 */
function pb_auth_payment_method_delete_handler(WP_REST_Request $request) {
	$user = pb_auth_require_user($request);
	if (!$user instanceof WP_User) {
		return $user;
	}

	if (!class_exists('WC_Payment_Tokens')) {
		return pb_auth_error('WOOCOMMERCE_UNAVAILABLE', 'WooCommerce er ikke tilgjengelig.', 503);
	}

	$token_id = absint($request['id']);
	if ($token_id <= 0) {
		return pb_auth_error('INVALID_INPUT', 'Ugyldig betalingsmetode.', 400);
	}

	$token = WC_Payment_Tokens::get($token_id);
	if (!$token instanceof WC_Payment_Token || (int) $token->get_user_id() !== (int) $user->ID) {
		return pb_auth_error('NOT_FOUND', 'Fant ikke betalingsmetoden.', 404);
	}

	WC_Payment_Tokens::delete($token_id);

	return pb_auth_ok([
		'message' => 'Betalingsmetoden er slettet.',
	]);
}

/**
 * POST set a saved payment method as the customer's default.
 */
function pb_auth_payment_method_default_handler(WP_REST_Request $request) {
	$user = pb_auth_require_user($request);
	if (!$user instanceof WP_User) {
		return $user;
	}

	if (!class_exists('WC_Payment_Tokens')) {
		return pb_auth_error('WOOCOMMERCE_UNAVAILABLE', 'WooCommerce er ikke tilgjengelig.', 503);
	}

	$token_id = absint($request['id']);
	if ($token_id <= 0) {
		return pb_auth_error('INVALID_INPUT', 'Ugyldig betalingsmetode.', 400);
	}

	$token = WC_Payment_Tokens::get($token_id);
	if (!$token instanceof WC_Payment_Token || (int) $token->get_user_id() !== (int) $user->ID) {
		return pb_auth_error('NOT_FOUND', 'Fant ikke betalingsmetoden.', 404);
	}

	WC_Payment_Tokens::set_users_default((int) $user->ID, $token_id);

	return pb_auth_ok([
		'message' => 'Standard betalingsmetode er oppdatert.',
		'paymentMethod' => pb_auth_map_payment_token(WC_Payment_Tokens::get($token_id)),
	]);
}
