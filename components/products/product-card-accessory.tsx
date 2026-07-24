"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductAddToCartButton } from "@/components/products/product-add-to-cart-button";
import { ProductChooseVariantButton } from "@/components/products/product-choose-variant-button";
import { ProductMediaImage } from "@/components/products/product-media-image";
import { useCart } from "@/components/cart/cart-provider";
import { ProductCardEnergyLabel } from "@/components/products/product-card-energy-label";
import { ProductSaleBadge } from "@/components/products/product-sale-badge";
import { ProductStockStatusBadge } from "@/components/products/product-stock-status-badge";
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

type ProductCardAccessoryProps = {
  product: Product;
  className?: string;
} & SelectItemListContext;

export function ProductCardAccessory({
  product,
  className,
  listId,
  listName,
  listIndex,
}: ProductCardAccessoryProps) {
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
    description,
    slug,
  } = product;

  const showEnergyLabel = Boolean(energyRatingBadgeUrl);

  const popupDescription = shortDescription || description || "Ingen beskrivelse tilgjengelig.";
  const productHref = buildProductHref(slug);
  const trackSelectItem = () =>
    pushSelectItemEvent(product, { listId, listName, listIndex });

  return (
    <Dialog>
      <article
        className={cn(
          "product-card-beam-ring group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white text-neutral-900 shadow-sm transition-all duration-200 ease-out select-none motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md dark:bg-card dark:text-card-foreground",
          className
        )}
        onDragStart={(event) => event.preventDefault()}
      >
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex w-full min-h-0 flex-1 flex-col text-left transition-colors hover:bg-neutral-50 dark:hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
          >
            <div className="relative aspect-square shrink-0 bg-white dark:bg-white">
              {image?.sourceUrl ? (
                <ProductMediaImage
                  src={image.sourceUrl}
                  alt={image.altText ?? name}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                  draggable={false}
                />
              ) : null}
              {onSale && saleBadge && (
                <ProductSaleBadge
                  label={saleBadge}
                  className="absolute left-2 top-2 px-2 py-1 text-xs"
                />
              )}
              {showEnergyLabel && (
                <div className="pointer-events-auto absolute bottom-2 right-2">
                  <ProductCardEnergyLabel energyRatingBadgeUrl={energyRatingBadgeUrl} />
                </div>
              )}
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-1 p-4">
              <p className="min-h-4 shrink-0 truncate text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-muted-foreground">
                {brand ?? ""}
              </p>
              <h3 className="line-clamp-2 min-h-[2.75rem] font-medium leading-tight">
                {name}
              </h3>
              <div className="mb-3 mt-2 flex min-h-7 flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold">{formatCardPrice(price)}</span>
                  {regularPrice && onSale ? (
                    <span className="text-sm text-neutral-500 line-through dark:text-muted-foreground">
                      {formatCardPrice(regularPrice)}
                    </span>
                  ) : null}
                </div>
                <ProductStockStatusBadge stockStatus={product.stockStatus} />
              </div>
            </div>
          </button>
        </DialogTrigger>

        <div className="p-4 pt-0">
          {needsVariation ? (
            <ProductChooseVariantButton
              href={productHref}
              onNavigate={trackSelectItem}
              className="w-full"
            />
          ) : (
            <ProductAddToCartButton
              className="w-full"
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          {brand ? <DialogDescription>{brand}</DialogDescription> : null}
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-md bg-white dark:bg-white">
            {image?.sourceUrl ? (
              <ProductMediaImage
                src={image.sourceUrl}
                alt={image.altText ?? name}
                sizes="160px"
                draggable={false}
              />
            ) : null}
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">{formatCardPrice(price)}</span>
              {regularPrice && onSale ? (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCardPrice(regularPrice)}
                </span>
              ) : null}
            </div>
            <div
              className="prose prose-neutral dark:prose-invert max-w-none text-sm prose-p:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: popupDescription }}
            />
          </div>
        </div>
        <DialogFooter>
          {needsVariation ? (
            <ProductChooseVariantButton
              href={productHref}
              onNavigate={trackSelectItem}
            />
          ) : (
            <ProductAddToCartButton
              disabled={isOutOfStock}
              label={addToCartLabel}
              onAdd={() => {
                if (isOutOfStock) return;
                addProduct(product);
              }}
            />
          )}
          <Button asChild variant="outline">
            <Link href={productHref} onClick={trackSelectItem}>
              Se produkt
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
