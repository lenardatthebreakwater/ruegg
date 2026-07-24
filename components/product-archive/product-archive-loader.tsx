"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { ProductArchive } from "@/components/product-archive/product-archive";
import { ProductArchiveSkeleton } from "@/components/product-archive/product-archive-skeleton";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { buildProductsPageMeta } from "@/lib/products/page-meta";
import { searchProducts } from "@/lib/search/product-search";
import type { FAQItem } from "@/lib/data/homepage";
import type { TermArchiveBottomBlock } from "@/lib/graphql/types";
import type { Product } from "@/lib/types/product";
import { useArchiveProductsQuery } from "@/lib/tanstack/product-queries";
import { parseArchivePageParam } from "@/lib/product-archive-utils";

/**
 * Isolates useSearchParams() so its static-prerender bailout stays confined
 * to this (invisible) subtree. If the loader itself called useSearchParams,
 * React would skip server-rendering the whole archive on SSG pages and the
 * prerendered HTML would only contain the skeleton — terrible for LCP/SEO.
 * The params are handed up via effect after hydration instead.
 */
function SearchParamsBridge({
  onParams,
}: {
  onParams: (params: ReadonlyURLSearchParams) => void;
}) {
  const params = useSearchParams();

  useEffect(() => {
    onParams(params);
  }, [params, onParams]);

  return null;
}

type ProductArchiveLoaderProps = {
  title: string;
  subtitle?: string;
  bannerImage?: { src: string; alt?: string } | null;
  imageFit?: "cover" | "contain";
  bottomBlocks?: TermArchiveBottomBlock[];
  faqItems?: FAQItem[];
  faqCollectionLabel?: string;
  breadcrumbs: BreadcrumbItem[];
  onSaleOnly?: boolean;
  categorySlug?: string;
  brandSlug?: string;
  reservedelerItemSlug?: string;
  searchQuery?: string;
  initialProducts?: Product[];
  initialDataProvided?: boolean;
  hideBanner?: boolean;
};

