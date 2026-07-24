<?php
/**
 * PB Reservedeler items endpoint
 *
 * Version: 1.0.0
 * Updated: 2026-07-09
 *
 * Install as:
 * - mu-plugin: wp-content/mu-plugins/pb-reservedeler-items.php (recommended), OR
 * - Code Snippets plugin (PHP snippet, run everywhere)
 *
 * Routes:
 * - GET /wp-json/pb/v1/reservedeler-items
 * - GET /wp-json/pb/v1/reservedeler-items/health
 *
 * Check installed version: GET /wp-json/pb/v1/reservedeler-items/health → snippetVersion
 * Inventory / deploy: docs/wordpress/SNIPPETS.md
 *
 * Response shape:
 * {
 *   "ok": true,
 *   "count": 123,
 *   "items": [
 *     {
 *       "brandSlug": "aduro",
 *       "itemSlug": "aduro-1-1-reservedeler",
 *       "name": "Aduro 1.1 reservedeler",
 *       "imageUrl": "https://..." | null,
 *       "imageAlt": "Aduro 1.1 reservedeler",
 *       "reservedelerTaxonomy": "pa_modell"
 *     }
 *   ]
 * }
 *
 * Notes:
 * - Reads products from WooCommerce category slug: "reservedeler"
 * - Uses product brand taxonomy (tries: product_brand, product_brands, pa_brand)
 * - Uses attribute term meta key: "reservedeler_card_image"
 * - Supports image meta as attachment ID, absolute URL, or ACF-like array with ["url"]
 *
 * Optional shared secret (define in wp-config.php):
 *   define('PB_RESERVEDELER_ITEMS_SECRET', 'your-secret');
 * Send header: X-PB-Reservedeler-Secret
 *
 * Manual test:
 * curl -sS "https://YOUR_HOST/wp-json/pb/v1/reservedeler-items/health"
 * curl -sS "https://YOUR_HOST/wp-json/pb/v1/reservedeler-items" | jq
 */

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_RESERVEDELER_ITEMS_SNIPPET_VERSION')) {
	define('PB_RESERVEDELER_ITEMS_SNIPPET_VERSION', '1.0.0');
}

const PB_RESERVEDELER_CATEGORY_SLUG = 'reservedeler';
const PB_RESERVEDELER_PAGE_SIZE = 200;
const PB_RESERVEDELER_MAX_PAGES = 100;

add_action('rest_api_init', function () {
	register_rest_route('pb/v1', '/reservedeler-items', [
		'methods' => 'GET',
		'callback' => 'pb_reservedeler_items_handler',
		'permission_callback' => '__return_true',
	]);

	register_rest_route('pb/v1', '/reservedeler-items/health', [
		'methods' => 'GET',
		'callback' => 'pb_reservedeler_items_health_handler',
		'permission_callback' => '__return_true',
	]);
});

function pb_reservedeler_items_health_handler(WP_REST_Request $request) {
	$wc_ready = class_exists('WooCommerce') && function_exists('wc_get_products');
	return rest_ensure_response([
		'ok' => true,
		'route' => 'pb/v1/reservedeler-items',
		'snippetVersion' => PB_RESERVEDELER_ITEMS_SNIPPET_VERSION,
		'woocommerce_ready' => $wc_ready,
		'category_slug' => PB_RESERVEDELER_CATEGORY_SLUG,
	]);
}

function pb_reservedeler_items_validate_secret(WP_REST_Request $request) {
	$expected = defined('PB_RESERVEDELER_ITEMS_SECRET') ? (string) PB_RESERVEDELER_ITEMS_SECRET : '';
	if ($expected === '') {
		return true;
	}

	$provided = (string) $request->get_header('x-pb-reservedeler-secret');
	if ($provided !== '' && hash_equals($expected, $provided)) {
		return true;
	}

	return new WP_Error('forbidden', 'Invalid reservedeler secret.', ['status' => 403]);
}

function pb_reservedeler_items_bootstrap_wc() {
	if (!class_exists('WooCommerce') || !function_exists('wc_get_products')) {
		return new WP_Error('woocommerce_missing', 'WooCommerce is not active.', ['status' => 500]);
	}

	return true;
}

function pb_reservedeler_items_get_brand_slugs($product_id) {
	$candidate_taxonomies = ['product_brand', 'product_brands', 'pa_brand'];
	$brand_slugs = [];

	foreach ($candidate_taxonomies as $taxonomy) {
		if (!taxonomy_exists($taxonomy)) {
			continue;
		}
		$terms = wp_get_post_terms($product_id, $taxonomy, ['fields' => 'slugs']);
		if (is_wp_error($terms) || !is_array($terms)) {
			continue;
		}
		foreach ($terms as $slug) {
			$normalized = sanitize_title((string) $slug);
			if ($normalized !== '') {
				$brand_slugs[$normalized] = true;
			}
		}
	}

	return array_keys($brand_slugs);
}

function pb_reservedeler_items_is_allowed_attribute_taxonomy($taxonomy) {
	$taxonomy = (string) $taxonomy;
	if ($taxonomy === '') {
		return false;
	}

	// Brand taxonomies are handled separately and should never be model cards.
	if (in_array($taxonomy, ['product_brand', 'product_brands', 'pa_brand'], true)) {
		return false;
	}

	// Exclude generic specification attributes that create noisy cards like
	// colors and dimensions (e.g. "Grå", "23,5", "0,1").
	$blocked = ['pa_hoyde', 'pa_bredde', 'pa_dybde', 'pa_farge', 'pa_overflate'];
	if (in_array($taxonomy, $blocked, true)) {
		return false;
	}

	// Reservedeler model taxonomies should normally be brand-specific "-deler".
	// If/when new naming is introduced, add it here.
	if (preg_match('/(^|[-_])deler$/i', $taxonomy)) {
		return true;
	}

	return false;
}

