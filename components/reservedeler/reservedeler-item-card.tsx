"use client";

import Link from "next/link";
import { ProductMediaImage } from "@/components/products/product-media-image";
import { getReservedelerSectionBrand } from "@/lib/reservedeler/brand-order";
import { buildReservedelerItemHref } from "@/lib/products/paths";
import type { ReservedelerItemCard as ReservedelerItemCardData } from "@/lib/reservedeler/types";
import { cn } from "@/lib/utils";

type ReservedelerItemCardProps = {
  item: ReservedelerItemCardData;
  className?: string;
};

export function ReservedelerItemCard({
  item,
  className,
}: ReservedelerItemCardProps) {
  const routeBrand = getReservedelerSectionBrand(item);

  return (
    <article
      className={cn(
        "product-card-beam-ring group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white text-neutral-900 shadow-sm transition-all duration-200 ease-out select-none motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md dark:bg-card dark:text-card-foreground",
        className
      )}
    >
      <Link
        href={buildReservedelerItemHref(routeBrand, item.itemSlug)}
        className="flex h-full flex-col rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={item.displayTitle}
      >
        <div className="relative aspect-square bg-white dark:bg-white">
          {item.imageUrl ? (
            <ProductMediaImage
              src={item.imageUrl}
              alt={item.imageAlt ?? item.displayTitle}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground">
              Bilde kommer
            </div>
          )}
        </div>
        <div className="flex min-h-[4.5rem] items-center p-4">
          <h3 className="line-clamp-2 font-medium leading-tight">
            {item.displayTitle}
          </h3>
        </div>
      </Link>
    </article>
  );
}
