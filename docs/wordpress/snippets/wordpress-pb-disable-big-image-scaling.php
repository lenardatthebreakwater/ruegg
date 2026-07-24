<?php
/**
 * PB disable big-image scaling (-scaled)
 *
 * Version: 1.0.0
 * Updated: 2026-07-18
 *
 * WordPress (5.3+) downscales uploads larger than 2560px on the long edge and
 * stores a `-scaled` derivative as the “full” size. This snippet turns that off
 * so the original file is kept as-is.
 *
 * Does not delete existing `-scaled` files already on disk; only affects new
 * uploads (and re-uploads).
 *
 * Install via Code Snippets plugin only (PHP snippet, run everywhere).
 *
 * Changelog:
 * - 1.0.0: Disable `big_image_size_threshold`.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'PB_DISABLE_BIG_IMAGE_SCALING_SNIPPET_VERSION' ) ) {
	define( 'PB_DISABLE_BIG_IMAGE_SCALING_SNIPPET_VERSION', '1.0.0' );
}

add_filter( 'big_image_size_threshold', '__return_false' );
