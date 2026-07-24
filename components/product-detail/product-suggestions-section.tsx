"use client";

import {
  EDITORIAL_SECONDARY_TEXT_CLASS,
  MetaRubricLabel,
} from "@/components/editorial";
import { BestSellingProductsCarousel } from "@/components/products/best-selling-products-carousel";
import type { SectionIntroAlign } from "@/components/section-intro";
import type { Product } from "@/lib/types/product";
import { cn } from "@/lib/utils";

type ProductSuggestionsSectionProps = {
  products: Product[];
  title?: string;
  description?: string;
  align?: SectionIntroAlign;
  className?: string;
  /** Small-caps red eyebrow above the carousel title. */
  rubricLabel?: string;
};

export function ProductSuggestionsSection({
  products,
  title = "Du vil kanskje også like",
  description,
  align = "left",
  className,
  rubricLabel = "Utforsk mer",
}: ProductSuggestionsSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className={cn("w-full", className)}>
      <div
        className={cn(
          "mb-3",
          align === "center" && "text-center",
          align === "right" && "text-right"
        )}
      >
        <MetaRubricLabel as="span">{rubricLabel}</MetaRubricLabel>
      </div>
      <BestSellingProductsCarousel
        products={products}
        title={title}
        description={description}
        descriptionClassName={EDITORIAL_SECONDARY_TEXT_CLASS}
        align={align}
      />
    </section>
  );
}
