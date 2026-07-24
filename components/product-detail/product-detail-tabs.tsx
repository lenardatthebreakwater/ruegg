"use client";

import * as React from "react";
import {
  EDITORIAL_SECONDARY_TEXT_CLASS,
  MetaRubricLabel,
} from "@/components/editorial";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types/product";
import { RecommendedAccessoriesCarousel } from "@/components/product-detail/recommended-accessories-carousel";
import { ProductDescriptionCards } from "@/components/product-detail/product-description-cards";
import {
  PDP_BORDERED_PANEL_CLASS,
  PDP_PANEL_PADDING_CLASS,
  PDP_PANEL_TOGGLE_BUTTON_CLASS,
} from "@/components/product-detail/pdp-panel-styles";
import { SectionIntro } from "@/components/section-intro";
import { demoteHeadings } from "@/lib/html/demote-headings";

const DESCRIPTION_PROSE_CLASS =
  "prose prose-neutral dark:prose-invert max-w-none text-foreground/85 prose-headings:text-foreground prose-p:text-foreground/85 prose-li:text-foreground/85 prose-strong:text-foreground prose-a:text-primary";

type ProductDetailTabsContentProps = {
  product: Product;
  className?: string;
};

export function ProductDetailTabsContent({ product, className }: ProductDetailTabsContentProps) {
  const [descriptionExpanded, setDescriptionExpanded] = React.useState(false);

  const description = demoteHeadings(
    product.description || product.shortDescription || ""
  );
  const descriptionCards = product.descriptionCards ?? [];
  const hasDescriptionCards = descriptionCards.length > 0;
  const shouldTruncateDescription = description.length > 320;

  return (
    <div className={cn("min-w-0", className)}>
      {hasDescriptionCards ? (
        <ProductDescriptionCards sections={descriptionCards} />
      ) : description ? (
        <div className={cn(PDP_BORDERED_PANEL_CLASS, "overflow-hidden")}>
          <div className={PDP_PANEL_PADDING_CLASS}>
            <MetaRubricLabel className="mb-3">Beskrivelse</MetaRubricLabel>
            <div
              className={cn(
                "relative",
                shouldTruncateDescription &&
                  !descriptionExpanded &&
                  "max-h-56 overflow-hidden"
              )}
            >
              <div className={DESCRIPTION_PROSE_CLASS}>
                <div dangerouslySetInnerHTML={{ __html: description }} />
              </div>
              {shouldTruncateDescription && !descriptionExpanded ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-primary/[0.03] via-primary/[0.02] to-transparent dark:from-card/60 dark:via-card/40" />
              ) : null}
            </div>
          </div>
          {shouldTruncateDescription ? (
            <button
              type="button"
              className={PDP_PANEL_TOGGLE_BUTTON_CLASS}
              aria-expanded={descriptionExpanded}
              onClick={() => setDescriptionExpanded((current) => !current)}
            >
              {descriptionExpanded ? "Vis mindre" : "Vis mer"}
            </button>
          ) : null}
        </div>
      ) : (
        <p className={cn("text-sm", EDITORIAL_SECONDARY_TEXT_CLASS)}>
          Ingen beskrivelse tilgjengelig.
        </p>
      )}
    </div>
  );
}

type ProductDetailRecommendedAccessoriesProps = {
  product: Product;
  className?: string;
};

export function ProductDetailRecommendedAccessories({
  product,
  className,
}: ProductDetailRecommendedAccessoriesProps) {
  const accessories = product.recommendedAccessories ?? [];

  if (accessories.length === 0) {
    return (
      <div className={cn("min-w-0", className)}>
        <SectionIntro
          title="Anbefalt tilbehør"
          description="Kompletter peisen med tilbehør som passer perfekt til denne modellen."
          align="center"
          className="my-6 md:my-8"
        />
        <p className={cn("text-sm", EDITORIAL_SECONDARY_TEXT_CLASS)}>
          Ingen anbefalt tilbehør.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <RecommendedAccessoriesCarousel accessories={accessories} />
    </div>
  );
}

type ProductDetailTabsProps = {
  product: Product;
  className?: string;
};

export function ProductDetailTabs({ product, className }: ProductDetailTabsProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <ProductDetailTabsContent product={product} />
      <ProductDetailRecommendedAccessories product={product} />
    </div>
  );
}
