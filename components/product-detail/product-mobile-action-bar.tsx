"use client";

import * as React from "react";
import { useCart } from "@/components/cart/cart-provider";
import { useAnimatedIcon } from "@/components/icons/animated-icon";
import {
  AddToCartAnimatedIcon,
  ATC_ICON_BUTTON_CLASS,
} from "@/components/icons/add-to-cart-animated-icon";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { AskExpertDialog } from "@/components/product-detail/ask-expert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types/product";
import {
  getAddToCartLabelNb,
  isProductOutOfStock,
} from "@/lib/products/stock-status";

type ProductMobileActionBarProps = {
  children: React.ReactNode;
  className?: string;
};

type ProductMobileAddToCartButtonProps = {
  product: Product;
  className?: string;
  size?: "sm" | "lg";
};

export function ProductMobileActionBar({
  children,
  className,
}: ProductMobileActionBarProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200/70 bg-white/70 text-neutral-900 backdrop-blur-md dark:border-white/10 dark:bg-neutral-950/55 dark:text-neutral-100",
        className
      )}
    >
      <ContainedLayout as="div" className="flex items-center gap-3 py-3">
        {children}
      </ContainedLayout>
    </div>
  );
}

type ProductMobileAskExpertButtonProps = {
  product: Product;
  className?: string;
};

export function ProductMobileAskExpertButton({
  product,
  className,
}: ProductMobileAskExpertButtonProps) {
  return (
    <AskExpertDialog
      product={product}
      triggerVariant="icon"
      // Stay above neighboring ATC hover scale so the control remains clickable.
      className={cn("relative z-10", className)}
    />
  );
}

/** Sticky ATC: pin origin left + subtle scale so hover doesn’t cover expert CTA. */
export const STICKY_ATC_BUTTON_CLASS =
  "origin-left motion-safe:hover:scale-[1.01]";

export function ProductMobileAddToCartButton({
  product,
  className,
  size = "lg",
}: ProductMobileAddToCartButtonProps) {
  const { addProduct } = useCart();
  const { ref, triggerProps } = useAnimatedIcon();
  const isOutOfStock = isProductOutOfStock(product.stockStatus);
  const addToCartLabel = getAddToCartLabelNb(product.stockStatus);

  return (
    <Button
      size={size}
      className={cn("min-w-0 flex-1", ATC_ICON_BUTTON_CLASS, className)}
      disabled={isOutOfStock}
      {...triggerProps}
      onClick={() => {
        if (isOutOfStock) return;
        addProduct(product);
      }}
    >
      <AddToCartAnimatedIcon ref={ref} />
      {addToCartLabel}
    </Button>
  );
}
