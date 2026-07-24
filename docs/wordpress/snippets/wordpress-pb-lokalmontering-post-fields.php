<?php
/**
 * DEPRECATED — disable or delete this snippet.
 *
 * Version: 1.1.0 (deprecated)
 * Updated: 2026-07-10
 *
 * JetEngine now exposes blog + section meta via native WP REST (`meta`).
 * The Next.js storefront hydrates from REST meta and no longer needs this
 * custom register_post_meta / register_rest_field / GraphQL registration.
 *
 * What to do in WP:
 * 1. Disable or remove this mu-plugin / WPCode snippet entirely.
 * 2. Keep JetEngine “Show in Rest API” enabled for:
 *    - blogheading-*, blogparagraph-*, blogimage-*, jetgallery1
 *    - sectionheading-1..3, sectionbody-1..3
 *
 * Do not leave a half-enabled copy that still registers the same keys —
 * that duplicates native JetEngine REST output.
 *
 * Historical purpose (no longer needed):
 * - blogheading-1..20 / blogparagraph-1..20 / blogimage-1..20
 * - jetgallery1 / jetgallery_1
 * - GraphQL aliases blogHeadingN / blogParagraphN / blogImageN / jetGallery1
 *
 * Inventory: docs/wordpress/SNIPPETS.md
 */

if (!defined('ABSPATH')) {
	exit;
}

if (!defined('PB_LOKALMONTERING_POST_FIELDS_SNIPPET_VERSION')) {
	define('PB_LOKALMONTERING_POST_FIELDS_SNIPPET_VERSION', '1.1.0');
}

// Intentionally empty: native JetEngine REST replaces this snippet.
// If you still see this file active, disable the snippet in WPCode / remove the mu-plugin.
