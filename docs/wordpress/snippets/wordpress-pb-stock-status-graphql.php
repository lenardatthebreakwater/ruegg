<?php
/**
 * PB Stock Status GraphQL (Available on order)
 *
 * Version: 1.0.0
 * Updated: 2026-07-14
 *
 * Why this exists:
 * - WooCommerce on peisbutikken.no uses a custom stock status slug
 *   `available_on_order` ("Tilgjengelig på bestilling" / Available on order).
 * - WooGraphQL's `StockStatusEnum` only knows instock / outofstock / onbackorder
 *   by default. Serializing `stockStatus` for any product (or variation) with the
 *   custom status fails the *entire* GraphQL operation — e.g. brand archive
 *   queries die even when only a few SKUs use the status.
 * - This registers the custom value on the WooGraphQL enum so queries return
 *   `stockStatus: AVAILABLE_ON_ORDER` instead of erroring.
 *
 * Not the same as:
 * - The older WP snippets that add the status to Woo admin / classic frontend
 *   ("Add Available on order status Backend/Frontend"). Those teach WooCommerce;
 *   this teaches WPGraphQL.
 *
 * Install as:
 * - Code Snippets plugin (PHP snippet, run everywhere), OR
 * - mu-plugin: wp-content/mu-plugins/pb-stock-status-graphql.php
 *
 * Requires: WPGraphQL for WooCommerce (filter
 * `graphql_woocommerce_product_stock_statuses`, since ~0.11.2).
 *
 * After activate: confirm in GraphiQL that StockStatusEnum includes
 * AVAILABLE_ON_ORDER, and a product with that status returns without errors.
 * Also compare live file header Version with docs/wordpress/SNIPPETS.md.
 */)

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_STOCK_STATUS_GRAPHQL_SNIPPET_VERSION')) {
	define('PB_STOCK_STATUS_GRAPHQL_SNIPPET_VERSION', '1.0.0');
}

/**
 * Add custom Woo stock status to WooGraphQL StockStatusEnum.
 *
 * @param array<string, array<string, mixed>> $statuses Enum config keyed by GraphQL name.
 * @return array<string, array<string, mixed>>
 */
function pb_stock_status_graphql_register_statuses($statuses) {
	if (!is_array($statuses)) {
		$statuses = [];
	}

	$statuses['AVAILABLE_ON_ORDER'] = [
		'value'       => 'available_on_order',
		'description' => static function () {
			return __('Available on order (Peisbutikken custom stock status)', 'peisbutikken');
		},
	];

	return $statuses;
}
add_filter('graphql_woocommerce_product_stock_statuses', 'pb_stock_status_graphql_register_statuses');
