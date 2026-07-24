"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductAddToCartButton } from "@/components/products/product-add-to-cart-button";
import { ProductChooseVariantButton } from "@/components/products/product-choose-variant-button";
import { ProductMediaImage } from "@/components/products/product-media-image";
import { ProductCardEnergyLabel } from "@/components/products/product-card-energy-label";
import { ProductSaleBadge } from "@/components/products/product-sale-badge";
import { useCart } from "@/components/cart/cart-provider";
import {
  pushSelectItemEvent,
  type SelectItemListContext,
} from "@/lib/analytics/push-select-item-event";
import { formatCardPrice } from "@/lib/products/format-card-price";
import { isVariableProduct } from "@/lib/products/is-variable-product";
import { buildProductHref } from "@/lib/products/paths";
import {
  getAddToCartLabelNb,
  isProductOutOfStock,
} from "@/lib/products/stock-status";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types/product";
import { ProductStockStatusBadge } from "@/components/products/product-stock-status-badge";

type ProductCardProps = {
  product: Product;
  className?: string;
  /** When true, grey out the card and show «Kjøpt» instead of add-to-cart. */
  owned?: boolean;
  /** Denser padding/type for tight grids (e.g. Min peis tilbehør). */
  compact?: boolean;
} & SelectItemListContext;

export function ProductCard({
  product,
  className,
  owned = false,
  compact = false,
  listId,
  listName,
  listIndex,
}: ProductCardProps) {
  const { addProduct } = useCart();
  const {
    name,
    image,
    brand,
    energyRatingBadgeUrl,
    price,
    regularPrice,
    onSale,
    saleBadge,
    slug,
  } = product;

  const showEnergyLabel = Boolean(energyRatingBadgeUrl);
  const needsVariation = isVariableProduct(product);
  const isOutOfStock = isProductOutOfStock(product.stockStatus);
  const addToCartLabel = getAddToCartLabelNb(product.stockStatus);
  const href = buildProductHref(slug);
  const listContext = { listId, listName, listIndex };
  const trackSelectItem = () => pushSelectItemEvent(product, listContext);

  return (
    <article
      className={cn(
        "product-card-beam-ring group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white text-neutral-900 shadow-sm transition-all duration-200 ease-out select-none motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md dark:bg-card dark:text-card-foreground",
        owned && "opacity-60",
        className
      )}
      onDragStart={(event) => event.preventDefault()}
    >
      <Link
        href={href}
        className="flex min-h-0 flex-1 flex-col rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={name}
        draggable={false}
        onDragStart={(event) => event.preventDefault()}
        onClick={trackSelectItem}
      >
        <div className="relative aspect-square shrink-0 bg-white dark:bg-white">
          {image?.sourceUrl ? (
            <ProductMediaImage
              src={image.sourceUrl}
              alt={image.altText ?? name}
              sizes={
                compact
                  ? "180px"
                  : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              }
              fit={compact ? "contain" : "cover"}
              className={cn(compact && "p-2", owned && "grayscale")}
              draggable={false}
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 z-10">
            {owned ? (
              <span
                className={cn(
                  "absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-background/90 font-medium text-foreground shadow-xs",
                  compact ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs"
                )}
              >
                <Check className="size-3" aria-hidden />
                Kjøpt
              </span>
            ) : onSale && saleBadge ? (
              <ProductSaleBadge
                label={saleBadge}
                className="pointer-events-auto absolute left-2 top-2 px-2 py-1 text-xs"
              />
            ) : null}
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            compact ? "gap-1 p-3" : "gap-2 p-3 sm:gap-1 sm:p-4"
          )}
        >
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="min-h-4 min-w-0 flex-1 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-muted-foreground">
                {brand ?? ""}
              </p>
              {showEnergyLabel ? (
                <ProductCardEnergyLabel
                  energyRatingBadgeUrl={energyRatingBadgeUrl}
                />
              ) : null}
            </div>
            <h3
              className={cn(
                "line-clamp-2 font-medium leading-tight",
                showEnergyLabel && "mt-0.5",
                compact
                  ? "min-h-[2.25rem] text-sm"
                  : "min-h-[2.5rem] text-sm sm:min-h-[2.75rem] sm:text-base"
              )}
            >
              {name}
            </h3>
          </div>

          <div
            className={cn(
              "flex min-h-7 flex-col gap-1",
              compact ? "mt-1.5 mb-2" : "mb-2 sm:mb-3"
            )}
          >
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span
                className={cn(
                  "whitespace-nowrap font-semibold",
                  compact ? "text-base" : "text-sm sm:text-lg"
                )}
              >
                {formatCardPrice(price)}
              </span>
              {regularPrice && onSale && (
                <span className="whitespace-nowrap text-xs text-neutral-500 line-through sm:text-sm dark:text-muted-foreground">
                  {formatCardPrice(regularPrice)}
                </span>
              )}
            </div>
            <ProductStockStatusBadge stockStatus={product.stockStatus} />
          </div>
        </div>
      </Link>
      <div className={cn(compact ? "p-3 pt-0" : "p-3 pt-0 sm:p-4 sm:pt-0")}>
        {owned ? (
          <Button
            type="button"
            variant="secondary"
            size={compact ? "sm" : "default"}
            className={cn(
              "w-full",
              !compact &&
                "h-8 gap-1 px-2 text-xs sm:h-9 sm:gap-1.5 sm:px-2.5 sm:text-sm"
            )}
            disabled
          >
            Kjøpt
          </Button>
        ) : needsVariation ? (
          <ProductChooseVariantButton
            href={href}
            onNavigate={trackSelectItem}
            size={compact ? "sm" : "default"}
            className={cn(
              "w-full",
              !compact &&
                "h-8 gap-1 px-2 text-xs [&_svg]:!size-3.5 sm:h-9 sm:gap-1.5 sm:px-2.5 sm:text-sm sm:[&_svg]:!size-4"
            )}
          />
        ) : (
          <ProductAddToCartButton
            size={compact ? "sm" : "default"}
            className={cn(
              "w-full",
              !compact &&
                "h-8 gap-1 px-2 text-xs [&_svg]:!size-3.5 sm:h-9 sm:gap-1.5 sm:px-2.5 sm:text-sm sm:[&_svg]:!size-4"
            )}
            disabled={isOutOfStock}
            label={addToCartLabel}
            onAdd={() => {
              if (isOutOfStock) return;
              addProduct(product);
            }}
          />
        )}
      </div>
    </article>
  );
}
