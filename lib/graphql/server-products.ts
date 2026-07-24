import "server-only";

import { cache } from "react";
import { graphqlRequest } from "@/lib/graphql/client";
import {
  BEST_SELLING_QUERY,
  MEDIA_ITEMS_BY_DATABASE_IDS_QUERY,
  POPULAR_FIREPLACES_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  PRODUCTS_BY_BRAND_ON_SALE_QUERY,
  PRODUCTS_BY_BRAND_QUERY,
  PRODUCTS_BY_CATEGORY_BRAND_ON_SALE_QUERY,
  PRODUCTS_BY_CATEGORY_BRAND_QUERY,
  PRODUCTS_BY_CATEGORY_ON_SALE_QUERY,
  PRODUCTS_BY_CATEGORY_QUERY,
  PRODUCTS_ON_SALE_QUERY,
  PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from "@/lib/graphql/queries/products";
import { enrichProductsEnergyMetaFromWooNodes } from "@/lib/graphql/enrich-energy-meta";
import {
  mapWooProductToProduct,
  mapWooProductToSearchProduct,
} from "@/lib/graphql/map-woo-product";
import { parseMetaImageValue } from "@/lib/graphql/parse-meta-image-value";
import type {
  WooMediaItemsByIdsResponse,
  WooProductBySlugResponse,
  WooProductMetaData,
  WooProductsResponse,
} from "@/lib/graphql/types";
import type {
  ProductArchiveApiResponse,
  ProductDetailApiResponse,
} from "@/lib/types/product-api";
import type { SearchProduct } from "@/lib/types/search-product";
import type { Product, ProductGalleryItem } from "@/lib/types/product";

// 24h safety nets; the product-save webhook purges these tags on demand.
const DEFAULT_ARCHIVE_REVALIDATE_SECONDS = 60 * 60 * 24;
const DEFAULT_DETAIL_REVALIDATE_SECONDS = 60 * 60 * 24;
const MAX_PAGE_SIZE = 100;

export const PRODUCTS_CACHE_TAG = "products";
export const PRODUCTS_ARCHIVE_CACHE_TAG = "products:archive";
/** Scope tag for unfiltered /shop aggregate fetches (not per-category hubs). */
export const PRODUCTS_ARCHIVE_SHOP_CACHE_TAG = "products:archive:shop";
export const PRODUCTS_SEARCH_CACHE_TAG = "products:search";
const PRODUCT_CACHE_TAG_PREFIX = "product:";

export function getProductCacheTag(slug: string): string {
  return `${PRODUCT_CACHE_TAG_PREFIX}${slug}`;
}

/** Per-category archive data tag, e.g. `products:archive:lagersalg`. */
export function getArchiveCategoryCacheTag(categorySlug: string): string {
  return `${PRODUCTS_ARCHIVE_CACHE_TAG}:${categorySlug}`;
}

/**
 * Tags for archive GraphQL fetches: shared tags plus a scope tag so path-only
 * revalidation can refresh one hub/category without purging `products:archive`.
 */
export function getArchiveFetchCacheTags(options?: {
  categorySlug?: string | null;
}): string[] {
  const categorySlug = options?.categorySlug?.trim() ?? "";
  const scopeTag =
    categorySlug.length > 0
      ? getArchiveCategoryCacheTag(categorySlug)
      : PRODUCTS_ARCHIVE_SHOP_CACHE_TAG;
  return [PRODUCTS_CACHE_TAG, PRODUCTS_ARCHIVE_CACHE_TAG, scopeTag];
}

function getArchiveRevalidateSeconds(): number {
  const raw = process.env.PRODUCTS_ARCHIVE_REVALIDATE_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_ARCHIVE_REVALIDATE_SECONDS;
}

function getDetailRevalidateSeconds(): number {
  const raw = process.env.PRODUCT_DETAIL_REVALIDATE_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_DETAIL_REVALIDATE_SECONDS;
}

function clampPageSize(first: number): number {
  return Math.min(Math.max(1, Math.trunc(first)), MAX_PAGE_SIZE);
}

function isNodeVisibleInSearch(node: WooProductResponseNode): boolean {
  const visibility = node.catalogVisibility?.trim().toLocaleLowerCase("nb-NO") ?? "";
  if (!visibility) return true;
  return visibility === "visible" || visibility === "search";
}

type WooProductResponseNode = WooProductsResponse["products"]["nodes"][number];

function dedupeSearchProducts(products: SearchProduct[]): SearchProduct[] {
  const byKey = new Map<string, SearchProduct>();
  for (const product of products) {
    const key =
      (typeof product.slug === "string" && product.slug.length > 0
        ? `slug:${product.slug}`
        : null) ??
      (typeof product.id === "string" && product.id.length > 0
        ? `id:${product.id}`
        : null);
    if (!key || byKey.has(key)) continue;
    byKey.set(key, product);
  }
  return [...byKey.values()];
}

function getMetaValue(
  metaData: WooProductMetaData[] | null | undefined,
  key: string
): string | null {
  if (!metaData) return null;
  return metaData.find((entry) => entry.key === key)?.value ?? null;
}

const isAbsoluteHttpUrl = (value: string) => /^https?:\/\//i.test(value);

type GalleryMetaEntry = {
  rawImage: string;
  altText?: string;
  text?: string;
};

function getLegacyInspirationEntries(
  metaData: WooProductMetaData[] | null | undefined
): GalleryMetaEntry[] {
  return [1, 2, 3]
    .map((idx) => {
      const rawImage = getMetaValue(metaData, `insp-image-${idx}`)?.trim() ?? "";
      const text = getMetaValue(metaData, `insp-text-${idx}`)?.trim() ?? "";
      return {
        rawImage,
        text: text.length > 0 ? text : undefined,
      };
    })
    .filter((entry) => entry.rawImage.length > 0);
}

function parseGalleryMetaEntries(
  metaData: WooProductMetaData[] | null | undefined,
  key: string
): GalleryMetaEntry[] {
  const raw = getMetaValue(metaData, key)?.trim() ?? "";
  if (!raw) return [];

  if (isAbsoluteHttpUrl(raw) || /^\d+$/.test(raw)) {
    return [{ rawImage: raw }];
  }
  if (/^\d+(?:\s*,\s*\d+)+$/.test(raw)) {
    return raw
      .split(",")
      .map((value) => value.trim())
      .filter((value) => /^\d+$/.test(value))
      .map((value) => ({ rawImage: value }));
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const sourceItems = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object"
        ? Object.values(parsed as Record<string, unknown>)
        : [];

    return sourceItems
      .map((item): GalleryMetaEntry | null => {
        if (typeof item === "string") {
          const value = item.trim();
          if (!value || (!isAbsoluteHttpUrl(value) && !/^\d+$/.test(value))) {
            return null;
          }
          return { rawImage: value };
        }

        if (typeof item === "number" && Number.isInteger(item) && item > 0) {
          return { rawImage: String(item) };
        }

        if (!item || typeof item !== "object") {
          return null;
        }

        const objectItem = item as Record<string, unknown>;
        const idCandidate =
          (typeof objectItem.id === "number" && Number.isInteger(objectItem.id)
            ? String(objectItem.id)
            : typeof objectItem.id === "string"
              ? objectItem.id.trim()
              : typeof objectItem.ID === "number" && Number.isInteger(objectItem.ID)
                ? String(objectItem.ID)
                : typeof objectItem.ID === "string"
                  ? objectItem.ID.trim()
                  : "");

        const urlCandidate =
          (typeof objectItem.url === "string" && objectItem.url.trim()) ||
          (typeof objectItem.sourceUrl === "string" && objectItem.sourceUrl.trim()) ||
          (typeof objectItem.src === "string" && objectItem.src.trim()) ||
          "";

        const rawImage =
          urlCandidate ||
          (/^\d+$/.test(idCandidate) ? idCandidate : "");
        if (!rawImage) {
          return null;
        }

        const altText =
          typeof objectItem.altText === "string"
            ? objectItem.altText.trim()
            : typeof objectItem.alt === "string"
              ? objectItem.alt.trim()
              : "";
        const textCandidates = [
          objectItem.text,
          objectItem.caption,
          objectItem.title,
          objectItem.description,
        ];
        const text = textCandidates
          .find((candidate) => typeof candidate === "string" && candidate.trim().length > 0)
          ?.toString()
          .trim();

        return {
          rawImage,
          altText: altText || undefined,
          text: text && text.length > 0 ? text : undefined,
        };
      })
      .filter((entry): entry is GalleryMetaEntry => entry != null);
  } catch {
    const fallbackUrl = parseMetaImageValue(raw);
    return fallbackUrl ? [{ rawImage: fallbackUrl }] : [];
  }
}

function collectGalleryMediaIds(entryGroups: GalleryMetaEntry[][]): number[] {
  const ids = new Set<number>();
  for (const entries of entryGroups) {
    for (const entry of entries) {
      if (!/^\d+$/.test(entry.rawImage)) continue;
      const id = Number.parseInt(entry.rawImage, 10);
      if (Number.isFinite(id)) ids.add(id);
    }
  }
  return [...ids];
}

function mapGalleryEntriesWithMedia(
  entries: GalleryMetaEntry[],
  mediaById: Map<number, { sourceUrl: string; altText?: string | null }>
): ProductGalleryItem[] {
  return entries
    .map((entry): ProductGalleryItem | null => {
      if (isAbsoluteHttpUrl(entry.rawImage)) {
        return {
          imageUrl: entry.rawImage,
          altText: entry.altText,
          text: entry.text,
        };
      }
      if (!/^\d+$/.test(entry.rawImage)) return null;
      const id = Number.parseInt(entry.rawImage, 10);
      const media = mediaById.get(id);
      if (!media?.sourceUrl) return null;
      return {
        imageUrl: media.sourceUrl,
        altText: entry.altText ?? media.altText ?? undefined,
        text: entry.text,
      };
    })
    .filter((item): item is ProductGalleryItem => item != null && item.imageUrl.length > 0);
}

async function resolveGalleryEntryGroups(
  entryGroups: GalleryMetaEntry[][]
): Promise<ProductGalleryItem[][]> {
  const numericIds = collectGalleryMediaIds(entryGroups);
  if (numericIds.length === 0) {
    return entryGroups.map((entries) => mapGalleryEntriesWithMedia(entries, new Map()));
  }

  try {
    const mediaData = await graphqlRequest<WooMediaItemsByIdsResponse>(
      MEDIA_ITEMS_BY_DATABASE_IDS_QUERY,
      { ids: numericIds.map((id) => String(id)) },
      {
        cache: "force-cache",
        next: { revalidate: getDetailRevalidateSeconds(), tags: [PRODUCTS_CACHE_TAG] },
      }
    );
    const mediaById = new Map(
      (mediaData.mediaItems?.nodes ?? []).map((media) => [media.databaseId, media])
    );
    return entryGroups.map((entries) => mapGalleryEntriesWithMedia(entries, mediaById));
  } catch {
    return entryGroups.map((entries) =>
      mapGalleryEntriesWithMedia(
        entries.filter((entry) => isAbsoluteHttpUrl(entry.rawImage)),
        new Map()
      )
    );
  }
}

export async function getArchiveProductsPage(options?: {
  first?: number;
  after?: string | null;
  onSaleOnly?: boolean;
  categorySlug?: string | null;
  brandSlug?: string | null;
  reservedelerItemSlug?: string | null;
}): Promise<ProductArchiveApiResponse> {
  const first = clampPageSize(options?.first ?? 24);
  const after = options?.after ? options.after : null;
  const onSaleOnly = options?.onSaleOnly === true;
  const categorySlug = options?.categorySlug?.trim() ?? "";
  const brandSlug = options?.brandSlug?.trim().toLocaleLowerCase("nb-NO") ?? "";
  const reservedelerItemSlug =
    options?.reservedelerItemSlug?.trim().toLocaleLowerCase("nb-NO") ?? "";
  const hasCategoryFilter = categorySlug.length > 0;
  const hasBrandFilter = brandSlug.length > 0;

  const query = hasCategoryFilter
    ? hasBrandFilter
      ? onSaleOnly
        ? PRODUCTS_BY_CATEGORY_BRAND_ON_SALE_QUERY
        : PRODUCTS_BY_CATEGORY_BRAND_QUERY
      : onSaleOnly
        ? PRODUCTS_BY_CATEGORY_ON_SALE_QUERY
        : PRODUCTS_BY_CATEGORY_QUERY
    : hasBrandFilter
      ? onSaleOnly
        ? PRODUCTS_BY_BRAND_ON_SALE_QUERY
        : PRODUCTS_BY_BRAND_QUERY
      : onSaleOnly
        ? PRODUCTS_ON_SALE_QUERY
        : PRODUCTS_QUERY;
  const revalidateSeconds = getArchiveRevalidateSeconds();

  const variables: Record<string, unknown> = { first, after };
  if (hasCategoryFilter) {
    variables.categorySlug = [categorySlug];
  }
  if (hasBrandFilter) {
    variables.brandSlug = [brandSlug];
  }

  const archiveTags = getArchiveFetchCacheTags({ categorySlug });

  let data: WooProductsResponse;
  try {
    data = await graphqlRequest<WooProductsResponse>(
      query,
      variables as { first: number; after: string | null; categorySlug?: string[]; brandSlug?: string[] },
      {
        cache: "force-cache",
        next: {
          revalidate: revalidateSeconds,
          tags: archiveTags,
        },
      }
    );
  } catch (error) {
    if (!onSaleOnly) throw error;

    // Graceful fallback for WooGraphQL setups that do not support onSale filter.
    const fallbackQuery = hasCategoryFilter
      ? hasBrandFilter
        ? PRODUCTS_BY_CATEGORY_BRAND_QUERY
        : PRODUCTS_BY_CATEGORY_QUERY
      : hasBrandFilter
        ? PRODUCTS_BY_BRAND_QUERY
        : PRODUCTS_QUERY;
    const fallbackData = await graphqlRequest<WooProductsResponse>(
      fallbackQuery,
      variables as { first: number; after: string | null; categorySlug?: string[]; brandSlug?: string[] },
      {
        cache: "force-cache",
        next: {
          revalidate: revalidateSeconds,
          tags: archiveTags,
        },
      }
    );
    data = {
      products: {
        nodes: (fallbackData.products?.nodes ?? []).filter((product) => product.onSale === true),
        pageInfo: {
          hasNextPage: fallbackData.products?.pageInfo?.hasNextPage ?? false,
          endCursor: fallbackData.products?.pageInfo?.endCursor ?? null,
        },
      },
    };
  }

  const nodes = data.products?.nodes ?? [];
  let products = nodes.map(mapWooProductToProduct);
  await enrichProductsEnergyMetaFromWooNodes(products, nodes);

  if (reservedelerItemSlug) {
    products = products.filter((product) =>
      product.attributeTermSlugs?.some((slug) => slug === reservedelerItemSlug)
    );
  }

  return {
    products,
    pageInfo: {
      hasNextPage: Boolean(data.products?.pageInfo?.hasNextPage),
      endCursor: data.products?.pageInfo?.endCursor ?? null,
    },
  };
}

export async function getSearchProducts(): Promise<SearchProduct[]> {
  const revalidateSeconds = getArchiveRevalidateSeconds();
  const products: SearchProduct[] = [];
  let cursor: string | null = null;

  while (true) {
    const data: WooProductsResponse = await graphqlRequest<WooProductsResponse>(
      SEARCH_PRODUCTS_QUERY,
      { first: MAX_PAGE_SIZE, after: cursor },
      {
        cache: "force-cache",
        next: {
          revalidate: revalidateSeconds,
          tags: [PRODUCTS_CACHE_TAG, PRODUCTS_ARCHIVE_CACHE_TAG, PRODUCTS_SEARCH_CACHE_TAG],
        },
      }
    );

    const nodes = (data.products?.nodes ?? []).filter(isNodeVisibleInSearch);
    products.push(...nodes.map(mapWooProductToSearchProduct));

    if (!data.products?.pageInfo?.hasNextPage) {
      break;
    }
    cursor = data.products.pageInfo.endCursor ?? null;
    if (!cursor) break;
  }

  return dedupeSearchProducts(products);
}

const PRODUCT_NOT_FOUND_ERROR_MESSAGE =
  "No product ID was found corresponding to the slug";

async function fetchAndMapProductDetail(
  normalizedSlug: string
): Promise<ProductDetailApiResponse> {
  const revalidateSeconds = getDetailRevalidateSeconds();
  const data = await graphqlRequest<WooProductBySlugResponse>(
    PRODUCT_BY_SLUG_QUERY,
    { slug: normalizedSlug },
    {
      cache: "force-cache",
      next: {
        revalidate: revalidateSeconds,
        tags: [PRODUCTS_CACHE_TAG, getProductCacheTag(normalizedSlug)],
      },
    }
  );

  if (!data.product) return { product: null };

  const product = mapWooProductToProduct(data.product);
  // mapWooProductToProduct already resolves direct energy URLs; enrich batches
  // remaining attachment-ID lookups (product + variations) in one media query.
  await enrichProductsEnergyMetaFromWooNodes([product], [data.product]);

  const inspirationMetaEntries = parseGalleryMetaEntries(
    data.product.metaData,
    "product_inspiration_gallery"
  );
  const inspirationEntries =
    inspirationMetaEntries.length > 0
      ? inspirationMetaEntries
      : getLegacyInspirationEntries(data.product.metaData);
  const blueprintMetaEntries = parseGalleryMetaEntries(
    data.product.metaData,
    "product_blueprint_gallery"
  );

  // Resolve both galleries in one media-ID round-trip when possible.
  const [inspirationGallery, blueprintGallery] = await resolveGalleryEntryGroups([
    inspirationEntries,
    blueprintMetaEntries,
  ]);
  if (inspirationGallery.length > 0) {
    product.inspirationGallery = inspirationGallery;
  }
  if (blueprintGallery.length > 0) {
    product.blueprintGallery = blueprintGallery;
  }

  return { product };
}

async function loadProductDetailBySlug(
  slug: string
): Promise<ProductDetailApiResponse> {
  const normalizedSlug = decodeURIComponent(slug).trim();
  if (!normalizedSlug) return { product: null };

  // Build-time retries stay inside the cached loader so generateMetadata and
  // the page share one attempt chain (not a cached rejection + dead retries).
  const maxAttempts = process.env.NEXT_PHASE === "phase-production-build" ? 4 : 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetchAndMapProductDetail(normalizedSlug);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes(PRODUCT_NOT_FOUND_ERROR_MESSAGE)
      ) {
        return { product: null };
      }

      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
        continue;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Product detail fetch failed");
}

