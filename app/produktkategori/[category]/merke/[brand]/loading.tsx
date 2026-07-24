import { Suspense } from "react";
import { ProductArchivePageLoading } from "@/components/product-archive/product-archive-page-loading";
import { ProductArchiveRouteMetaLoading } from "@/components/product-archive/product-archive-route-meta-loading";

export default function Loading() {
  return (
    <Suspense
      fallback={<ProductArchivePageLoading heroPlaceholder />}
    >
      <ProductArchiveRouteMetaLoading variant="category-merke" />
    </Suspense>
  );
}