export function ProductArchiveLoader({
  title,
  subtitle,
  bannerImage,
  imageFit = "cover",
  bottomBlocks,
  faqItems,
  faqCollectionLabel,
  breadcrumbs,
  onSaleOnly = false,
  categorySlug,
  brandSlug,
  reservedelerItemSlug,
  searchQuery = "",
  initialProducts,
  initialDataProvided = false,
  hideBanner = false,
}: ProductArchiveLoaderProps) {
  // The archive pages are statically prerendered, so query-string filters
  // (?brand=, ?onSale=, ?q=, ?category=, ?page=) are applied here on the
  // client on top of the server-provided (path-scoped) product set. The
  // params arrive via SearchParamsBridge after hydration (null during
  // SSR/prerender).
  const [urlParams, setUrlParams] = useState<ReadonlyURLSearchParams | null>(
    null
  );
  const urlCategory = urlParams?.get("category")?.trim() || undefined;
  const urlBrand = urlParams?.get("brand")?.trim() || undefined;
  const urlOnSale = urlParams?.get("onSale")?.trim() || undefined;
  const urlQuery = urlParams?.get("q")?.trim() || undefined;
  // undefined until SearchParamsBridge hydrates — ProductArchive applies
  // the page once params are ready (same Back/forward story as filters).
  const urlPage =
    urlParams == null
      ? undefined
      : parseArchivePageParam(urlParams.get("page"));

  const effectiveCategorySlug = categorySlug ?? urlCategory;
  const effectiveBrandSlug = brandSlug ?? urlBrand;
  const effectiveOnSaleOnly = onSaleOnly || urlOnSale === "true";
  const effectiveSearchQuery = searchQuery.trim() || urlQuery || "";

  const hasUrlOverrides =
    effectiveCategorySlug !== categorySlug ||
    effectiveBrandSlug !== brandSlug ||
    effectiveOnSaleOnly !== onSaleOnly ||
    effectiveSearchQuery !== searchQuery.trim();

  // Recompute hero meta when URL filters change what the page shows. Without
  // overrides, keep the server hero (which may include the WordPress
  // description/banner merge).
  const clientMeta = useMemo(
    () =>
      hasUrlOverrides
        ? buildProductsPageMeta({
            category: effectiveCategorySlug,
            brand: effectiveBrandSlug,
            onSale: effectiveOnSaleOnly ? "true" : undefined,
            q: urlQuery,
          })
        : null,
    [
      hasUrlOverrides,
      effectiveCategorySlug,
      effectiveBrandSlug,
      effectiveOnSaleOnly,
      urlQuery,
    ]
  );
  const displayTitle = clientMeta?.title ?? title;
  const displaySubtitle = clientMeta?.subtitle ?? subtitle;
  const displayBreadcrumbs = clientMeta?.breadcrumbs ?? breadcrumbs;

  const seededProducts = useMemo(
    () => (initialDataProvided ? (initialProducts ?? []) : []),
    [initialDataProvided, initialProducts]
  );
  // Fetch with the server's base scope (path-derived), not the URL overrides:
  // overrides are always a subset of the base set and are filtered below.
  const archiveQuery = useArchiveProductsQuery({
    onSaleOnly,
    categorySlug,
    brandSlug,
    reservedelerItemSlug,
    enabled: !initialDataProvided,
    initialData: initialDataProvided ? seededProducts : undefined,
  });
  const archiveProducts = useMemo(() => archiveQuery.data ?? [], [archiveQuery.data]);
  const archiveLoading = archiveQuery.isLoading;
  const archiveError = archiveQuery.error instanceof Error ? archiveQuery.error.message : null;

  const displayProducts = useMemo(() => {
    const baseProducts = archiveProducts;
    const baseLoading = archiveLoading;
    let list = baseLoading && baseProducts.length === 0 ? [] : baseProducts;

    // Keep this as a defensive guard, even when we query server-side filters.
    if (effectiveOnSaleOnly) list = list.filter((p) => p.onSale === true);

    if (effectiveCategorySlug) {
      list = list.filter((p) =>
        p.categories?.some((c) => c.slug === effectiveCategorySlug)
      );
    }

    if (effectiveBrandSlug) {
      const normalizedBrandSlug = effectiveBrandSlug
        .trim()
        .toLocaleLowerCase("nb-NO");
      list = list.filter(
        (p) => p.brandSlug?.trim().toLocaleLowerCase("nb-NO") === normalizedBrandSlug
      );
    }

    if (reservedelerItemSlug) {
      const normalizedReservedelerItemSlug = reservedelerItemSlug
        .trim()
        .toLocaleLowerCase("nb-NO");
      list = list.filter((p) =>
        p.attributeTermSlugs?.some((slug) => slug === normalizedReservedelerItemSlug)
      );
    }

    if (effectiveSearchQuery.trim()) {
      list = searchProducts(list, effectiveSearchQuery);
    }

    return list;
  }, [
    archiveProducts,
    archiveLoading,
    effectiveBrandSlug,
    effectiveCategorySlug,
    reservedelerItemSlug,
    effectiveOnSaleOnly,
    effectiveSearchQuery,
  ]);
  const effectiveError = archiveError;
  const effectiveLoading = archiveLoading;
  const effectiveProducts = archiveProducts;

  let content: ReactNode;
  if (effectiveError) {
    content = (
      <div className="flex min-h-[200px] items-center justify-center text-destructive">
        {effectiveError}
      </div>
    );
  } else if (effectiveLoading && effectiveProducts.length === 0) {
    content = (
      <ProductArchiveSkeleton
        title={displayTitle}
        subtitle={displaySubtitle}
        breadcrumbs={displayBreadcrumbs}
      />
    );
  } else {
    content = (
      <ProductArchive
        key={`${effectiveCategorySlug ?? ""}-${effectiveBrandSlug ?? ""}-${reservedelerItemSlug ?? ""}-${effectiveOnSaleOnly}-${effectiveSearchQuery}`}
        title={displayTitle}
        subtitle={displaySubtitle}
        bannerImage={bannerImage}
        imageFit={imageFit}
        bottomBlocks={bottomBlocks}
        faqItems={faqItems}
        faqCollectionLabel={faqCollectionLabel}
        breadcrumbs={displayBreadcrumbs}
        products={displayProducts}
        initialSearchQuery={effectiveSearchQuery}
        initialPage={urlPage}
        hideBanner={hideBanner}
      />
    );
  }

  return (
    <>
      {/* Suspense keeps the useSearchParams bailout inside this null-rendering
          bridge, so the archive itself is fully server-rendered on SSG pages. */}
      <Suspense fallback={null}>
        <SearchParamsBridge onParams={setUrlParams} />
      </Suspense>
      {content}
    </>
  );
}
