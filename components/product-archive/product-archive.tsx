"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Product } from "@/lib/types/product";
import type {
  ProductArchiveFilterConfig,
  ProductArchiveFilters,
  ProductArchiveSortOrder,
  ProductArchiveViewMode,
} from "@/lib/types/product-archive";
import { DEFAULT_FILTER_CONFIG } from "@/lib/types/product-archive";
import {
  clampArchivePage,
  filterProducts,
  getDefaultFilters,
  sortProducts,
} from "@/lib/product-archive-utils";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import { ProductArchiveBanner } from "@/components/product-archive/product-archive-banner";
import { ProductArchiveBottom } from "@/components/product-archive/product-archive-bottom";
import { ProductArchiveFaq } from "@/components/product-archive/product-archive-faq";
import { ProductArchiveSidebar } from "@/components/product-archive/product-archive-sidebar";
import { ProductArchiveToolbar } from "@/components/product-archive/product-archive-toolbar";
import { ProductArchiveGrid } from "@/components/product-archive/product-archive-grid";
import { ContainedLayout } from "@/components/layout/contained-layout";
import type { FAQItem } from "@/lib/data/homepage";
import type { TermArchiveBottomBlock } from "@/lib/graphql/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { recordSearchQuery, trackSearchBiEvent } from "@/lib/search/search-history";
import { useMountEffect } from "@/lib/hooks/effect-last";
import { ChevronUp } from "lucide-react";
import {
  buildGa4ItemFromProduct,
  slugifyItemListId,
} from "@/lib/analytics/ga4-item";
import { pushGa4EcommerceEvent } from "@/lib/analytics/push-ga4-ecommerce-event";
import {
  readStoredProductArchiveViewMode,
  storeProductArchiveViewMode,
} from "@/lib/product-archive-view-mode";

const DEFAULT_PAGE_SIZE = 12;

export type ProductArchiveProps = {
  /** Title shown in the banner (e.g. brand name, category, "Produkter") */
  title: string;
  /** Optional subtitle under the title */
  subtitle?: string;
  /** Optional banner image */
  bannerImage?: { src: string; alt?: string } | null;
  /** Banner/bottom image fit; reservedeler passes `contain` to avoid cropping diagrams */
  imageFit?: "cover" | "contain";
  /** Optional JetEngine bottom archive slots (images / text / links) */
  bottomBlocks?: TermArchiveBottomBlock[];
  /** Optional JetEngine archive-faq rows */
  faqItems?: FAQItem[];
  /** Label used in FAQ section title (e.g. category/brand name) */
  faqCollectionLabel?: string;
  /** Breadcrumb items (last item is current page, no href) */
  breadcrumbs: BreadcrumbItem[];
  /** All products to display and filter */
  products: Product[];
  /** Which filter sections to show (default: all) */
  filterConfig?: ProductArchiveFilterConfig;
  /** Products per page (default 12) */
  pageSize?: number;
  /** Optional extra class for the main content area */
  className?: string;
  /** Optional initial search query from URL or quick-search handoff */
  initialSearchQuery?: string;
  /**
   * 1-based page from `?page=` after SearchParamsBridge hydrates.
   * `undefined` means URL params are not ready yet.
   */
  initialPage?: number;
  /**
   * Hide the archive banner (e.g. hub sale pages that already have a hero).
   * Renders as a `div` instead of `main` so the page can own the landmark.
   */
  hideBanner?: boolean;
};

