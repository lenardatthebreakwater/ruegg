"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useMountEffect } from "@/lib/hooks/effect-last";
import { useValueChangeEffect } from "@/lib/hooks/effect-last";
import { fetchArchiveProducts, fetchSearchProducts } from "@/lib/tanstack/product-queries";
import { queryKeys } from "@/lib/tanstack/query-keys";

type ProductPrefetchProviderProps = {
  children: ReactNode;
};

function shouldReduceDataUsage(): boolean {
  if (typeof navigator === "undefined") return false;

  const connection = (
    navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
      };
    }
  ).connection;
  if (!connection) return false;

  const effectiveType = connection.effectiveType?.toLocaleLowerCase("nb-NO") ?? "";
  return connection.saveData === true || effectiveType === "slow-2g" || effectiveType === "2g";
}

export function ProductPrefetchProvider({ children }: ProductPrefetchProviderProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();

  // Skip `/` — homepage already defers product carousels; archive prefetch
  // (first: 100) was a major main-thread + network hit on first paint.
  const shouldPrefetchArchive =
    pathname === "/shop" || pathname === "/shop/";

  const prefetchArchiveProducts = (onSaleOnly: boolean) =>
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.archive({
        first: 100,
        after: null,
        onSaleOnly,
        categorySlug: null,
        brandSlug: null,
        reservedelerItemSlug: null,
      }),
      queryFn: () =>
        fetchArchiveProducts({
          onSaleOnly,
          categorySlug: null,
          brandSlug: null,
          reservedelerItemSlug: null,
        }),
    });

  const prefetchSearchIndex = () =>
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.searchIndex(),
      queryFn: fetchSearchProducts,
      staleTime: 30 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });

  const isHomepage = pathname === "/" || pathname === "";

  const queuePrefetch = () => {
    if (shouldReduceDataUsage()) {
      return () => {};
    }

    let timeoutId: number | null = null;
    const requestIdle = window.requestIdleCallback;
    const cancelIdle = window.cancelIdleCallback;
    let idleId: number | null = null;
    let searchTimeoutId: number | null = null;

    const runArchive = () => {
      if (shouldPrefetchArchive) {
        void prefetchArchiveProducts(false);
      }
    };

    // Homepage: delay search-index prefetch so it is not on the critical path.
    // Other routes: keep quick search warm early.
    if (isHomepage) {
      searchTimeoutId = window.setTimeout(() => {
        void prefetchSearchIndex();
      }, 5000);
    } else {
      void prefetchSearchIndex();
    }

    if (typeof requestIdle === "function" && typeof cancelIdle === "function") {
      idleId = requestIdle(() => runArchive(), { timeout: 1500 });
      return () => {
        if (idleId != null) {
          cancelIdle(idleId);
        }
        if (searchTimeoutId != null) {
          window.clearTimeout(searchTimeoutId);
        }
      };
    }

    timeoutId = window.setTimeout(runArchive, 800);
    return () => {
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
      }
      if (searchTimeoutId != null) {
        window.clearTimeout(searchTimeoutId);
      }
    };
  };

  useMountEffect(() => {
    const cleanupPrefetch = queuePrefetch();

    const onSaleTimeout = window.setTimeout(() => {
      if (shouldPrefetchArchive) {
        void prefetchArchiveProducts(true);
      }
    }, 2500);

    return () => {
      cleanupPrefetch();
      window.clearTimeout(onSaleTimeout);
    };
  });

  useValueChangeEffect(pathname, () => {
    const cleanupPrefetch = queuePrefetch();

    const onSaleTimeout = window.setTimeout(() => {
      if (shouldPrefetchArchive) {
        void prefetchArchiveProducts(true);
      }
    }, 2500);

    return () => {
      cleanupPrefetch();
      window.clearTimeout(onSaleTimeout);
    };
  });

  return children;
}
