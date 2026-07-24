<?php
/**
 * PB GTIN / global unique id GraphQL sync snippet
 *
 * Version: 1.0.0
 * Updated: 2026-07-09
 *
 * Why this exists:
 * - The headless storefront reads GTIN via WPGraphQL `metaData(keysIn: [...])`, including `_global_unique_id`.
 * - WooCommerce may store "GTIN, UPC, EAN, or ISBN" in ways that do not surface as that post meta key,
 *   especially for variations (HPOS / internal storage).
 * - This mirrors `WC_Product::get_global_unique_id()` into `_global_unique_id` post meta on save so GraphQL can return it.
 *
 * Install as:
 * - mu-plugin: wp-content/mu-plugins/pb-gtin-graphql.php (recommended), OR
 * - Code Snippets plugin (PHP snippet, run everywhere)
 *
 * Requires: WooCommerce with WC_Product::get_global_unique_id() (WC 7.1+).
 *
 * Check installed version: file header Version / PB_GTIN_GRAPHQL_SNIPPET_VERSION
 * (no REST health). Inventory: docs/wordpress/SNIPPETS.md
 */)

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_GTIN_GRAPHQL_SNIPPET_VERSION')) {
	define('PB_GTIN_GRAPHQL_SNIPPET_VERSION', '1.0.0');
}

/**
 * @param WC_Product|WC_Product_Variation $product Product or variation instance.
 */
function pb_sync_global_unique_id_meta($product) {
	if (!is_object($product) || !method_exists($product, 'get_id')) {
		return;
	}
	$id = $product->get_id();
	if (!$id || !method_exists($product, 'get_global_unique_id')) {
		return;
	}
	$raw = $product->get_global_unique_id();
	$val = is_string($raw) ? trim($raw) : '';
	if ($val !== '') {
		update_post_meta($id, '_global_unique_id', wc_clean($val));
	} else {
		delete_post_meta($id, '_global_unique_id');
	}
}

add_action(
	'woocommerce_save_product_variation',
	static function ($variation_id) {
		$variation = wc_get_product((int) $variation_id);
		if ($variation && $variation->is_type('variation')) {
			pb_sync_global_unique_id_meta($variation);
		}
	},
	30,
	1
);

add_action(
	'woocommerce_after_product_object_save',
	static function ($product) {
		if (!$product instanceof WC_Product) {
			return;
		}
		if ($product->is_type('simple') || $product->is_type('variation')) {
			pb_sync_global_unique_id_meta($product);
		}
		if ($product->is_type('variable')) {
			foreach ($product->get_children() as $child_id) {
				$child = wc_get_product((int) $child_id);
				if ($child && $child->is_type('variation')) {
					pb_sync_global_unique_id_meta($child);
				}
			}
		}
	},
	30,
	1
);