/**
 * Request-level memoization so generateMetadata + page share one GraphQL
 * fetch and the same post-processed ProductDetail payload.
 */
export const getProductDetailBySlug = cache(loadProductDetailBySlug);

export async function getBestSellingProducts(limit = 8): Promise<Product[]> {
  const first = clampPageSize(limit);
  const revalidateSeconds = getArchiveRevalidateSeconds();
  const data = await graphqlRequest<WooProductsResponse>(
    BEST_SELLING_QUERY,
    { first },
    {
      cache: "force-cache",
      next: {
        revalidate: revalidateSeconds,
        tags: [PRODUCTS_CACHE_TAG, PRODUCTS_ARCHIVE_CACHE_TAG],
      },
    }
  );
  const nodes = data.products?.nodes ?? [];
  const products = nodes.map(mapWooProductToProduct);
  await enrichProductsEnergyMetaFromWooNodes(products, nodes);
  return products;
}

export async function getPopularFireplacesProducts(limit = 8): Promise<Product[]> {
  const first = clampPageSize(limit);
  const revalidateSeconds = getArchiveRevalidateSeconds();
  const data = await graphqlRequest<WooProductsResponse>(
    POPULAR_FIREPLACES_QUERY,
    { first },
    {
      cache: "force-cache",
      next: {
        revalidate: revalidateSeconds,
        tags: [PRODUCTS_CACHE_TAG, PRODUCTS_ARCHIVE_CACHE_TAG],
      },
    }
  );
  const nodes = data.products?.nodes ?? [];
  const products = nodes.map(mapWooProductToProduct);
  await enrichProductsEnergyMetaFromWooNodes(products, nodes);
  return products;
}
