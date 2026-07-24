import { ContainedLayout } from "@/components/layout/contained-layout";
import { ProductTrustBanner } from "@/components/product-detail/product-trust-banner";

/**
 * Homepage placement of the shared storefront trust banner (same as PDP).
 * Compact vertical rhythm — not PAGE_SECTION_PY.
 * `mt-10` sits outside the hero band so backdrop/media cannot cover the gap
 * (hero text `pb-*` only shifts copy inside a min-height + items-center box).
 */
export function HomepageTrustBand() {
  return (
    <section aria-label="Kundefordeler" className="mt-5 py-4 md:mt-10 md:py-5">
      <ContainedLayout as="div">
        <ProductTrustBanner className="w-full" />
      </ContainedLayout>
    </section>
  );
}
