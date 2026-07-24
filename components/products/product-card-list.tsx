"use client";

import Link from "next/link";
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
import { stripHtmlToText } from "@/lib/products/description-cards";
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

type ProductCardListProps = {
  product: Product;
  className?: string;
} & SelectItemListContext;

function formatPowerKw(kw: number) {
  return `${new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: 1,
  }).format(kw)} kW`;
}

function buildListHighlights(product: Product): string[] {
  const highlights: string[] = [];
  if (product.fireplaceType?.trim()) {
    highlights.push(product.fireplaceType.trim());
  }
  if (product.nominalPower != null) {
    highlights.push(formatPowerKw(product.nominalPower));
  } else if (product.maxPower != null) {
    highlights.push(`Inntil ${formatPowerKw(product.maxPower)}`);
  }
  if (product.color?.trim()) {
    highlights.push(product.color.trim());
  }
  return highlights.slice(0, 4);
}

export function ProductCardList({
  product,
  className,
  listId,
  listName,
  listIndex,
}: ProductCardListProps) {
  const { addProduct } = useCart();
  const needsVariation = isVariableProduct(product);
  const isOutOfStock = isProductOutOfStock(product.stockStatus);
  const addToCartLabel = getAddToCartLabelNb(product.stockStatus);
  const {
    name,
    image,
    brand,
    energyRatingBadgeUrl,
    price,
    regularPrice,
    onSale,
    saleBadge,
    shortDescription,
    slug,
  } = product;

  const showEnergyLabel = Boolean(energyRatingBadgeUrl);
  const highlights = buildListHighlights(product);
  const href = buildProductHref(slug);
  const plainShortDescription = shortDescription
    ? stripHtmlToText(shortDescription)
    : "";
  const trackSelectItem = () =>
    pushSelectItemEvent(product, { listId, listName, listIndex });

  return (
    <article
      className={cn(
        "group flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-white p-3 text-neutral-900 shadow-sm transition-all duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md sm:flex-row sm:items-stretch sm:gap-5 sm:p-4 dark:bg-card dark:text-card-foreground",
        className
      )}
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-lg bg-white dark:bg-white sm:w-44 md:w-52 lg:w-60">
        <Link
          href={href}
          className="absolute inset-0 z-0 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={name}
          onClick={trackSelectItem}
        >
          {image?.sourceUrl ? (
            <ProductMediaImage
              src={image.sourceUrl}
              alt={image.altText ?? name}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 176px, (max-width: 1024px) 208px, 240px"
            />
          ) : null}
        </Link>
        <div className="pointer-events-none absolute inset-0 z-10">
          {onSale && saleBadge ? (
            <ProductSaleBadge
              label={saleBadge}
              className="pointer-events-auto absolute left-2 top-2 max-w-[calc(100%-1rem)] px-2.5 py-1 text-xs"
            />
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:py-0.5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <Link
            href={href}
            className="min-w-0 flex-1 space-y-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={trackSelectItem}
          >
            {brand ? (
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-muted-foreground">
                {brand}
              </p>
            ) : null}
            <h3 className="text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {name}
            </h3>
          </Link>
          {showEnergyLabel ? (
            <ProductCardEnergyLabel energyRatingBadgeUrl={energyRatingBadgeUrl} />
          ) : null}
        </div>

        {plainShortDescription ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-muted-foreground">
            {plainShortDescription}
          </p>
        ) : null}

        {highlights.length > 0 ? (
          <p className="text-sm text-neutral-700 dark:text-muted-foreground">
            {highlights.join(" · ")}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-3 pt-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <Link
            href={href}
            className="flex flex-col gap-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={trackSelectItem}
          >
            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-xl font-semibold tracking-tight">
                {formatCardPrice(price)}
              </span>
              {regularPrice && onSale ? (
                <span className="text-sm text-neutral-500 line-through dark:text-muted-foreground">
                  {formatCardPrice(regularPrice)}
                </span>
              ) : null}
            </span>
            <ProductStockStatusBadge stockStatus={product.stockStatus} />
          </Link>

          {needsVariation ? (
            <ProductChooseVariantButton
              href={href}
              onNavigate={trackSelectItem}
              className="w-full shrink-0 sm:w-auto"
            />
          ) : (
            <ProductAddToCartButton
              className="w-full shrink-0 sm:w-auto"
              disabled={isOutOfStock}
              label={addToCartLabel}
              onAdd={() => {
                if (isOutOfStock) return;
                addProduct(product);
              }}
            />
          )}
        </div>
      </div>
    </article>
  );
}
