"use client";

import { ChevronRight } from "lucide-react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { ProductArchiveBanner } from "@/components/product-archive/product-archive-banner";
import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { cn } from "@/lib/utils";

const SKELETON_COUNT = 12;

type ProductArchiveSkeletonProps = {
  /** Pulsing blocks instead of real hero and breadcrumb text (e.g. Suspense fallback) */
  heroPlaceholder?: boolean;
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  className?: string;
};

export function ProductArchiveSkeleton({
  heroPlaceholder = false,
  title,
  subtitle,
  breadcrumbs,
  className,
}: ProductArchiveSkeletonProps) {
  if (heroPlaceholder) {
    return (
      <main
        className={cn("flex flex-col gap-6 pt-8 sm:pt-10", className)}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Laster produktarkiv"
      >
        <ContainedLayout>
          <div
            className="relative overflow-hidden rounded-xl bg-muted px-6 py-8 sm:px-8 sm:py-10"
            role="status"
            aria-live="polite"
            aria-label="Laster tittel"
          >
            <div className="flex flex-col gap-2 sm:gap-2.5">
              <div className="h-8 w-48 max-w-[80%] animate-pulse rounded bg-background/50 sm:h-9 sm:w-64" />
              <div className="h-4 w-full max-w-xl animate-pulse rounded bg-background/50" />
              <div className="h-4 w-full max-w-lg animate-pulse rounded bg-background/50 sm:hidden" />
            </div>
          </div>
        </ContainedLayout>
        <ContainedLayout className="flex flex-col gap-6 pb-12">
          <div
            className="flex items-center gap-1"
            role="status"
            aria-label="Laster brødsmulesti"
          >
            <div className="h-4 w-10 shrink-0 animate-pulse rounded bg-muted" />
            <ChevronRight
              className="size-4 shrink-0 text-muted-foreground/60"
              aria-hidden
            />
            <div className="h-4 w-28 max-w-[45%] shrink animate-pulse rounded bg-muted" />
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
            <aside className="hidden w-56 shrink-0 space-y-4 lg:block">
              <div className="h-6 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
              <div className="h-6 w-20 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </aside>
            <div className="min-w-0 flex-1 flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <div className="h-9 w-32 animate-pulse rounded bg-muted" />
                <div className="h-9 w-24 animate-pulse rounded bg-muted" />
              </div>
              <ul
                className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
                role="list"
                aria-busy="true"
                aria-label="Laster produkter"
              >
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <li key={i} className="flex">
                    <ProductCardSkeleton className="w-full" />
                  </li>
                ))}
              </ul>
              <div className="flex justify-center gap-1">
                <div className="h-9 w-9 animate-pulse rounded bg-muted" />
                <div className="h-9 w-9 animate-pulse rounded bg-muted" />
                <div className="h-9 w-9 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
        </ContainedLayout>
      </main>
    );
  }

  return (
    <main className={cn("flex flex-col gap-6 pt-8 sm:pt-10", className)}>
      <ContainedLayout>
        <ProductArchiveBanner title={title} subtitle={subtitle} image={null} />
      </ContainedLayout>

      <ContainedLayout className="flex flex-col gap-6 pb-12">
        {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="hidden w-56 shrink-0 space-y-4 lg:block">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
          </aside>
          <div className="min-w-0 flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <div className="h-9 w-32 animate-pulse rounded bg-muted" />
              <div className="h-9 w-24 animate-pulse rounded bg-muted" />
            </div>
            <ul
              className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
              role="list"
              aria-busy="true"
              aria-label="Laster produkter"
            >
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <li key={i} className="flex">
                  <ProductCardSkeleton className="w-full" />
                </li>
              ))}
            </ul>
            <div className="flex justify-center gap-1">
              <div className="h-9 w-9 animate-pulse rounded bg-muted" />
              <div className="h-9 w-9 animate-pulse rounded bg-muted" />
              <div className="h-9 w-9 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </ContainedLayout>
    </main>
  );
}
