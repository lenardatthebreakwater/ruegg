"use client";

import * as React from "react";
import Link from "next/link";
import { Star, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProductSaleBadge } from "@/components/products/product-sale-badge";
import { ProductStockStatusBadge } from "@/components/products/product-stock-status-badge";
import { ProductResursInfo } from "@/components/product-detail/product-resurs-info";
import {
  ENERGY_LABEL_PDP_TOOLTIP,
  EnergyLabelBadge,
} from "@/components/product-detail/energy-label-badge";
import {
  calculateResursMonthlyAmount,
  formatResursMonthlyLabel,
} from "@/lib/products/financing";
import { demoteHeadings } from "@/lib/html/demote-headings";
import { cn } from "@/lib/utils";
import { buildCategoryHref } from "@/lib/products/paths";
import {
  EDITORIAL_SECONDARY_TEXT_CLASS,
  EditorialHeading,
  MetaRubricLabel,
} from "@/components/editorial";
import {
  PDP_INNER_PANEL_SOFT_CLASS,
  PDP_PANEL_PADDING_CLASS,
  PDP_PANEL_TOGGLE_BUTTON_CLASS,
} from "@/components/product-detail/pdp-panel-styles";
import type { Product } from "@/lib/types/product";

const DISPLAYED_IN_STORE_BADGE_LABEL =
  "Utstilt i butikken – opplev før du kjøper";

type ProductInfoProps = {
  product: Product;
  baseProductName?: string;
  variations?: Product["variations"];
  selectedVariationId: string | null;
  onVariationChange: (variationId: string | null) => void;
  models?: Product["models"];
  activeModelId: string | null;
  onModelChange: (modelId: string | null) => void;
  showModelSelector?: boolean;
  className?: string;
};

function StarRating({ rating, reviewCount }: { rating: number; reviewCount?: number | null }) {
  return (
    <div className="flex w-fit items-center rounded-lg border border-primary/20 bg-primary/[0.03] px-2.5 py-1.5 shadow-xs ring-1 ring-foreground/5 dark:border-primary/25 dark:bg-card/80">
      <span className="me-2.5 flex items-center gap-1 border-e border-primary/15 pe-2.5 text-sm">
        <span className="text-lg font-medium text-foreground">{rating.toFixed(1)}</span>
        <Star className="mb-0.5 size-4 fill-amber-500 stroke-transparent" />
      </span>
      <span className={cn("text-sm", EDITORIAL_SECONDARY_TEXT_CLASS)}>
        {reviewCount ?? 0} anmeldelser
      </span>
    </div>
  );
}

function formatVariationLabel(variationName: string, productName: string): string {
  const trimmedVariationName = variationName.trim();
  const trimmedProductName = productName.trim();
  if (!trimmedVariationName || !trimmedProductName) return trimmedVariationName;

  const escapedProductName = trimmedProductName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefixPattern = new RegExp(`^${escapedProductName}\\s*-\\s*`, "i");
  if (prefixPattern.test(trimmedVariationName)) {
    return trimmedVariationName.replace(prefixPattern, "").trim();
  }

  return trimmedVariationName;
}

function formatNobbDisplayValue(rawNobb: string): string {
  const trimmed = rawNobb.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return (
          parsed
          .map((item) => String(item).trim())
          .filter((value) => value.length > 0)
          .at(0) ?? ""
        );
      }
    } catch {
      // Fallback to raw value below.
    }
  }

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .find((value) => value.length > 0) ?? "";
  }

  return trimmed;
}

