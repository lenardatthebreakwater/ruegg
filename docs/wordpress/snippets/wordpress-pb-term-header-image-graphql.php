<?php
/**
 * PB term archive media (GraphQL) – categories, brands, attribute terms
 *
 * Version: 1.2.0
 * Updated: 2026-07-18
 *
 * Exposes JetEngine / term meta used by archive pages:
 * - `headerImage1` — URL from `header-image1` / `header_image1`
 * - `archiveBottomBlocks` — list of bottom slots from `bottom-image-N`,
 *   `bottom-insp-N`, `bottom-text-N`, `bottom-linktext-N`, `bottom-linkurl-N`
 * - `archiveFaq` — FAQ items from JetEngine repeater `archive-faq`
 *   (`arch_q` / `arch_a`)
 *
 * Registered on GraphQL interface `TermNode` so fields work on:
 * - ProductCategory (product_cat)
 * - ProductBrand (brand taxonomy)
 * - Product attribute terms (e.g. PaAduroDeler / pa_aduro-deler)
 *
 * Install via Code Snippets plugin only (PHP snippet, run everywhere). Never as mu-plugin.
 *
 * Requires: WPGraphQL, WooGraphQL.
 *
 * Check installed version: file header Version / PB_TERM_HEADER_IMAGE_GRAPHQL_SNIPPET_VERSION
 * Inventory: docs/wordpress/SNIPPETS.md
 *
 * Changelog:
 * - 1.2.0: Expose `archiveFaq` from JetEngine repeater `archive-faq`.
 * - 1.1.1: Skip empty WYSIWYG/link bottom slots (strip tags before keep).
 * - 1.1.0: Register on TermNode (attribute terms); add archiveBottomBlocks.
 * - 1.0.0: headerImage1 on ProductCategory + ProductBrand.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'PB_TERM_HEADER_IMAGE_GRAPHQL_SNIPPET_VERSION' ) ) {
	define( 'PB_TERM_HEADER_IMAGE_GRAPHQL_SNIPPET_VERSION', '1.2.0' );
}

if ( ! function_exists( 'pb_graphql_term_id_from_source' ) ) {
	/**
	 * @param mixed $term Term object or array from WPGraphQL.
	 */
	function pb_graphql_term_id_from_source( $term ) {
		$term_id = 0;
		if ( is_object( $term ) && isset( $term->term_id ) ) {
			$term_id = (int) $term->term_id;
		} elseif ( is_array( $term ) && isset( $term['term_id'] ) ) {
			$term_id = (int) $term['term_id'];
		}
		return $term_id > 0 ? $term_id : 0;
	}
}

if ( ! function_exists( 'pb_graphql_resolve_attachment_or_url' ) ) {
	/**
	 * @param mixed $raw Attachment ID, URL string, or ACF/JetEngine-like array.
	 * @return string|null
	 */
	function pb_graphql_resolve_attachment_or_url( $raw ) {
		if ( $raw === '' || $raw === null || $raw === false ) {
			return null;
		}

		if ( is_array( $raw ) ) {
			if ( isset( $raw['url'] ) && is_string( $raw['url'] ) && $raw['url'] !== '' ) {
				return $raw['url'];
			}
			if ( isset( $raw['ID'] ) && is_numeric( $raw['ID'] ) ) {
				$raw = (int) $raw['ID'];
			} elseif ( isset( $raw['id'] ) && is_numeric( $raw['id'] ) ) {
				$raw = (int) $raw['id'];
			} else {
				return null;
			}
		}

		if ( is_numeric( $raw ) ) {
			$url = wp_get_attachment_image_url( (int) $raw, 'full' );
			return $url ? $url : null;
		}

		if ( is_string( $raw ) && filter_var( $raw, FILTER_VALIDATE_URL ) ) {
			return $raw;
		}

		return null;
	}
}

