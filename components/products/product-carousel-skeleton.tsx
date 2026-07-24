"use client";

import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";
import { cn } from "@/lib/utils";

const SKELETON_COUNT = 4;

type ProductCarouselSkeletonProps = {
  title?: string;
  /** Second line under title when the carousel shows a description */
  hasDescription?: boolean;
  className?: string;
};

export function ProductCarouselSkeleton({
  title = "Loading…",
  hasDescription = false,
  className,
}: ProductCarouselSkeletonProps) {
  return (
    <section className={cn("w-full", className)} aria-busy="true" aria-label={title}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-8 w-48 max-w-full animate-pulse rounded bg-muted" />
          {hasDescription && (
            <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted" />
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <div className="h-10 w-10 animate-pulse rounded bg-muted" />
          <div className="h-10 w-10 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="flex gap-6 overflow-hidden py-6">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <ProductCardSkeleton
            key={i}
            className="w-[280px] shrink-0"
          />
        ))}
      </div>
    </section>
  );
}
