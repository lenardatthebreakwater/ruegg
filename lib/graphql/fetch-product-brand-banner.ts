import { cache } from "react";
import { graphqlRequest } from "@/lib/graphql/client";
import {
  PRODUCT_BRAND_ARCHIVE_BANNER_QUERY,
  PRODUCT_BRAND_ARCHIVE_BANNER_QUERY_BASE,
  PRODUCT_BRAND_ARCHIVE_BANNER_QUERY_MEDIA,
} from "@/lib/graphql/queries/products";
import type {
  TermArchiveBottomBlock,
  TermArchiveFaqItem,
  WooProductBrandArchiveBannerResponse,
} from "@/lib/graphql/types";
import {
  isTermArchiveFaqFieldError,
  isTermArchiveFieldError,
  normalizeTermArchiveBottomBlocks,
  normalizeTermArchiveFaq,
} from "@/lib/graphql/term-archive-normalize";
import { stripHtmlToText } from "@/lib/products/description-cards";

export type ProductBrandArchiveBanner = {
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

const BRAND_BANNER_CACHE_TAG = "products:brand-banner";
const BRAND_BANNER_REVALIDATE_SECONDS = 60 * 60 * 24;

async function requestBrandBanner(
  brandSlug: string,
  variant: BannerQueryVariant
): Promise<WooProductBrandArchiveBannerResponse> {
  const query =
    variant === "full"
      ? PRODUCT_BRAND_ARCHIVE_BANNER_QUERY
      : variant === "media"
        ? PRODUCT_BRAND_ARCHIVE_BANNER_QUERY_MEDIA
        : PRODUCT_BRAND_ARCHIVE_BANNER_QUERY_BASE;
  return graphqlRequest<WooProductBrandArchiveBannerResponse>(
    query,
    { brandSlug },
    {
      cache: "force-cache",
      next: {
        revalidate: BRAND_BANNER_REVALIDATE_SECONDS,
        tags: ["products", BRAND_BANNER_CACHE_TAG, `product-brand:${brandSlug}`],
      },
    }
  );
}

/**
 * WooCommerce product brand data for the archive hero + bottom/FAQ.
 * Cached per RSC request (shared by page + generateMetadata).
 */
async function getProductBrandArchiveBannerImpl(
  brandSlug: string
): Promise<ProductBrandArchiveBanner | null> {
  const normalized = decodeURIComponent(brandSlug).trim();
  if (!normalized) return null;

  let data: WooProductBrandArchiveBannerResponse;
  try {
    data = await requestBrandBanner(normalized, "full");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!isTermArchiveFieldError(msg)) {
      return null;
    }
    try {
      data = isTermArchiveFaqFieldError(msg)
        ? await requestBrandBanner(normalized, "media")
        : await requestBrandBanner(normalized, "base");
    } catch (e2) {
      const msg2 = e2 instanceof Error ? e2.message : String(e2);
      if (!isTermArchiveFieldError(msg2)) {
        return null;
      }
      try {
        data = await requestBrandBanner(normalized, "base");
      } catch {
        return null;
      }
    }
  }

  const node = data.productBrands?.nodes?.[0];
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

export const getProductBrandArchiveBanner = cache(getProductBrandArchiveBannerImpl);