if ( ! function_exists( 'pb_graphql_resolve_term_header_image1' ) ) {
	/**
	 * @param mixed $term Term object or array from WPGraphQL.
	 */
	function pb_graphql_resolve_term_header_image1( $term ) {
		$term_id = pb_graphql_term_id_from_source( $term );
		if ( $term_id < 1 ) {
			return null;
		}

		$raw = get_term_meta( $term_id, 'header-image1', true );
		if ( $raw === '' || $raw === null ) {
			$raw = get_term_meta( $term_id, 'header_image1', true );
		}

		return pb_graphql_resolve_attachment_or_url( $raw );
	}
}

if ( ! function_exists( 'pb_graphql_is_blank_richtext' ) ) {
	/**
	 * @param mixed $value Raw term meta (HTML or plain).
	 */
	function pb_graphql_is_blank_richtext( $value ) {
		if ( $value === null || $value === false ) {
			return true;
		}
		if ( ! is_string( $value ) ) {
			return true;
		}
		$trimmed = trim( $value );
		if ( $trimmed === '' ) {
			return true;
		}
		return trim( wp_strip_all_tags( $trimmed ) ) === '';
	}
}

if ( ! function_exists( 'pb_graphql_resolve_term_archive_bottom_blocks' ) ) {
	/**
	 * Collect numbered JetEngine bottom archive slots (1–20) that have any content.
	 *
	 * @param mixed $term Term object or array from WPGraphQL.
	 * @return array<int, array<string, mixed>>
	 */
	function pb_graphql_resolve_term_archive_bottom_blocks( $term ) {
		$term_id = pb_graphql_term_id_from_source( $term );
		if ( $term_id < 1 ) {
			return array();
		}

		$blocks = array();

		for ( $i = 1; $i <= 20; $i++ ) {
			$image_url = pb_graphql_resolve_attachment_or_url(
				get_term_meta( $term_id, 'bottom-image-' . $i, true )
			);
			$insp_url  = pb_graphql_resolve_attachment_or_url(
				get_term_meta( $term_id, 'bottom-insp-' . $i, true )
			);
			$text_raw  = get_term_meta( $term_id, 'bottom-text-' . $i, true );
			$link_text = get_term_meta( $term_id, 'bottom-linktext-' . $i, true );
			$link_url  = get_term_meta( $term_id, 'bottom-linkurl-' . $i, true );

			$text_html = ( is_string( $text_raw ) && ! pb_graphql_is_blank_richtext( $text_raw ) )
				? trim( $text_raw )
				: '';
			$link_text = is_string( $link_text ) ? trim( $link_text ) : '';
			$link_url  = is_string( $link_url ) ? trim( $link_url ) : '';

			if ( ! $image_url && ! $insp_url && $text_html === '' && $link_text === '' && $link_url === '' ) {
				continue;
			}

			$blocks[] = array(
				'index'        => $i,
				'imageUrl'     => $image_url,
				'inspImageUrl' => $insp_url,
				'textHtml'     => $text_html !== '' ? $text_html : null,
				'linkText'     => $link_text !== '' ? $link_text : null,
				'linkUrl'      => $link_url !== '' ? $link_url : null,
			);
		}

		return $blocks;
	}
}

if ( ! function_exists( 'pb_graphql_normalize_archive_faq_rows' ) ) {
	/**
	 * @param mixed $raw JetEngine repeater / serialized term meta.
	 * @return array<int, array{question: string, answer: string}>
	 */
	function pb_graphql_normalize_archive_faq_rows( $raw ) {
		if ( is_string( $raw ) && $raw !== '' ) {
			$maybe = maybe_unserialize( $raw );
			if ( is_array( $maybe ) ) {
				$raw = $maybe;
			}
		}

		if ( ! is_array( $raw ) ) {
			return array();
		}

		// JetEngine sometimes wraps items under `items` / `value`.
		if ( isset( $raw['items'] ) && is_array( $raw['items'] ) ) {
			$raw = $raw['items'];
		} elseif ( isset( $raw['value'] ) && is_array( $raw['value'] ) ) {
			$raw = $raw['value'];
		}

		$out = array();
		foreach ( $raw as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$q = '';
			$a = '';
			foreach ( array( 'arch_q', 'question', 'q' ) as $q_key ) {
				if ( isset( $row[ $q_key ] ) && is_string( $row[ $q_key ] ) ) {
					$q = trim( $row[ $q_key ] );
					break;
				}
			}
			foreach ( array( 'arch_a', 'answer', 'a' ) as $a_key ) {
				if ( isset( $row[ $a_key ] ) && is_string( $row[ $a_key ] ) ) {
					$a = trim( $row[ $a_key ] );
					break;
				}
			}
			if ( $q === '' || pb_graphql_is_blank_richtext( $a ) ) {
				continue;
			}
			$out[] = array(
				'question' => $q,
				'answer'   => $a,
			);
		}

		return $out;
	}
}