export function ProductInfo({
  product,
  baseProductName,
  variations,
  selectedVariationId,
  onVariationChange,
  models,
  activeModelId,
  onModelChange,
  showModelSelector = true,
  className,
}: ProductInfoProps) {
  const {
    name,
    price,
    regularPrice,
    onSale,
    saleBadge,
    rating,
    reviewCount,
    shortDescription,
    priceNumeric,
    energyLabel,
    energyRatingBadgeUrl,
    energyLabelGuideUrl,
    displayedInStore,
  } = product;
  const monthlyAmount = calculateResursMonthlyAmount(priceNumeric);
  const monthlyAmountLabel = monthlyAmount != null ? formatResursMonthlyLabel(monthlyAmount) : null;
  const showPriceRowEnergyImage = Boolean(energyRatingBadgeUrl);
  const showPriceRowEnergyText =
    !showPriceRowEnergyImage && Boolean(energyLabel?.trim());

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {displayedInStore ? (
        <div
          className={cn(
            "inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.06] px-3 py-1.5 text-xs font-medium leading-snug text-foreground shadow-xs",
            "dark:border-primary/35 dark:bg-primary/10"
          )}
        >
          <Store
            className="size-3.5 shrink-0 text-primary"
            aria-hidden
          />
          <span className="min-w-0 text-left whitespace-normal">
            {DISPLAYED_IN_STORE_BADGE_LABEL}
          </span>
        </div>
      ) : null}

      <EditorialHeading size="product">{name}</EditorialHeading>

      {(rating != null || (reviewCount != null && reviewCount > 0)) && (
        <StarRating rating={rating ?? 0} reviewCount={reviewCount} />
      )}

      {shortDescription && (
        <div
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/85 prose-li:text-foreground/85 prose-strong:text-foreground",
            EDITORIAL_SECONDARY_TEXT_CLASS
          )}
          dangerouslySetInnerHTML={{ __html: demoteHeadings(shortDescription) }}
        />
      )}

      <Separator />

      <div
        className={cn(
          "flex w-full min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2",
          !showPriceRowEnergyImage && !showPriceRowEnergyText && "justify-start"
        )}
      >
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-3">
            <span className="text-4xl font-bold leading-none">{price}</span>
            {regularPrice && onSale && (
              <span className="text-base font-medium text-foreground/55 line-through">
                {regularPrice}
              </span>
            )}
            {saleBadge && (
              <ProductSaleBadge
                label={saleBadge}
                className="px-2.5 py-1 text-sm focus-visible:outline-none focus-visible:ring-[#262626]/40"
              />
            )}
          </div>
          <ProductStockStatusBadge stockStatus={product.stockStatus} />
        </div>
        {showPriceRowEnergyImage ? (
          <div className="shrink-0 self-center sm:ms-auto">
            <EnergyLabelBadge
              energyLabel={energyLabel}
              energyRatingBadgeUrl={energyRatingBadgeUrl}
              energyLabelGuideUrl={energyLabelGuideUrl}
              size="lg"
              showTooltip={Boolean(energyLabelGuideUrl)}
              tooltipMessage={ENERGY_LABEL_PDP_TOOLTIP}
            />
          </div>
        ) : showPriceRowEnergyText ? (
          <p
            className={cn(
              "shrink-0 text-lg font-medium tabular-nums sm:ms-auto",
              EDITORIAL_SECONDARY_TEXT_CLASS
            )}
          >
            {energyLabel}
          </p>
        ) : null}
      </div>
      {showModelSelector ? (
        <ProductModelSelector
          productName={baseProductName ?? name}
          variations={variations}
          selectedVariationId={selectedVariationId}
          onVariationChange={onVariationChange}
          models={models}
          activeModelId={activeModelId}
          onModelChange={onModelChange}
          withTopSeparator={false}
          withBottomSeparator={false}
        />
      ) : null}
      <ProductResursInfo monthlyAmountLabel={monthlyAmountLabel} />
    </div>
  );
}

type ProductModelSelectorProps = {
  productName: string;
  variations?: Product["variations"];
  selectedVariationId: string | null;
  onVariationChange: (variationId: string | null) => void;
  models?: Product["models"];
  activeModelId: string | null;
  onModelChange: (modelId: string | null) => void;
  withTopSeparator?: boolean;
  withBottomSeparator?: boolean;
  className?: string;
};

