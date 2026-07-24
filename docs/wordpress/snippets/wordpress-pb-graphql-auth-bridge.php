<?php
/**
 * PB GraphQL Auth Bridge
 *
 * Version: 1.0.0
 * Updated: 2026-07-09
 *
 * Install as:
 * - Code Snippets plugin (PHP snippet, run everywhere), OR
 * - mu-plugin: wp-content/mu-plugins/pb-graphql-auth-bridge.php
 *
 * Why this exists:
 * - The Next.js storefront authenticates customers via PB Auth
 *   (Bearer tokens stored in WordPress transients — see PB Auth endpoints).
 * - WooGraphQL's `customer { orders { … } }` only returns data for the
 *   current WordPress user. Without this bridge, GraphQL always sees a guest.
 *
 * Behaviour:
 * - ONLY on GraphQL requests: if `Authorization: Bearer <token>` is present
 *   and matches a valid PB Auth transient, set the current user for that request.
 * - Does NOT create a WordPress login cookie (no effect on classic /min-konto,
 *   checkout, or admin sessions).
 * - Does NOT run on normal page loads, checkout, cart-sync, or REST routes.
 * - Requires the PB Auth snippet to be active (uses pb_auth_get_user_from_token).
 *
 * Check installed version: file header Version / PB_GRAPHQL_AUTH_BRIDGE_SNIPPET_VERSION
 * (no REST health). Inventory: docs/wordpress/SNIPPETS.md
 *
 * Security:
 * - GraphQL must only be called from the Next.js server (BFF), never from the
 *   browser. This snippet only maps an already-issued PB token.
 */

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_GRAPHQL_AUTH_BRIDGE_SNIPPET_VERSION')) {
	define('PB_GRAPHQL_AUTH_BRIDGE_SNIPPET_VERSION', '1.0.0');
}

/**
 * True when the current HTTP request is a WPGraphQL request.
 */
function pb_graphql_auth_bridge_is_graphql_request() {
	// Pretty permalink: /graphql
	$request_uri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
	$path = (string) parse_url($request_uri, PHP_URL_PATH);
	$path = untrailingslashit($path);
	if ($path !== '' && substr($path, -strlen('/graphql')) === '/graphql') {
		return true;
	}

	// Query-var style: ?graphql=...
	if (isset($_GET['graphql'])) {
		return true;
	}

	// WPGraphQL sets this once the request is identified.
	if (defined('GRAPHQL_HTTP_REQUEST') && GRAPHQL_HTTP_REQUEST) {
		return true;
	}

	return false;
}

/**
 * Resolve a PB Auth Bearer token from the current HTTP request.
 */
function pb_graphql_auth_bridge_extract_bearer_token() {
	$header = '';

	if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
		$header = (string) $_SERVER['HTTP_AUTHORIZATION'];
	} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
		$header = (string) $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
	} elseif (function_exists('getallheaders')) {
		$headers = getallheaders();
		if (is_array($headers)) {
			foreach ($headers as $name => $value) {
				if (strtolower((string) $name) === 'authorization') {
					$header = (string) $value;
					break;
				}
			}
		}
	}

	if (stripos($header, 'Bearer ') !== 0) {
		return '';
	}

	return trim(substr($header, 7));
}

/**
 * Map a valid PB Auth token onto the current WordPress user for this GraphQL request.
 */
function pb_graphql_auth_bridge_maybe_set_user() {
	if (!pb_graphql_auth_bridge_is_graphql_request()) {
		return;
	}

	if (!function_exists('pb_auth_get_user_from_token')) {
		// PB Auth snippet not loaded — nothing to do.
		return;
	}

	// Never override an existing WordPress cookie session (admin, classic My Account, etc.).
	if (is_user_logged_in()) {
		return;
	}

	$token = pb_graphql_auth_bridge_extract_bearer_token();
	if ($token === '') {
		return;
	}

	$user = pb_auth_get_user_from_token($token);
	if (!$user instanceof WP_User) {
		return;
	}

	// Request-scoped only — no auth cookie, no persistent WP login.
	wp_set_current_user((int) $user->ID);
}

// Prefer WPGraphQL's own hook (fires only for GraphQL). Keep a guarded init
// fallback for edge setups where graphql_init is late/missing.
add_action('graphql_init', 'pb_graphql_auth_bridge_maybe_set_user', 1);
add_action('init', 'pb_graphql_auth_bridge_maybe_set_user', 1);