if ( ! function_exists( 'pb_graphql_resolve_term_archive_faq' ) ) {
	/**
	 * @param mixed $term Term object or array from WPGraphQL.
	 * @return array<int, array{question: string, answer: string}>
	 */
	function pb_graphql_resolve_term_archive_faq( $term ) {
		$term_id = pb_graphql_term_id_from_source( $term );
		if ( $term_id < 1 ) {
			return array();
		}

		$raw = get_term_meta( $term_id, 'archive-faq', true );
		if ( $raw === '' || $raw === null ) {
			$raw = get_term_meta( $term_id, 'archive_faq', true );
		}

		return pb_graphql_normalize_archive_faq_rows( $raw );
	}
}

add_action(
	'graphql_register_types',
	static function () {
		static $registered = false;
		if ( $registered ) {
			return;
		}
		$registered = true;

		register_graphql_object_type(
			'PbTermArchiveBottomBlock',
			array(
				'description' => 'JetEngine bottom archive slot (image / insp / text / link).',
				'fields'      => array(
					'index'        => array(
						'type'        => 'Int',
						'description' => 'Slot number N from bottom-*-N meta keys.',
					),
					'imageUrl'     => array(
						'type'        => 'String',
						'description' => 'URL from bottom-image-N.',
					),
					'inspImageUrl' => array(
						'type'        => 'String',
						'description' => 'URL from bottom-insp-N.',
					),
					'textHtml'     => array(
						'type'        => 'String',
						'description' => 'HTML from bottom-text-N.',
					),
					'linkText'     => array(
						'type'        => 'String',
						'description' => 'Label from bottom-linktext-N.',
					),
					'linkUrl'      => array(
						'type'        => 'String',
						'description' => 'URL from bottom-linkurl-N.',
					),
				),
			)
		);

		register_graphql_object_type(
			'PbTermArchiveFaqItem',
			array(
				'description' => 'FAQ row from JetEngine archive-faq repeater.',
				'fields'      => array(
					'question' => array(
						'type'        => 'String',
						'description' => 'Question (arch_q).',
					),
					'answer'   => array(
						'type'        => 'String',
						'description' => 'Answer HTML (arch_a).',
					),
				),
			)
		);

		$header_config = array(
			'type'        => 'String',
			'description' => 'Banner image URL from term meta (header-image1).',
			'resolve'     => 'pb_graphql_resolve_term_header_image1',
		);

		$bottom_config = array(
			'type'        => array( 'list_of' => 'PbTermArchiveBottomBlock' ),
			'description' => 'Bottom archive media/text slots from JetEngine term meta.',
			'resolve'     => 'pb_graphql_resolve_term_archive_bottom_blocks',
		);

		$faq_config = array(
			'type'        => array( 'list_of' => 'PbTermArchiveFaqItem' ),
			'description' => 'FAQ items from JetEngine archive-faq repeater.',
			'resolve'     => 'pb_graphql_resolve_term_archive_faq',
		);

		// TermNode covers categories, brands, and product attribute terms.
		register_graphql_field( 'TermNode', 'headerImage1', $header_config );
		register_graphql_field( 'TermNode', 'archiveBottomBlocks', $bottom_config );
		register_graphql_field( 'TermNode', 'archiveFaq', $faq_config );
	},
	20
);
