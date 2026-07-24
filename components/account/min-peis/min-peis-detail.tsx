"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { MinPeisDetailHeader } from "@/components/account/min-peis/min-peis-detail-header";
import { MinPeisMonteringHelp } from "@/components/account/min-peis/min-peis-montering-help";
import { MinPeisReservedelerSection } from "@/components/account/min-peis/min-peis-reservedeler-section";
import { MinPeisSoftCtas } from "@/components/account/min-peis/min-peis-soft-ctas";
import { MinPeisTechDocs } from "@/components/account/min-peis/min-peis-tech-docs";
import { BestSellingProductsCarousel } from "@/components/products/best-selling-products-carousel";
import { Button } from "@/components/ui/button";
import type { MinPeisDetailPayload } from "@/lib/account/min-peis-types";
import { queryKeys } from "@/lib/tanstack/query-keys";

const MIN_PEIS_PRODUCT_STALE_MS = 10 * 60_000;

type MinPeisDetailViewProps = {
  slug: string;
};

async function fetchMinPeisDetail(slug: string): Promise<MinPeisDetailPayload> {
  const response = await fetch(
    `/api/account/min-peis/${encodeURIComponent(slug)}`
  );
  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    fireplace?: MinPeisDetailPayload["fireplace"];
    ownedProductSlugs?: string[];
    error?: string;
  } | null;
  if (!response.ok || !data?.ok || !data.fireplace) {
    throw new Error(data?.error ?? "Kunne ikke hente peisen.");
  }
  return {
    fireplace: data.fireplace,
    ownedProductSlugs: data.ownedProductSlugs ?? [],
  };
}

function MinPeisDetailSkeleton() {
  return (
    <div
      className="grid gap-6 lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)] lg:gap-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Laster peis...</span>
      <div className="aspect-[4/5] animate-pulse rounded-xl bg-muted sm:aspect-[3/4] lg:aspect-auto lg:min-h-[28rem]" />
      <div className="flex flex-col justify-center space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function MinPeisDetailView({ slug }: MinPeisDetailViewProps) {
  const detailQuery = useQuery({
    queryKey: queryKeys.account.minPeisProduct(slug),
    queryFn: () => fetchMinPeisDetail(slug),
    staleTime: MIN_PEIS_PRODUCT_STALE_MS,
  });

  const ownedProductSlugs = detailQuery.data?.ownedProductSlugs ?? [];

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/min-konto/min-peis/">
            <ArrowLeft data-icon="inline-start" />
            Alle peiser
          </Link>
        </Button>
      </div>

      {detailQuery.isLoading ? <MinPeisDetailSkeleton /> : null}

      {detailQuery.isError ? (
        <div className="space-y-3">
          <p className="text-sm text-red-700" role="alert">
            {detailQuery.error instanceof Error
              ? detailQuery.error.message
              : "Kunne ikke hente peisen."}
          </p>
          <Button asChild variant="outline">
            <Link href="/min-konto/min-peis/">Tilbake til Min peis</Link>
          </Button>
        </div>
      ) : null}

      {detailQuery.isSuccess ? (
        <>
          <MinPeisDetailHeader fireplace={detailQuery.data.fireplace} />

          <MinPeisMonteringHelp
            peisName={detailQuery.data.fireplace.name}
            ownedSinceDate={detailQuery.data.fireplace.ownedSinceDate}
          />

          {detailQuery.data.fireplace.accessories.length > 0 ? (
            <section
              aria-label="Tilbehør til peisen din"
              className="space-y-4 rounded-xl bg-muted/30 px-4 py-5 sm:px-5 sm:py-6"
            >
              <BestSellingProductsCarousel
                products={detailQuery.data.fireplace.accessories}
                title="Tilbehør til peisen din"
                description="Anbefalt tilbehør. Det du allerede har kjøpt er markert."
                ownedProductSlugs={ownedProductSlugs}
                compact
                listId="min-peis-tilbehor"
                listName="Min peis tilbehør"
              />
            </section>
          ) : null}

          <MinPeisReservedelerSection
            peisSlug={detailQuery.data.fireplace.slug}
            ownedProductSlugs={ownedProductSlugs}
          />

          <MinPeisTechDocs fireplace={detailQuery.data.fireplace} />
          <MinPeisSoftCtas />
        </>
      ) : null}
    </div>
  );
}