function pb_reservedeler_items_resolve_term_image($term_id, $term_name = '') {
	$raw = get_term_meta($term_id, 'reservedeler_card_image', true);
	$image_url = null;
	$image_alt = $term_name;

	if (is_numeric($raw)) {
		$attachment_id = absint($raw);
		if ($attachment_id > 0) {
			$image_url = (string) wp_get_attachment_image_url($attachment_id, 'large');
			$attachment_alt = (string) get_post_meta($attachment_id, '_wp_attachment_image_alt', true);
			if ($attachment_alt !== '') {
				$image_alt = $attachment_alt;
			}
		}
	} elseif (is_array($raw)) {
		if (!empty($raw['url']) && is_string($raw['url'])) {
			$image_url = trim($raw['url']);
		}
		if (!empty($raw['alt']) && is_string($raw['alt'])) {
			$image_alt = trim($raw['alt']);
		}
	} elseif (is_string($raw)) {
		$maybe_url = trim($raw);
		if ($maybe_url !== '') {
			$image_url = $maybe_url;
		}
	}

	if (!is_string($image_url) || $image_url === '' || !preg_match('#^https?://#i', $image_url)) {
		$image_url = null;
	}

	return [
		'url' => $image_url,
		'alt' => $image_alt !== '' ? $image_alt : $term_name,
	];
}

function pb_reservedeler_items_collect_product_ids() {
	$ids = [];
	$page = 1;

	while ($page <= PB_RESERVEDELER_MAX_PAGES) {
		$results = wc_get_products([
			'status' => 'publish',
			'limit' => PB_RESERVEDELER_PAGE_SIZE,
			'page' => $page,
			'return' => 'ids',
			'category' => [PB_RESERVEDELER_CATEGORY_SLUG],
		]);

		if (!is_array($results) || count($results) === 0) {
			break;
		}

		foreach ($results as $id) {
			$id = absint($id);
			if ($id > 0) {
				$ids[$id] = true;
			}
		}

		if (count($results) < PB_RESERVEDELER_PAGE_SIZE) {
			break;
		}
		$page += 1;
	}

	return array_keys($ids);
}

function pb_reservedeler_items_handler(WP_REST_Request $request) {
	try {
		$secret_ok = pb_reservedeler_items_validate_secret($request);
		if (is_wp_error($secret_ok)) {
			return $secret_ok;
		}

		$boot_ok = pb_reservedeler_items_bootstrap_wc();
		if (is_wp_error($boot_ok)) {
			return $boot_ok;
		}

		$product_ids = pb_reservedeler_items_collect_product_ids();
		$items_by_key = [];

		foreach ($product_ids as $product_id) {
			$product = wc_get_product($product_id);
			if (!$product) {
				continue;
			}

			$brand_slugs = pb_reservedeler_items_get_brand_slugs($product_id);
			if (count($brand_slugs) === 0) {
				continue;
			}

			$attributes = $product->get_attributes();
			if (!is_array($attributes) || count($attributes) === 0) {
				continue;
			}

			foreach ($attributes as $attribute) {
				if (!is_a($attribute, 'WC_Product_Attribute') || !$attribute->is_taxonomy()) {
					continue;
				}

				$taxonomy = $attribute->get_name();
				if (!is_string($taxonomy) || $taxonomy === '') {
					continue;
				}

				// Keep only reservedeler model taxonomies, skip generic attributes.
				if (!pb_reservedeler_items_is_allowed_attribute_taxonomy($taxonomy)) {
					continue;
				}

				$term_ids = $attribute->get_options();
				if (!is_array($term_ids) || count($term_ids) === 0) {
					continue;
				}

				foreach ($term_ids as $term_id) {
					$term_id = absint($term_id);
					if ($term_id <= 0) {
						continue;
					}

					$term = get_term($term_id, $taxonomy);
					if (!$term || is_wp_error($term)) {
						continue;
					}

					$image = pb_reservedeler_items_resolve_term_image($term_id, (string) $term->name);

					$item_slug = sanitize_title((string) $term->slug);
					if ($item_slug === '') {
						continue;
					}

					foreach ($brand_slugs as $brand_slug) {
						$key = $brand_slug . ':' . $item_slug;
						if (isset($items_by_key[$key])) {
							continue;
						}

						$items_by_key[$key] = [
							'brandSlug' => $brand_slug,
							'itemSlug' => $item_slug,
							'name' => (string) $term->name,
							'imageUrl' => $image['url'],
							'imageAlt' => $image['alt'],
							'reservedelerTaxonomy' => $taxonomy,
						];
					}
				}
			}
		}

		$items = array_values($items_by_key);
		usort($items, function ($a, $b) {
			$cmp = strcasecmp((string) $a['name'], (string) $b['name']);
			if ($cmp !== 0) {
				return $cmp;
			}
			return strcasecmp((string) $a['brandSlug'], (string) $b['brandSlug']);
		});

		return rest_ensure_response([
			'ok' => true,
			'count' => count($items),
			'items' => $items,
		]);
	} catch (Throwable $e) {
		error_log('[pb-reservedeler-items] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
		return new WP_Error(
			'internal_server_error',
			'Reservedeler endpoint failed. Check wp-content/debug.log for details.',
			['status' => 500]
		);
	}
}
