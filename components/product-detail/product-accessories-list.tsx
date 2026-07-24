"use client";

import * as React from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductAddToCartButton } from "@/components/products/product-add-to-cart-button";
import { ProductMediaImage } from "@/components/products/product-media-image";
import { ProductCardEnergyLabel } from "@/components/products/product-card-energy-label";
import { ProductSaleBadge } from "@/components/products/product-sale-badge";
import { useCart } from "@/components/cart/cart-provider";
import {
  AccentHeaderCard,
  EDITORIAL_SECONDARY_TEXT_CLASS,
  META_RUBRIC_NESTED_CARD_CLASS,
  MetaRubricLabel,
} from "@/components/editorial";
import { PDP_SOFT_PANEL_CLASS } from "@/components/product-detail/pdp-panel-styles";
import { buildProductHref } from "@/lib/products/paths";
import { formatCardPrice } from "@/lib/products/format-card-price";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types/product";

const VISIBLE_ACCESSORIES = 3;

type ProductAccessoriesListProps = {
  accessories: Product[];
  className?: string;
  spreadItems?: boolean;
};

type AccessoryListCardProps = {
  product: Product;
  onOpenDetails: (product: Product) => void;
};

function AccessoryListCard({ product, onOpenDetails }: AccessoryListCardProps) {
  const { addProduct } = useCart();
  const touchStartYRef = React.useRef(0);
  const suppressClickRef = React.useRef(false);
  const {
    name,
    image,
    brand,
    energyRatingBadgeUrl,
    price,
    regularPrice,
    onSale,
    saleBadge,
  } = product;

  const openDetails = () => {
    if (suppressClickRef.current) return;
    onOpenDetails(product);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails();
        }
      }}
      onTouchStart={(event) => {
        touchStartYRef.current = event.touches[0]?.clientY ?? 0;
        suppressClickRef.current = false;
      }}
      onTouchMove={(event) => {
        const currentY = event.touches[0]?.clientY ?? 0;
        if (Math.abs(currentY - touchStartYRef.current) > 8) {
          suppressClickRef.current = true;
        }
      }}
      onTouchEnd={() => {
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }}
      className={cn(
        META_RUBRIC_NESTED_CARD_CLASS,
        "product-card-beam-ring group relative flex touch-pan-y cursor-pointer flex-col gap-2.5 overflow-hidden p-2.5 text-foreground transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:gap-3 sm:p-3"
      )}
    >
      <div className="flex min-w-0 flex-1 flex-row items-start gap-2.5 sm:items-center sm:gap-3">
        <div className="relative size-16 shrink-0 self-start overflow-hidden rounded-md bg-white dark:bg-white sm:size-24">
          {image?.sourceUrl ? (
            <ProductMediaImage
              src={image.sourceUrl}
              alt={image.altText ?? name}
              sizes="112px"
            />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-start gap-1 sm:justify-center">
          {energyRatingBadgeUrl ? (
            <ProductCardEnergyLabel energyRatingBadgeUrl={energyRatingBadgeUrl} />
          ) : null}
          {brand ? (
            <MetaRubricLabel className="sm:text-[11px]">{brand}</MetaRubricLabel>
          ) : null}
          <h3 className="text-sm font-medium leading-tight text-foreground">{name}</h3>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-2 sm:mt-1">
            <span className="text-sm font-semibold text-foreground sm:text-base">
              {formatCardPrice(price)}
            </span>
            {regularPrice && onSale ? (
              <span className="text-xs text-foreground/55 line-through sm:text-sm">
                {formatCardPrice(regularPrice)}
              </span>
            ) : null}
            {onSale && saleBadge ? (
              <ProductSaleBadge
                label={saleBadge}
                className="shrink-0 px-2 py-0.5 text-xs"
              />
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex w-full shrink-0 items-stretch max-sm:mt-0 sm:ml-auto sm:w-auto sm:items-center">
        <ProductAddToCartButton
          className="w-full sm:w-auto"
          label="Legg i handlekurv"
          onAdd={(event) => {
            event.stopPropagation();
            addProduct(product);
          }}
        />
      </div>
    </article>
  );
}

export function ProductAccessoriesList({
  accessories,
  className,
  spreadItems = false,
}: ProductAccessoriesListProps) {
  const { addProduct } = useCart();
  const [activeAccessory, setActiveAccessory] = React.useState<Product | null>(null);
  const moreDialogTitleRef = React.useRef<HTMLHeadingElement>(null);
  const visibleAccessories = React.useMemo(
    () => accessories.slice(0, VISIBLE_ACCESSORIES),
    [accessories]
  );
  const hasMore = accessories.length > VISIBLE_ACCESSORIES;

  if (accessories.length === 0) return null;

  return (
    <>
      <AccentHeaderCard
        title="Anbefalt tilbehør"
        titleId="pdp-accessories-heading"
        icon={Package}
        titleTooltip="Disse produktene er anbefalt tilbehør og kan kjøpes i tillegg."
        className={cn(
          spreadItems && "lg:flex lg:h-full lg:flex-col",
          className
        )}
        headerAside={
          hasMore ? (
            <span className={cn("text-xs", EDITORIAL_SECONDARY_TEXT_CLASS)}>
              {accessories.length} produkter
            </span>
          ) : null
        }
        contentClassName={cn(
          spreadItems && "lg:flex lg:flex-1 lg:flex-col"
        )}
      >
        <ul
          className={cn(
            "space-y-3",
            spreadItems && "lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:space-y-0"
          )}
        >
          {visibleAccessories.map((accessory) => (
            <li key={accessory.id}>
              <AccessoryListCard product={accessory} onOpenDetails={setActiveAccessory} />
            </li>
          ))}
        </ul>

        {hasMore ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full bg-background dark:bg-card/80"
              >
                Vis flere
              </Button>
            </DialogTrigger>
            <DialogContent
              className="flex max-h-[90vh] w-[calc(100vw-1rem)] max-w-4xl flex-col overflow-hidden p-0"
              onOpenAutoFocus={(event) => {
                // Avoid autofocusing the first product card (tabIndex={0}), which
                // left it stuck looking hovered until something else was clicked.
                event.preventDefault();
                moreDialogTitleRef.current?.focus();
              }}
            >
              <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
                <DialogTitle
                  ref={moreDialogTitleRef}
                  tabIndex={-1}
                  className="outline-none"
                >
                  Anbefalt tilbehør
                </DialogTitle>
                <DialogDescription>
                  Alle produkter som passer sammen med denne modellen.
                </DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                <ul
                  className={cn(
                    PDP_SOFT_PANEL_CLASS,
                    "space-y-3 p-3 sm:p-4"
                  )}
                >
                  {accessories.map((accessory) => (
                    <li key={accessory.id}>
                      <AccessoryListCard product={accessory} onOpenDetails={setActiveAccessory} />
                    </li>
                  ))}
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </AccentHeaderCard>

      <Dialog open={activeAccessory != null} onOpenChange={(open) => !open && setActiveAccessory(null)}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-1rem)] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeAccessory?.name}</DialogTitle>
            {activeAccessory?.brand ? (
              <DialogDescription>{activeAccessory.brand}</DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <div className="relative aspect-square overflow-hidden rounded-md bg-white dark:bg-white">
              {activeAccessory?.image?.sourceUrl ? (
                <ProductMediaImage
                  src={activeAccessory.image.sourceUrl}
                  alt={activeAccessory.image.altText ?? activeAccessory.name}
                  sizes="140px"
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold">
                  {formatCardPrice(activeAccessory?.price)}
                </span>
                {activeAccessory?.regularPrice && activeAccessory.onSale ? (
                  <span className="text-sm text-foreground/55 line-through">
                    {formatCardPrice(activeAccessory.regularPrice)}
                  </span>
                ) : null}
              </div>
              <div
                className="prose prose-neutral dark:prose-invert max-w-none text-sm prose-p:text-foreground/85"
                dangerouslySetInnerHTML={{
                  __html:
                    activeAccessory?.shortDescription ||
                    activeAccessory?.description ||
                    "Ingen beskrivelse tilgjengelig.",
                }}
              />
            </div>
          </div>
          <DialogFooter>
            {activeAccessory ? (
              <>
                <ProductAddToCartButton
                  label="Legg i handlekurv"
                  onAdd={() => addProduct(activeAccessory)}
                />
                <Button asChild variant="outline">
                  <Link href={buildProductHref(activeAccessory.slug)}>Se produkt</Link>
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
