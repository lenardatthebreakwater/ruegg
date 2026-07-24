import { cache } from "react";
import { graphqlRequest } from "@/lib/graphql/client";
import {
  PRODUCT_CATEGORY_ARCHIVE_BANNER_QUERY,
  PRODUCT_CATEGORY_ARCHIVE_BANNER_QUERY_BASE,
  PRODUCT_CATEGORY_ARCHIVE_BANNER_QUERY_MEDIA,
} from "@/lib/graphql/queries/products";
import type {
  TermArchiveBottomBlock,
  TermArchiveFaqItem,
  WooProductCategoryArchiveBannerResponse,
} from "@/lib/graphql/types";
import {
  isTermArchiveFaqFieldError,
  isTermArchiveFieldError,
  normalizeTermArchiveBottomBlocks,
  normalizeTermArchiveFaq,
} from "@/lib/graphql/term-archive-normalize";
import { stripHtmlToText } from "@/lib/products/description-cards";

export type ProductCategoryArchiveBanner = {
  name: string;
  descriptionPlain: string | null;
  bannerImage: { src: string; alt: string } | null;
  bottomBlocks: TermArchiveBottomBlock[];
  faqItems: TermArchiveFaqItem[];
};

function toPlainDescription(htmlOrText: string | null | undefined): string | null {
  if (!htmlOrText?.trim()) return null;
  const text = stripHtmlToText(htmlOrText).replace(/\n+/g, " ").replace(/\r/g, "").trim();
  return text || null;
}

type BannerQueryVariant = "full" | "media" | "base";

const CATEGORY_BANNER_CACHE_TAG = "products:category-banner";
const CATEGORY_BANNER_REVALIDATE_SECONDS = 60 * 60 * 24;

async function requestCategoryBanner(
  categorySlug: string,
  variant: BannerQueryVariant
): Promise<WooProductCategoryArchiveBannerResponse> {
  const query =
    variant === "full"
      ? PRODUCT_CATEGORY_ARCHIVE_BANNER_QUERY
      : variant === "media"
        ? PRODUCT_CATEGORY_ARCHIVE_BANNER_QUERY_MEDIA
        : PRODUCT_CATEGORY_ARCHIVE_BANNER_QUERY_BASE;
  return graphqlRequest<WooProductCategoryArchiveBannerResponse>(
    query,
    { categorySlug },
    {
      cache: "force-cache",
      next: {
        revalidate: CATEGORY_BANNER_REVALIDATE_SECONDS,
        tags: ["products", CATEGORY_BANNER_CACHE_TAG, `product-category:${categorySlug}`],
      },
    }
  );
}

/**
 * WooCommerce product category data for the archive hero + bottom/FAQ.
 * Cached per RSC request (shared by page + generateMetadata).
 */
async function getProductCategoryArchiveBannerImpl(
  categorySlug: string
): Promise<ProductCategoryArchiveBanner | null> {
  const normalized = decodeURIComponent(categorySlug).trim();
  if (!normalized) return null;

  let data: WooProductCategoryArchiveBannerResponse;
  try {
    data = await requestCategoryBanner(normalized, "full");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!isTermArchiveFieldError(msg)) {
      return null;
    }
    try {
      data = isTermArchiveFaqFieldError(msg)
        ? await requestCategoryBanner(normalized, "media")
        : await requestCategoryBanner(normalized, "base");
    } catch (e2) {
      const msg2 = e2 instanceof Error ? e2.message : String(e2);
      if (!isTermArchiveFieldError(msg2)) {
        return null;
      }
      try {
        data = await requestCategoryBanner(normalized, "base");
      } catch {
        return null;
      }
    }
  }

  const node = data.productCategories?.nodes?.[0];
  if (!node?.name) return null;

  const headerUrl = node.headerImage1?.trim();
  const wooUrl = node.image?.sourceUrl?.trim();
  const src = headerUrl || wooUrl || null;
  const name = node.name;
  const alt = node.image?.altText?.trim() || name;

  return {
    name,
    descriptionPlain: toPlainDescription(node.description),
    bannerImage: src ? { src, alt } : null,
    bottomBlocks: normalizeTermArchiveBottomBlocks(node.archiveBottomBlocks),
    faqItems: normalizeTermArchiveFaq(node.archiveFaq),
  };
}

export const getProductCategoryArchiveBanner = cache(
  getProductCategoryArchiveBannerImpl
);
