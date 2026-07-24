"use client";

import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/lib/types/product";
import type { SearchProduct } from "@/lib/types/search-product";
import type {
  ProductArchiveApiResponse,
  ProductDetailApiResponse,
  SearchProductsApiResponse,
} from "@/lib/types/product-api";
import { queryKeys, type ProductArchiveFilters } from "@/lib/tanstack/query-keys";

const INITIAL_ARCHIVE_PAGE_SIZE = 24;
const PAGED_ARCHIVE_PAGE_SIZE = 100;
/** Mirror server-archive-aggregate MAX_PAGES to avoid unbounded client fetch loops. */
const MAX_ARCHIVE_PAGES = 100;
const SEARCH_INDEX_STALE_TIME_MS = 30 * 60 * 1000;

type ProductArchiveQueryInput = Omit<ProductArchiveFilters, "first" | "after">;

function normalizeStringParam(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeArchiveFilters(
  input: ProductArchiveQueryInput
): ProductArchiveQueryInput {
  return {
    onSaleOnly: input.onSaleOnly,
    categorySlug: normalizeStringParam(input.categorySlug),
    brandSlug: normalizeStringParam(input.brandSlug),
    reservedelerItemSlug: normalizeStringParam(input.reservedelerItemSlug),
  };
}

function buildArchivePageUrl(filters: ProductArchiveFilters): string {
  const params = new URLSearchParams({
    first: String(filters.first),
    onSaleOnly: filters.onSaleOnly ? "true" : "false",
  });
  if (filters.after) params.set("after", filters.after);
  if (filters.categorySlug) params.set("categorySlug", filters.categorySlug);
  if (filters.brandSlug) params.set("brandSlug", filters.brandSlug);
  if (filters.reservedelerItemSlug) {
    params.set("reservedelerItemSlug", filters.reservedelerItemSlug);
  }

  return `/api/products?${params.toString()}`;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  let json: unknown = null;
  try {
    json = (await response.json()) as unknown;
  } catch {
    json = null;
  }

  if (!response.ok) {
    const message =
      json &&
      typeof json === "object" &&
      "error" in json &&
      typeof json.error === "string"
        ? json.error
        : "Kunne ikke hente produkter.";
    throw new Error(message);
  }

  return json as T;
}

function dedupeProducts(products: Product[]): Product[] {
  const byKey = new Map<string, Product>();
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

async function fetchArchivePage(filters: ProductArchiveFilters): Promise<ProductArchiveApiResponse> {
  const response = await fetch(buildArchivePageUrl(filters), { method: "GET" });
  return parseJsonResponse<ProductArchiveApiResponse>(response);
}

export async function fetchArchiveProducts(input: ProductArchiveQueryInput): Promise<Product[]> {
  const normalizedFilters = normalizeArchiveFilters(input);
  const firstPage = await fetchArchivePage({
    ...normalizedFilters,
    first: INITIAL_ARCHIVE_PAGE_SIZE,
    after: null,
  });

  const products: Product[] = [...firstPage.products];
  let cursor = firstPage.pageInfo.hasNextPage ? firstPage.pageInfo.endCursor : null;
  let pagesFetched = 1;

  while (cursor && pagesFetched < MAX_ARCHIVE_PAGES) {
    const nextPage = await fetchArchivePage({
      ...normalizedFilters,
      first: PAGED_ARCHIVE_PAGE_SIZE,
      after: cursor,
    });
    products.push(...nextPage.products);
    cursor = nextPage.pageInfo.hasNextPage ? nextPage.pageInfo.endCursor : null;
    pagesFetched += 1;
  }

  if (cursor) {
    console.warn(
      `[archive] client fetch stopped after ${MAX_ARCHIVE_PAGES} pages; more products may exist`
    );
  }

  return dedupeProducts(products);
}

export function useArchiveProductsQuery(
  input: ProductArchiveQueryInput & { enabled?: boolean; initialData?: Product[] }
) {
  const normalizedFilters = normalizeArchiveFilters(input);
  const keyFilters: ProductArchiveFilters = {
    ...normalizedFilters,
    first: PAGED_ARCHIVE_PAGE_SIZE,
    after: null,
  };

  return useQuery({
    queryKey: queryKeys.products.archive(keyFilters),
    queryFn: () => fetchArchiveProducts(normalizedFilters),
    enabled: input.enabled ?? true,
    initialData: input.initialData,
  });
}

export async function fetchSearchProducts(): Promise<SearchProduct[]> {
  const response = await fetch("/api/search-products", { method: "GET" });
  const data = await parseJsonResponse<SearchProductsApiResponse>(response);
  return data.products ?? [];
}

export function useSearchProductsQuery(input?: {
  enabled?: boolean;
  initialData?: SearchProduct[];
}) {
  return useQuery({
    queryKey: queryKeys.products.searchIndex(),
    queryFn: fetchSearchProducts,
    enabled: input?.enabled ?? true,
    initialData: input?.initialData,
    staleTime: SEARCH_INDEX_STALE_TIME_MS,
    gcTime: SEARCH_INDEX_STALE_TIME_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export async function fetchProductDetail(slug: string): Promise<Product | null> {
  const response = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
    method: "GET",
  });
  if (response.status === 404) {
    return null;
  }
  const data = await parseJsonResponse<ProductDetailApiResponse>(response);
  return data.product ?? null;
}

export function useProductDetailQuery(input: {
  slug: string;
  enabled?: boolean;
  initialData?: Product | null;
}) {
  return useQuery({
    queryKey: queryKeys.products.detail(input.slug),
    queryFn: () => fetchProductDetail(input.slug),
    enabled: input.enabled ?? true,
    initialData: input.initialData ?? undefined,
  });
}
