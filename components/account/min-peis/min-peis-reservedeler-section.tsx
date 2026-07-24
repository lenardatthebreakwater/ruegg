"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BestSellingProductsCarousel } from "@/components/products/best-selling-products-carousel";
import { ProductCarouselSkeleton } from "@/components/products/product-carousel-skeleton";
import type { MinPeisSummary } from "@/lib/account/min-peis-types";
import { buildReservedelerItemHref } from "@/lib/products/paths";
import type { ReservedelerItemCard } from "@/lib/reservedeler/types";
import { queryKeys } from "@/lib/tanstack/query-keys";
import type { Product } from "@/lib/types/product";

const MIN_PEIS_RESERVEDELER_STALE_MS = 10 * 60_000;

type MinPeisReservedelerApiPayload = {
  ok?: boolean;
  fireplace?: MinPeisSummary;
  matchedItem?: ReservedelerItemCard | null;
  products?: Product[];
  error?: string;
};

type MinPeisReservedelerSectionProps = {
  peisSlug: string;
  ownedProductSlugs: string[];
};

async function fetchMinPeisReservedeler(
  slug: string
): Promise<{
  matchedItem: ReservedelerItemCard | null;
  products: Product[];
}> {
  const response = await fetch(
    `/api/account/min-peis/${encodeURIComponent(slug)}/reservedeler`
  );
  const data = (await response.json().catch(() => null)) as
    | MinPeisReservedelerApiPayload
    | null;
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error ?? "Kunne ikke hente reservedeler.");
  }
  return {
    matchedItem: data.matchedItem ?? null,
    products: data.products ?? [],
  };
}

export function MinPeisReservedelerSection({
  peisSlug,
  ownedProductSlugs,
}: MinPeisReservedelerSectionProps) {
  const reservedelerQuery = useQuery({
    queryKey: queryKeys.account.minPeisReservedeler(peisSlug),
    queryFn: () => fetchMinPeisReservedeler(peisSlug),
    staleTime: MIN_PEIS_RESERVEDELER_STALE_MS,
  });

  if (reservedelerQuery.isLoading) {
    return (
      <div
        className="rounded-xl bg-muted/30 px-4 py-5 sm:px-5 sm:py-6"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <ProductCarouselSkeleton
          title="Reservedeler til peisen din"
          hasDescription
        />
      </div>
    );
  }

  if (reservedelerQuery.isError || !reservedelerQuery.isSuccess) {
    return null;
  }

  const { products, matchedItem } = reservedelerQuery.data;
  if (products.length === 0) {
    return null;
  }

  const storefrontItemHref = matchedItem
    ? buildReservedelerItemHref(matchedItem.brandSlug, matchedItem.itemSlug)
    : null;

  return (
    <section
      aria-label="Reservedeler til peisen din"
      className="space-y-4 rounded-xl bg-muted/30 px-4 py-5 sm:px-5 sm:py-6"
    >
      <BestSellingProductsCarousel
        products={products}
        title="Reservedeler til peisen din"
        description="Deler som passer denne peisen. Det du allerede har kjøpt er markert."
        ownedProductSlugs={ownedProductSlugs}
        compact
        listId="min-peis-reservedeler"
        listName="Min peis reservedeler"
      />

      {storefrontItemHref ? (
        <p className="text-xs text-muted-foreground">
          <Link
            href={storefrontItemHref}
            className="underline-offset-4 hover:underline"
          >
            Åpne i reservedeler-katalogen
          </Link>
        </p>
      ) : null}
    </section>
  );
}
