"use client";

import { useQuery } from "@tanstack/react-query";
import { MinPeisEmptyState } from "@/components/account/min-peis/min-peis-empty-state";
import { MinPeisFireplaceCard } from "@/components/account/min-peis/min-peis-fireplace-card";
import {
  EditorialEyebrow,
  EditorialHeading,
} from "@/components/editorial";
import type { MinPeisListPayload } from "@/lib/account/min-peis-types";
import { queryKeys } from "@/lib/tanstack/query-keys";

const MIN_PEIS_STALE_MS = 5 * 60_000;

async function fetchMinPeisList(): Promise<MinPeisListPayload> {
  const response = await fetch("/api/account/min-peis");
  const data = (await response.json().catch(() => null)) as {
    ok?: boolean;
    fireplaces?: MinPeisListPayload["fireplaces"];
    ownedProductSlugs?: string[];
    error?: string;
  } | null;
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error ?? "Kunne ikke hente Min peis.");
  }
  return {
    fireplaces: data.fireplaces ?? [],
    ownedProductSlugs: data.ownedProductSlugs ?? [],
  };
}

function MinPeisListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Laster Min peis...</span>
      {[0, 1].map((index) => (
        <div
          key={index}
          className="flex gap-4 rounded-xl border border-border/70 p-4"
        >
          <div className="size-24 animate-pulse rounded-lg bg-muted sm:size-28" />
          <div className="flex flex-1 flex-col justify-center gap-2">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MinPeisList() {
  const listQuery = useQuery({
    queryKey: queryKeys.account.minPeis(),
    queryFn: fetchMinPeisList,
    staleTime: MIN_PEIS_STALE_MS,
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="space-y-2">
        <EditorialEyebrow>Din peis</EditorialEyebrow>
        <EditorialHeading size="account">Min peis</EditorialHeading>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
          Peiser og ovner fra fullførte bestillinger — med tilbehør og dokumenter
          samlet på ett sted.
        </p>
      </div>

      {listQuery.isLoading ? <MinPeisListSkeleton /> : null}

      {listQuery.isError ? (
        <p className="text-sm text-red-700" role="alert">
          {listQuery.error instanceof Error
            ? listQuery.error.message
            : "Kunne ikke hente Min peis."}
        </p>
      ) : null}

      {listQuery.isSuccess && listQuery.data.fireplaces.length === 0 ? (
        <MinPeisEmptyState />
      ) : null}

      {listQuery.isSuccess && listQuery.data.fireplaces.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {listQuery.data.fireplaces.map((fireplace) => (
            <li key={fireplace.slug}>
              <MinPeisFireplaceCard fireplace={fireplace} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
