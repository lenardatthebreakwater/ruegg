import "server-only";

import { unstable_cache } from "next/cache";
import {
  getArchiveFetchCacheTags,
  getArchiveProductsPage,
} from "@/lib/graphql/server-products";
import { toArchiveCardProduct } from "@/lib/products/archive-card";
import type { Product } from "@/lib/types/product";

const INITIAL_PAGE_SIZE = 24;
const PAGINATION_PAGE_SIZE = 100;
const MAX_PAGES = 100;
// 24h safety net; the product-save webhook purges these tags on demand.
const DEFAULT_ARCHIVE_REVALIDATE_SECONDS = 60 * 60 * 24;

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

export type AggregateArchiveProductsOptions = {
  onSaleOnly?: boolean;
  categorySlug?: string;
  brandSlug?: string;
  reservedelerItemSlug?: string;
};

function getArchiveRevalidateSeconds(): number {
  const raw = process.env.PRODUCTS_ARCHIVE_REVALIDATE_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_ARCHIVE_REVALIDATE_SECONDS;
}

export async function aggregateArchiveProducts(
  options?: AggregateArchiveProductsOptions
): Promise<Product[]> {
  const onSaleOnly = options?.onSaleOnly === true;
  const categorySlug = options?.categorySlug?.trim() || undefined;
  const brandSlug = options?.brandSlug?.trim().toLocaleLowerCase("nb-NO") || undefined;
  const reservedelerItemSlug =
    options?.reservedelerItemSlug?.trim().toLocaleLowerCase("nb-NO") ||
    undefined;
  const keepAttributeTermSlugs = Boolean(reservedelerItemSlug);
  // The loaded set only depends on category/brand/sale — NOT on the
  // reservedeler item slug (that filter is applied below, after the cache).
  // Keying per item slug would give every one of the ~300 reservedeler item
  // pages its own copy of the same aggregate, each paying the full
  // aggregation on its first visit.
  const cacheKey = [
    onSaleOnly ? "sale" : "all",
    categorySlug ?? "all",
    brandSlug ?? "all",
    keepAttributeTermSlugs ? "with-term-slugs" : "no-term-slugs",
  ].join(":");
  const loadProducts = unstable_cache(
    async () => {
      const firstPage = await getArchiveProductsPage({
        first: INITIAL_PAGE_SIZE,
        after: null,
        onSaleOnly,
        categorySlug,
        brandSlug,
      });

      let products = [...firstPage.products];
      let cursor = firstPage.pageInfo.hasNextPage ? firstPage.pageInfo.endCursor : null;
      let pagesFetched = 1;

      while (cursor && pagesFetched < MAX_PAGES) {
        const page = await getArchiveProductsPage({
          first: PAGINATION_PAGE_SIZE,
          after: cursor,
          onSaleOnly,
          categorySlug,
          brandSlug,
        });

        products = dedupeProducts([...products, ...page.products]);
        cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
        pagesFetched += 1;
      }

      // Slim to the archive-card subset BEFORE caching: keeps cache entries
      // under the 2MB unstable_cache limit and shrinks the RSC payload that
      // gets embedded in every prerendered archive page.
      return dedupeProducts(products).map((product) =>
        toArchiveCardProduct(product, { keepAttributeTermSlugs })
      );
    },
    ["archive-aggregate-products", cacheKey],
    {
      revalidate: getArchiveRevalidateSeconds(),
      // Scope tag (`products:archive:shop` or `products:archive:{category}`) lets
      // path-only revalidation refresh one archive without purging the shared tag.
      tags: getArchiveFetchCacheTags({ categorySlug }),
    }
  );

  let products = await loadProducts();

  if (brandSlug) {
    products = products.filter(
      (product) => product.brandSlug?.trim().toLocaleLowerCase("nb-NO") === brandSlug
    );
  }

  if (reservedelerItemSlug) {
    products = products.filter((product) =>
      product.attributeTermSlugs?.some((slug) => slug === reservedelerItemSlug)
    );
  }

  return products;
}