export function ProductModelSelector({
  productName,
  variations,
  selectedVariationId,
  onVariationChange,
  models,
  activeModelId,
  onModelChange,
  withTopSeparator = false,
  withBottomSeparator = false,
  className,
}: ProductModelSelectorProps) {
  const hasVariationOptions = (variations?.length ?? 0) > 0;
  const hasModelOptions = (models?.length ?? 0) > 0;
  if (!hasVariationOptions && !hasModelOptions) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {withTopSeparator ? <Separator /> : null}

      <div>
        <MetaRubricLabel className="mb-2.5">Modell</MetaRubricLabel>
        {hasVariationOptions ? (
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Modell">
            {variations?.map((variation) => {
              const isActive = selectedVariationId === variation.id;
              return (
                <Button
                  key={variation.id}
                  variant={isActive ? "redOutline" : "outline"}
                  size="sm"
                  onClick={() => onVariationChange(variation.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "h-auto min-h-10 justify-start whitespace-normal text-left leading-snug",
                    isActive && "bg-primary/[0.06] font-semibold ring-1 ring-primary/35"
                  )}
                >
                  {formatVariationLabel(variation.name, productName)}
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Modell">
            {models?.map((model) => {
              const isActive = activeModelId === model.id;
              return (
                <Button
                  key={model.id}
                  variant={isActive ? "redOutline" : "outline"}
                  size="sm"
                  onClick={() => onModelChange(model.id)}
                  aria-pressed={isActive}
                  className={cn(
                    isActive && "bg-primary/[0.06] font-semibold ring-1 ring-primary/35"
                  )}
                >
                  {model.name}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {withBottomSeparator ? <Separator /> : null}
    </div>
  );
}

type ProductMetaRow = {
  key: string;
  label: string;
  value: React.ReactNode;
};

type ProductMetaStripProps = {
  product: Product;
  className?: string;
};

const META_STRIP_INITIAL_ROW_COUNT = 4;

const metaChipClassName = cn(
  "h-auto min-h-6 max-w-full rounded-md border-0 px-1.5 py-0.5 text-sm font-normal leading-snug",
  "whitespace-normal break-words [a]:text-inherit [a]:no-underline [a]:hover:opacity-90"
);

function ProductMetaValueChips({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">{children}</div>
  );
}

export function ProductMetaStrip({ product, className }: ProductMetaStripProps) {
  const [expanded, setExpanded] = React.useState(false);
  const rows: ProductMetaRow[] = [];

  if (product.nobb) {
    rows.push({
      key: "nobb",
      label: "NOBB",
      value: formatNobbDisplayValue(product.nobb),
    });
  }

  if (product.sku) {
    rows.push({
      key: "sku",
      label: "Produktnummer",
      value: product.sku,
    });
  }

  if (product.brand) {
    rows.push({
      key: "brand",
      label: "Merke",
      value: product.brand,
    });
  }

  const gtin = product.gtin?.trim();
  if (gtin) {
    rows.push({
      key: "gtin",
      label: "GTIN",
      value: gtin,
    });
  }

  if (product.categories && product.categories.length > 0) {
    rows.push({
      key: "category",
      label: "Kategorier",
      value: (
        <ProductMetaValueChips>
          {product.categories.map((category) => (
            <Badge key={category.slug} variant="secondary" className={metaChipClassName} asChild>
              <Link href={buildCategoryHref(category.slug)}>{category.name}</Link>
            </Badge>
          ))}
        </ProductMetaValueChips>
      ),
    });
  }

  if (product.tags && product.tags.length > 0) {
    rows.push({
      key: "tags",
      label: "Stikkord",
      value: (
        <ProductMetaValueChips>
          {product.tags.map((tag) => (
            <Badge key={tag.slug} variant="secondary" className={metaChipClassName}>
              {tag.name}
            </Badge>
          ))}
        </ProductMetaValueChips>
      ),
    });
  }

  if (rows.length === 0) return null;

  const hasMoreRows = rows.length > META_STRIP_INITIAL_ROW_COUNT;
  const visibleRows = expanded
    ? rows
    : rows.slice(0, META_STRIP_INITIAL_ROW_COUNT);

  return (
    <div
      className={cn(
        PDP_INNER_PANEL_SOFT_CLASS,
        "overflow-hidden text-sm",
        className
      )}
    >
      <div className={PDP_PANEL_PADDING_CLASS}>
        <MetaRubricLabel className="mb-3">Produktdetaljer</MetaRubricLabel>
        <div className="overflow-hidden rounded-lg border border-primary/15 ring-1 ring-foreground/5 dark:border-primary/20">
          <table className="w-full table-fixed text-sm">
            <tbody>
              {visibleRows.map((row, index) => (
                <tr
                  key={row.key}
                  className={cn(
                    "border-b border-primary/10 last:border-b-0",
                    index % 2 === 0
                      ? "bg-primary/[0.03] dark:bg-primary/[0.06]"
                      : "bg-background/80"
                  )}
                >
                  <th
                    scope="row"
                    className="w-[38%] px-3 py-2.5 text-left align-top font-medium text-foreground sm:w-[32%] sm:px-4"
                  >
                    {row.label}
                  </th>
                  <td
                    className={cn(
                      "px-3 py-2.5 align-top [overflow-wrap:anywhere] sm:px-4",
                      EDITORIAL_SECONDARY_TEXT_CLASS
                    )}
                  >
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {hasMoreRows ? (
        <button
          type="button"
          className={PDP_PANEL_TOGGLE_BUTTON_CLASS}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Vis mindre" : "Vis mer"}
        </button>
      ) : null}
    </div>
  );
}
