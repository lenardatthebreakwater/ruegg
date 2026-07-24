"use client";

import * as React from "react";
import { useRouter, type ReadonlyURLSearchParams } from "next/navigation";

import { ContainedLayout } from "@/components/layout/contained-layout";
import { SearchParamsBridge } from "@/components/navigation/search-params-bridge";
import { ReservedelerItemCard } from "@/components/reservedeler/reservedeler-item-card";
import { ReservedelerItemListRow } from "@/components/reservedeler/reservedeler-item-list-row";
import { ReservedelerToolbar } from "@/components/reservedeler/reservedeler-toolbar";
import {
  getOrderedBrandSlugs,
  getReservedelerBrandLabel,
  getReservedelerSectionBrand,
  groupItemsByBrand,
  parseReservedelerBrandParam,
  type ReservedelerBrandFilter,
} from "@/lib/reservedeler/brand-order";
import { reservedelerItemMatchesQuery } from "@/lib/reservedeler/search-match";
import { buildReservedelerHref } from "@/lib/products/paths";
import type { ReservedelerItemCard as ReservedelerItemCardData } from "@/lib/reservedeler/types";
import type { ProductArchiveViewMode } from "@/lib/types/product-archive";
import {
  readStoredProductArchiveViewMode,
  storeProductArchiveViewMode,
} from "@/lib/product-archive-view-mode";
import { useMountEffect } from "@/lib/hooks/effect-last";
import {
  EDITORIAL_HEADER_BAND_CLASS,
  EditorialPageHeaderInner,
} from "@/components/editorial";
import { cn } from "@/lib/utils";

type ReservedelerCatalogProps = {
  items: ReservedelerItemCardData[];
};

function ReservedelerCatalogHeader() {
  return (
    <header className={EDITORIAL_HEADER_BAND_CLASS}>
      <ContainedLayout>
        <EditorialPageHeaderInner
          title="Reservedeler"
          description="Finn modellen din og se alle kompatible reservedeler."
          descriptionClassName="max-w-3xl"
        />
      </ContainedLayout>
    </header>
  );
}

function sortByDisplayTitle(a: ReservedelerItemCardData, b: ReservedelerItemCardData) {
  return a.displayTitle.localeCompare(b.displayTitle, "nb-NO");
}

export function ReservedelerCatalog({ items }: ReservedelerCatalogProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] =
    React.useState<ProductArchiveViewMode>("grid");

  useMountEffect(() => {
    const stored = readStoredProductArchiveViewMode();
    if (stored) setViewMode(stored);
  });

  const onViewModeChange = React.useCallback((mode: ProductArchiveViewMode) => {
    setViewMode(mode);
    storeProductArchiveViewMode(mode);
  }, []);

  // The page is statically prerendered, so the ?brand= filter is applied
  // client-side after hydration (params arrive via SearchParamsBridge; the
  // prerendered HTML always shows all brands).
  const [urlParams, setUrlParams] =
    React.useState<ReadonlyURLSearchParams | null>(null);
  const urlBrand = parseReservedelerBrandParam(urlParams?.get("brand"));

  const onBrandFilterChange = React.useCallback(
    (value: ReservedelerBrandFilter) => {
      if (value === "all") {
        router.replace(buildReservedelerHref());
      } else {
        router.replace(buildReservedelerHref(value));
      }
    },
    [router]
  );

  const brandFiltered = React.useMemo(() => {
    if (urlBrand === "all") return items;
    return items.filter(
      (item) => getReservedelerSectionBrand(item) === urlBrand
    );
  }, [items, urlBrand]);

  const displayed = React.useMemo(() => {
    if (!searchQuery.trim()) return brandFiltered;
    return brandFiltered.filter((item) =>
      reservedelerItemMatchesQuery(item, searchQuery)
    );
  }, [brandFiltered, searchQuery]);

  const totalCount = items.length;
  const resultCount = displayed.length;

  const allBrandsGridSections = React.useMemo(() => {
    const groupedByBrand = groupItemsByBrand(displayed);
    const orderedBrandSlugs = getOrderedBrandSlugs(groupedByBrand);
    return orderedBrandSlugs.map((brandSlug) => {
      const brandItems = groupedByBrand.get(brandSlug) ?? [];
      if (brandItems.length === 0) return null;
      const sortedBrandItems = [...brandItems].sort(sortByDisplayTitle);
      return (
        <section
          key={brandSlug}
          id={brandSlug}
          className="space-y-4 scroll-mt-24"
        >
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {getReservedelerBrandLabel(brandSlug)}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {sortedBrandItems.map((item) => (
              <ReservedelerItemCard
                key={`${getReservedelerSectionBrand(item)}-${item.itemSlug}`}
                item={item}
              />
            ))}
          </div>
        </section>
      );
    });
  }, [displayed]);

  if (items.length === 0) {
    return (
      <>
        <ReservedelerCatalogHeader />
        <ContainedLayout className="py-10 sm:py-12">
          <p className="text-muted-foreground">
            Vi legger til reservedeler fortløpende. Ta kontakt dersom du ikke
            finner modellen din ennå.
          </p>
        </ContainedLayout>
      </>
    );
  }

  return (
    <>
      <ReservedelerCatalogHeader />
      <ContainedLayout className="py-10 sm:py-12">
        <React.Suspense fallback={null}>
          <SearchParamsBridge onParams={setUrlParams} />
        </React.Suspense>

        <ReservedelerToolbar
          className="mt-8"
          brandFilter={urlBrand}
          onBrandFilterChange={onBrandFilterChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          resultCount={resultCount}
          totalCount={totalCount}
        />

        {resultCount === 0 ? (
          <div
            className={cn(
              "mt-8 flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground"
            )}
            role="status"
            aria-live="polite"
          >
            Ingen reservedeler passer med valgte filtre.
          </div>
        ) : viewMode === "list" ? (
          <ul className="mt-8 flex flex-col gap-3" role="list">
            {[...displayed].sort(sortByDisplayTitle).map((item) => (
              <li
                key={`${getReservedelerSectionBrand(item)}-${item.itemSlug}`}
              >
                <ReservedelerItemListRow item={item} />
              </li>
            ))}
          </ul>
        ) : urlBrand === "all" ? (
          <div className="mt-8 space-y-10">{allBrandsGridSections}</div>
        ) : (
          <div className="mt-8 space-y-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {getReservedelerBrandLabel(urlBrand)}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {[...displayed].sort(sortByDisplayTitle).map((item) => (
                <ReservedelerItemCard
                  key={`${getReservedelerSectionBrand(item)}-${item.itemSlug}`}
                  item={item}
                />
              ))}
            </div>
          </div>
        )}
      </ContainedLayout>
    </>
  );
}
