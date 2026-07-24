import { cache } from "react";
import { graphqlRequest } from "@/lib/graphql/client";
import {
  ATTRIBUTE_TERM_ARCHIVE_QUERY,
  ATTRIBUTE_TERM_ARCHIVE_QUERY_BASE,
  ATTRIBUTE_TERM_ARCHIVE_QUERY_MEDIA,
} from "@/lib/graphql/queries/products";
import type {
  TermArchiveBottomBlock,
  TermArchiveFaqItem,
  WooAttributeTermArchiveResponse,
} from "@/lib/graphql/types";
import {
  isTermArchiveFaqFieldError,
  isTermArchiveFieldError,
  normalizeTermArchiveBottomBlocks,
  normalizeTermArchiveFaq,
} from "@/lib/graphql/term-archive-normalize";
import { stripHtmlToText } from "@/lib/products/description-cards";

export type AttributeTermArchive = {
  name: string;
  descriptionPlain: string | null;
  bannerImage: { src: string; alt: string } | null;
  bottomBlocks: TermArchiveBottomBlock[];
  faqItems: TermArchiveFaqItem[];
};

/**
 * WPGraphQL TaxonomyEnum for a Woo attribute: `pa_aduro-deler` → `PAADURODELER`.
 */
export function wordpressTaxonomyToGraphqlEnum(taxonomy: string): string | null {
  const normalized = taxonomy.trim().toLowerCase();
  if (!normalized) return null;
  const enumName = normalized.replace(/[^a-z0-9]/g, "").toUpperCase();
  return enumName || null;
}

function toPlainDescription(htmlOrText: string | null | undefined): string | null {
  if (!htmlOrText?.trim()) return null;
  const text = stripHtmlToText(htmlOrText)
    .replace(/\n+/g, " ")
    .replace(/\r/g, "")
    .trim();
  return text || null;
}

type ArchiveQueryVariant = "full" | "media" | "base";

async function requestAttributeTermArchive(
  taxEnum: string,
  slug: string,
  variant: ArchiveQueryVariant
): Promise<WooAttributeTermArchiveResponse> {
  const query =
    variant === "full"
      ? ATTRIBUTE_TERM_ARCHIVE_QUERY
      : variant === "media"
        ? ATTRIBUTE_TERM_ARCHIVE_QUERY_MEDIA
        : ATTRIBUTE_TERM_ARCHIVE_QUERY_BASE;
  return graphqlRequest<WooAttributeTermArchiveResponse>(query, {
    taxonomies: [taxEnum],
    slug,
  });
}

/**
 * Attribute-term archive hero + bottom JetEngine slots (+ FAQ when present).
 * Cached per RSC request. Returns null when taxonomy/slug missing or GraphQL fails.
 */
async function getAttributeTermArchiveImpl(
  taxonomy: string,
  termSlug: string
): Promise<AttributeTermArchive | null> {
  const taxEnum = wordpressTaxonomyToGraphqlEnum(taxonomy);
  const slug = decodeURIComponent(termSlug).trim();
  if (!taxEnum || !slug) return null;

  let data: WooAttributeTermArchiveResponse;
  try {
    data = await requestAttributeTermArchive(taxEnum, slug, "full");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!isTermArchiveFieldError(msg)) {
      return null;
    }
    try {
      data = isTermArchiveFaqFieldError(msg)
        ? await requestAttributeTermArchive(taxEnum, slug, "media")
        : await requestAttributeTermArchive(taxEnum, slug, "base");
    } catch (e2) {
      const msg2 = e2 instanceof Error ? e2.message : String(e2);
      if (!isTermArchiveFieldError(msg2)) {
        return null;
      }
      try {
        data = await requestAttributeTermArchive(taxEnum, slug, "base");
      } catch {
        return null;
      }
    }
  }

  const node = data.terms?.nodes?.[0];
  if (!node?.name) return null;

  const headerUrl = node.headerImage1?.trim();
  const name = node.name;

  return {
    name,
    descriptionPlain: toPlainDescription(node.description),
    bannerImage: headerUrl ? { src: headerUrl, alt: name } : null,
    bottomBlocks: normalizeTermArchiveBottomBlocks(node.archiveBottomBlocks),
    faqItems: normalizeTermArchiveFaq(node.archiveFaq),
  };
}

export const getAttributeTermArchive = cache(getAttributeTermArchiveImpl);
