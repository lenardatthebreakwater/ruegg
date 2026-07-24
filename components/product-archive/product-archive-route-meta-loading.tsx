"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ProductArchivePageLoading } from "@/components/product-archive/product-archive-page-loading";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { buildProductsPageMeta } from "@/lib/products/page-meta";

function segmentToSlug(param: string | string[] | undefined): string {
  if (param == null) return "";
  const raw = Array.isArray(param) ? param[0] : param;
  if (!raw) return "";
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

export type ProductArchiveRouteMetaLoadingVariant =
  | "category"
  | "category-merke"
  | "brand";

type ProductArchiveRouteMetaLoadingProps = {
  variant: ProductArchiveRouteMetaLoadingVariant;
};

/**
 * Route loading UI that mirrors the server’s base {@link buildProductsPageMeta} for the
 * current path and query (before WordPress hero merge).
 */
export function ProductArchiveRouteMetaLoading({
  variant,
}: ProductArchiveRouteMetaLoadingProps) {
  const params = useParams();
  const searchParams = useSearchParams();

  const onSale = searchParams.get("onSale") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const brandFromQuery = searchParams.get("brand") ?? undefined;

  const categoryParam = params["category"];
  const brandParam = params["brand"];

  let title = "";
  let subtitle: string | undefined;
  let breadcrumbs: BreadcrumbItem[] = [];
  let heroPlaceholder = true;

  if (variant === "category") {
    const categorySlug = segmentToSlug(
      categoryParam as string | string[] | undefined
    );
    if (categorySlug) {
      const meta = buildProductsPageMeta({
        category: categorySlug,
        brand: brandFromQuery,
        onSale,
        q,
      });
      title = meta.title;
      subtitle = meta.subtitle;
      breadcrumbs = meta.breadcrumbs;
      heroPlaceholder = false;
    }
  } else if (variant === "category-merke") {
    const categorySlug = segmentToSlug(
      categoryParam as string | string[] | undefined
    );
    const brandSlug = segmentToSlug(
      brandParam as string | string[] | undefined
    );
    if (categorySlug && brandSlug) {
      const meta = buildProductsPageMeta({
        category: categorySlug,
        brand: brandSlug,
        onSale,
        q,
      });
      title = meta.title;
      subtitle = meta.subtitle;
      breadcrumbs = meta.breadcrumbs;
      heroPlaceholder = false;
    }
  } else {
    const brandSlug = segmentToSlug(
      brandParam as string | string[] | undefined
    );
    if (brandSlug) {
      const meta = buildProductsPageMeta({
        brand: brandSlug,
        onSale,
        q,
      });
      title = meta.title;
      subtitle = meta.subtitle;
      breadcrumbs = meta.breadcrumbs;
      heroPlaceholder = false;
    }
  }

  return (
    <ProductArchivePageLoading
      title={title}
      subtitle={subtitle}
      breadcrumbs={breadcrumbs}
      heroPlaceholder={heroPlaceholder}
    />
  );
}
