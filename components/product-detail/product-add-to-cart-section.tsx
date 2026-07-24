"use client";

import * as React from "react";
import { AskExpertDialog } from "@/components/product-detail/ask-expert-dialog";
import { ProductMobileAddToCartButton } from "@/components/product-detail/product-mobile-action-bar";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types/product";

type ProductAddToCartSectionProps = {
  product: Product;
  className?: string;
};

/** Shared height for inline PDP action buttons (matches modell buttons + primary CTAs). */
export const PDP_INLINE_ACTION_BUTTON_CLASS =
  "h-10 min-h-10";

export const ProductAddToCartSection = React.forwardRef<
  HTMLDivElement,
  ProductAddToCartSectionProps
>(function ProductAddToCartSection({ product, className }, ref) {
  return (
    <div
      ref={ref}
      className={cn("flex w-full flex-row items-stretch gap-2 sm:gap-3", className)}
    >
      <ProductMobileAddToCartButton
        product={product}
        size="lg"
        className={cn(
          "min-w-0 flex-[5] text-xs whitespace-nowrap sm:text-sm",
          PDP_INLINE_ACTION_BUTTON_CLASS,
        )}
      />
      <AskExpertDialog
        product={product}
        triggerVariant="default"
        className={cn("min-w-0 flex-[3]", PDP_INLINE_ACTION_BUTTON_CLASS)}
      />
    </div>
  );
});
