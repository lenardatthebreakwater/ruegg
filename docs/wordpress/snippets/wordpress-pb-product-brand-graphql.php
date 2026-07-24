<?php
/**
 * PB Product Brand GraphQL compatibility snippet
 *
 * Version: 1.0.0
 * Updated: 2026-07-09
 *
 * Why this exists:
 * - Some setups use `product_brand`, others use `pwb-brand`.
 * - Re-registering taxonomies can reset important plugin args and break brand behavior.
 * - This snippet only adjusts taxonomy args during registration.
 *
 * Install as:
 * - mu-plugin: wp-content/mu-plugins/pb-product-brand-graphql.php (recommended), OR
 * - Code Snippets plugin (PHP snippet, run everywhere)
 *
 * Optional:
 * - Define PB_BRAND_TAXONOMY in wp-config.php to force a specific taxonomy slug.
 *   Example: define('PB_BRAND_TAXONOMY', 'pwb-brand');
 *
 * Check installed version: file header Version / PB_PRODUCT_BRAND_GRAPHQL_SNIPPET_VERSION
 * (no REST health). Inventory: docs/wordpress/SNIPPETS.md
 */)

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_PRODUCT_BRAND_GRAPHQL_SNIPPET_VERSION')) {
	define('PB_PRODUCT_BRAND_GRAPHQL_SNIPPET_VERSION', '1.0.0');
}

add_filter('register_taxonomy_args', function ($args, $taxonomy) {
	$brand_taxonomies = ['product_brand', 'pwb-brand'];
	if (!in_array($taxonomy, $brand_taxonomies, true)) {
		return $args;
	}

	// If both taxonomies exist in a mixed/legacy setup, avoid GraphQL name collisions
	// by allowing only one taxonomy to claim the productBrand/productBrands names.
	static $selected_taxonomy = null;
	if ($selected_taxonomy === null) {
		$forced = defined('PB_BRAND_TAXONOMY') ? (string) PB_BRAND_TAXONOMY : '';
		if ($forced !== '' && in_array($forced, $brand_taxonomies, true)) {
			$selected_taxonomy = $forced;
		} else {
			$selected_taxonomy = $taxonomy;
		}
	}

	if ($taxonomy !== $selected_taxonomy) {
		return $args;
	}

	$args['show_in_graphql'] = true;
	$args['graphql_single_name'] = 'productBrand';
	$args['graphql_plural_name'] = 'productBrands';

	return $args;
}, 20, 2);