export function ProductArchive({
  title,
  subtitle,
  bannerImage,
  imageFit = "cover",
  bottomBlocks = [],
  faqItems = [],
  faqCollectionLabel,
  breadcrumbs,
  products,
  filterConfig = DEFAULT_FILTER_CONFIG,
  pageSize = DEFAULT_PAGE_SIZE,
  className,
  initialSearchQuery = "",
  initialPage,
  hideBanner = false,
}: ProductArchiveProps) {
  const Root = hideBanner ? "div" : "main";
  const router = useRouter();
  const pathname = usePathname();
  const defaultFiltersForProducts = React.useMemo(
    () => getDefaultFilters(products),
    [products]
  );
  const [filters, setFilters] = React.useState<ProductArchiveFilters>(() => ({
    ...defaultFiltersForProducts,
    searchQuery: initialSearchQuery,
  }));
  const [currentPage, setCurrentPage] = React.useState(() =>
    initialPage !== undefined ? Math.max(1, initialPage) : 1
  );
  // Apply `?page=` once when SearchParamsBridge hydrates (undefined → number).
  // Later router.replace page writes must not re-apply and stomp local paging.
  const [didApplyUrlPage, setDidApplyUrlPage] = React.useState(
    () => initialPage !== undefined
  );
  const [sortOrder, setSortOrder] =
    React.useState<ProductArchiveSortOrder>(
      "relevance"
    );
  const [viewMode, setViewMode] =
    React.useState<ProductArchiveViewMode>("grid");

  if (initialPage !== undefined && !didApplyUrlPage) {
    setDidApplyUrlPage(true);
    setCurrentPage(Math.max(1, initialPage));
  }

  const syncPageToUrl = React.useCallback(
    (page: number) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const existing = params.get("page");
      if (page <= 1) {
        if (existing == null) return;
        params.delete("page");
      } else if (existing === String(page)) {
        return;
      } else {
        params.set("page", String(page));
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  useMountEffect(() => {
    const stored = readStoredProductArchiveViewMode();
    if (stored) setViewMode(stored);
  });

  const onViewModeChange = React.useCallback((mode: ProductArchiveViewMode) => {
    setViewMode(mode);
    storeProductArchiveViewMode(mode);
  }, []);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);
  const [isInitialArchiveLoading, setIsInitialArchiveLoading] = React.useState(
    products.length === 0
  );
  const resultsSectionRef = React.useRef<HTMLDivElement | null>(null);
  const lastTrackedQueryRef = React.useRef("");
  const searchTrackingTimeoutRef = React.useRef<number | null>(null);
  const initialLoadingTimeoutRef = React.useRef<number | null>(null);
  const previousDefaultRangesRef = React.useRef({
    priceRange: defaultFiltersForProducts.priceRange,
    maxPowerRange: defaultFiltersForProducts.maxPowerRange,
    nominalPowerRange: defaultFiltersForProducts.nominalPowerRange,
  });

  const syncRangeWithBounds = React.useCallback(
    (
      currentRange: [number, number],
      previousBounds: [number, number],
      nextBounds: [number, number]
    ): [number, number] => {
      const wasUsingPreviousMin = currentRange[0] === previousBounds[0];
      const wasUsingPreviousMax = currentRange[1] === previousBounds[1];

      let nextMin = wasUsingPreviousMin ? nextBounds[0] : currentRange[0];
      let nextMax = wasUsingPreviousMax ? nextBounds[1] : currentRange[1];

      // Keep user-selected values when possible, but always clamp within the new dataset bounds.
      nextMin = Math.min(Math.max(nextMin, nextBounds[0]), nextBounds[1]);
      nextMax = Math.min(Math.max(nextMax, nextBounds[0]), nextBounds[1]);

      if (nextMin > nextMax) {
        return [nextBounds[0], nextBounds[1]];
      }

      return [nextMin, nextMax];
    },
    []
  );

  React.useEffect(() => {
    const previousBounds = previousDefaultRangesRef.current;
    const nextBounds = {
      priceRange: defaultFiltersForProducts.priceRange,
      maxPowerRange: defaultFiltersForProducts.maxPowerRange,
      nominalPowerRange: defaultFiltersForProducts.nominalPowerRange,
    };

    setFilters((prev) => {
      const nextPriceRange = syncRangeWithBounds(
        prev.priceRange,
        previousBounds.priceRange,
        nextBounds.priceRange
      );
      const nextMaxPowerRange = syncRangeWithBounds(
        prev.maxPowerRange,
        previousBounds.maxPowerRange,
        nextBounds.maxPowerRange
      );
      const nextNominalPowerRange = syncRangeWithBounds(
        prev.nominalPowerRange,
        previousBounds.nominalPowerRange,
        nextBounds.nominalPowerRange
      );

      const hasChanged =
        nextPriceRange[0] !== prev.priceRange[0] ||
        nextPriceRange[1] !== prev.priceRange[1] ||
        nextMaxPowerRange[0] !== prev.maxPowerRange[0] ||
        nextMaxPowerRange[1] !== prev.maxPowerRange[1] ||
        nextNominalPowerRange[0] !== prev.nominalPowerRange[0] ||
        nextNominalPowerRange[1] !== prev.nominalPowerRange[1];

      if (!hasChanged) return prev;

      return {
        ...prev,
        priceRange: nextPriceRange,
        maxPowerRange: nextMaxPowerRange,
        nominalPowerRange: nextNominalPowerRange,
      };
    });

    previousDefaultRangesRef.current = nextBounds;
  }, [defaultFiltersForProducts, syncRangeWithBounds]);

  const filtered = React.useMemo(
    () => filterProducts(products, filters),
    [products, filters]
  );
  const sorted = React.useMemo(
    () => sortProducts(filtered, sortOrder),
    [filtered, sortOrder]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = clampArchivePage(currentPage, totalPages);
  // Keep state in range when results shrink (filters/sort/dataset).
  if (currentPage !== safePage) {
    setCurrentPage(safePage);
  }
  const pageStart = (safePage - 1) * pageSize;
  const paginatedProducts = sorted.slice(pageStart, pageStart + pageSize);
  const shouldShowLoadingGridState = isInitialArchiveLoading && sorted.length === 0;

  const paginatedIdsKey = React.useMemo(
    () => paginatedProducts.map((p) => p.id).join(","),
    [paginatedProducts]
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (sorted.length === 0) return;
    if (paginatedProducts.length === 0) return;

    const listId = slugifyItemListId(title);
    pushGa4EcommerceEvent({
      event: "view_item_list",
      ecommerce: {
        item_list_id: listId,
        item_list_name: title,
        items: paginatedProducts.map((p, i) => buildGa4ItemFromProduct(p, 1, i)),
      },
    });
    // List slice: paginatedIdsKey avoids unstable array identity from `.slice()` each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    sorted.length,
    sortOrder,
    safePage,
    paginatedIdsKey,
  ]);

  useMountEffect(() => {
    if (products.length === 0) {
      initialLoadingTimeoutRef.current = window.setTimeout(() => {
        setIsInitialArchiveLoading(false);
        initialLoadingTimeoutRef.current = null;
      }, 700);
    }

    return () => {
      if (initialLoadingTimeoutRef.current) {
        window.clearTimeout(initialLoadingTimeoutRef.current);
      }
      if (searchTrackingTimeoutRef.current) {
        window.clearTimeout(searchTrackingTimeoutRef.current);
      }
    };
  });

  const handleFiltersChange = React.useCallback(
    (nextFilters: ProductArchiveFilters) => {
      setFilters(nextFilters);
      setCurrentPage(1);
      syncPageToUrl(1);
    },
    [syncPageToUrl]
  );

  const handleSortOrderChange = React.useCallback(
    (nextSortOrder: ProductArchiveSortOrder) => {
      setSortOrder(nextSortOrder);
      setCurrentPage(1);
      syncPageToUrl(1);
    },
    [syncPageToUrl]
  );

  const handleSearchQueryChange = React.useCallback(
    (value: string) => {
      const nextFilters = { ...filters, searchQuery: value };
      setFilters(nextFilters);
      setCurrentPage(1);
      syncPageToUrl(1);

      const query = value.trim();
      if (searchTrackingTimeoutRef.current) {
        window.clearTimeout(searchTrackingTimeoutRef.current);
        searchTrackingTimeoutRef.current = null;
      }
      if (!query) return;

      const resultCount = filterProducts(products, nextFilters).length;
      searchTrackingTimeoutRef.current = window.setTimeout(() => {
        if (lastTrackedQueryRef.current === query) return;
        lastTrackedQueryRef.current = query;
        recordSearchQuery(query);
        trackSearchBiEvent({
          eventType: "search_submitted",
          query,
          resultCount,
          source: "archive-search",
        });
      }, 400);
    },
    [filters, products, syncPageToUrl]
  );

  const handlePageChange = React.useCallback(
    (page: number) => {
      const nextPage = clampArchivePage(page, totalPages);
      setCurrentPage(nextPage);
      syncPageToUrl(nextPage);

      if (typeof window === "undefined") return;
      if (!resultsSectionRef.current) return;

      const stickyHeaderOffset = 96;
      const targetTop =
        resultsSectionRef.current.getBoundingClientRect().top +
        window.scrollY -
        stickyHeaderOffset;

      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    },
    [syncPageToUrl, totalPages]
  );

  const handleBackToTopClick = React.useCallback(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <Root
      className={cn(
        "flex flex-col gap-6",
        hideBanner ? "pt-6 sm:pt-8" : "pt-8 sm:pt-10",
        className,
      )}
    >
      {!hideBanner ? (
        <ContainedLayout>
          <ProductArchiveBanner
            title={title}
            subtitle={subtitle}
            image={bannerImage}
            imageFit={imageFit}
          />
        </ContainedLayout>
      ) : null}

      <ContainedLayout className="flex flex-col gap-6 pb-12">
        {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
        {hideBanner && (title || subtitle) ? (
          <div className="flex flex-col gap-1 text-center sm:text-left">
            {title ? (
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="text-sm text-muted-foreground sm:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <ProductArchiveSidebar
            config={filterConfig}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            allProducts={products}
            className="hidden lg:block"
          />
          <div ref={resultsSectionRef} className="min-w-0 flex-1 flex flex-col gap-6">
            <ProductArchiveToolbar
              sortOrder={sortOrder}
              onSortOrderChange={handleSortOrderChange}
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              onFilterClick={() => setIsMobileFiltersOpen(true)}
              searchQuery={filters.searchQuery}
              onSearchQueryChange={handleSearchQueryChange}
              resultCount={filtered.length}
              totalCount={products.length}
              showRelevanceSort
              className="mb-1"
            />
            <Sheet
              open={isMobileFiltersOpen}
              onOpenChange={setIsMobileFiltersOpen}
            >
              <SheetContent side="left" className="w-[86vw] overflow-y-auto p-4 sm:max-w-md">
                <SheetHeader className="mb-4">
                  <SheetTitle>Filter</SheetTitle>
                </SheetHeader>
                <ProductArchiveSidebar
                  config={filterConfig}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  allProducts={products}
                />
              </SheetContent>
            </Sheet>
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Produkter
            </h2>
            <ProductArchiveGrid
              products={paginatedProducts}
              viewMode={viewMode}
              isLoading={shouldShowLoadingGridState}
              listName={title}
            />
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

      </ContainedLayout>

      {bottomBlocks.length > 0 && (
        <ProductArchiveBottom
          blocks={bottomBlocks}
          imageFit={imageFit}
          className="mt-8 border-t border-border/60"
        />
      )}

      {faqItems.length > 0 && (
        <ProductArchiveFaq
          items={faqItems}
          collectionLabel={faqCollectionLabel ?? title}
        />
      )}

      <Button
        type="button"
        size="icon"
        variant="ctaGlow"
        onClick={handleBackToTopClick}
        aria-label="Til toppen"
        className={cn(
          "fixed right-4 bottom-20 z-50 rounded-full shadow-lg transition-all duration-200 lg:right-9 lg:bottom-16"
        )}
      >
        <ChevronUp className="size-4" />
      </Button>
    </Root>
  );
}
