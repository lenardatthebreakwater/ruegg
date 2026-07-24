"use client";

import Link from "next/link";

import { ProductMediaImage } from "@/components/products/product-media-image";
import { getReservedelerSectionBrand } from "@/lib/reservedeler/brand-order";
import { buildReservedelerItemHref } from "@/lib/products/paths";
import type { ReservedelerItemCard as ReservedelerItemCardData } from "@/lib/reservedeler/types";
import { cn } from "@/lib/utils";

type ReservedelerItemListRowProps = {
  item: ReservedelerItemCardData;
  className?: string;
};

export function ReservedelerItemListRow({
  item,
  className,
}: ReservedelerItemListRowProps) {
  const href = buildReservedelerItemHref(
    getReservedelerSectionBrand(item),
    item.itemSlug
  );

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-white p-4 text-neutral-900 shadow-sm transition-all duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md sm:flex-row sm:items-center dark:bg-card dark:text-card-foreground",
        className
      )}
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-white dark:bg-white sm:size-28">
        <Link
          href={href}
          className="absolute inset-0 z-0 block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={item.displayTitle}
        >
          {item.imageUrl ? (
            <ProductMediaImage
              src={item.imageUrl}
              alt={item.imageAlt ?? item.displayTitle}
              sizes="112px"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted px-2 text-center text-xs text-muted-foreground">
              Bilde kommer
            </div>
          )}
        </Link>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <Link
          href={href}
          className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <h3 className="font-medium leading-tight">{item.displayTitle}</h3>
        </Link>
      </div>
    </article>
  );
}
