"use client";

import { SingleProductContent } from "./single-product-content";
import { ProductDetailSkeleton } from "./product-detail-skeleton";
import type { Product } from "@/lib/types/product";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { buildProductsArchiveHref } from "@/lib/products/paths";
import {
  useArchiveProductsQuery,
  useProductDetailQuery,
} from "@/lib/tanstack/product-queries";
import { ProductViewItemTracker } from "@/components/analytics/product-view-item-tracker";

type ProductDetailLoaderProps = {
  slug: string;
  initialProduct?: Product | null;
  breadcrumbs?: BreadcrumbItem[];
};

export function ProductDetailLoader({
  slug,
  initialProduct,
  breadcrumbs: breadcrumbsProp,
}: ProductDetailLoaderProps) {
  const productDetailQuery = useProductDetailQuery({
    slug,
    initialData: initialProduct,
    enabled: !initialProduct,
  });
  const resolvedProduct = productDetailQuery.data ?? null;

  // The full-catalog fetch is a last-resort fallback for "Lignende produkter".
  // Almost every product has crossSell/related products from Woo, so keep the
  // (very expensive, ~2,700-product) archive query disabled unless needed.
  const needsSimilarFallback =
    resolvedProduct != null &&
    !resolvedProduct.crossSellProducts?.length &&
    !resolvedProduct.relatedProducts?.length;
  const archiveProductsQuery = useArchiveProductsQuery({
    onSaleOnly: false,
    enabled: needsSimilarFallback,
  });

  const similarProducts =
    resolvedProduct?.crossSellProducts ??
    resolvedProduct?.relatedProducts ??
    (archiveProductsQuery.data ?? []).filter((p) => p.slug !== slug).slice(0, 6);

  if (!resolvedProduct) {
    return <ProductDetailSkeleton />;
  }

  const breadcrumbs =
    breadcrumbsProp && breadcrumbsProp.length > 0
      ? breadcrumbsProp
      : [
          { href: "/", label: "Hjem" },
          { href: buildProductsArchiveHref(), label: "Produkter" },
          { label: resolvedProduct.name },
        ];

  return (
    <>
      <ProductViewItemTracker product={resolvedProduct} />
      <SingleProductContent
        product={resolvedProduct}
        breadcrumbs={breadcrumbs}
        similarProducts={similarProducts}
      />
    </>
  );
}
