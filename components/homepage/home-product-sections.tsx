"use client";

import { useProductStore } from "@/stores/product-store-clean";
import { BestSellingSection } from "@/components/homepage/best-selling-section";
import { MostPopularSection } from "@/components/homepage/most-popular-section";
import { useMountEffect } from "@/lib/hooks/effect-last";

export function HomeProductSections() {
  const {
    bestSelling,
    bestSellingFetched,
    fetchBestSelling,
    popularFireplaces,
    popularFireplacesFetched,
    fetchPopularFireplaces,
  } = useProductStore();

  useMountEffect(() => {
    if (!bestSellingFetched) fetchBestSelling(8);
    if (!popularFireplacesFetched) fetchPopularFireplaces(8);
  });

  return (
    <>
      <BestSellingSection
        products={bestSelling}
        title="Se våre bestselgende produkter"
        description=""
        align="center"
        loading={!bestSellingFetched}
      />
      <MostPopularSection
        products={popularFireplaces}
        title="Mest populære peissøk hittil i 2025"
        description=""
        align="center"
        loading={!popularFireplacesFetched}
      />
    </>
  );
}
