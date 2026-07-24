import { SiteHeaderLoading } from "@/components/site/site-header";
import { ProductDetailSkeleton } from "@/components/product-detail/product-detail-skeleton";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";

export function ProductDetailPageLoading() {
  return (
    <StorefrontPageShell header={<SiteHeaderLoading />}>
      <ProductDetailSkeleton />
    </StorefrontPageShell>
  );
}
