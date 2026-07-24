"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/lib/types/product";
import {
  buildGa4ItemFromProduct,
  getUnitPriceNumericFromProduct,
} from "@/lib/analytics/ga4-item";
import { pushGa4EcommerceEvent } from "@/lib/analytics/push-ga4-ecommerce-event";

type ProductViewItemTrackerProps = {
  product: Product;
};

/**
 * Fires GA4 `view_item` once per resolved product id (handles Strict Mode double-mount).
 */
export function ProductViewItemTracker({ product }: ProductViewItemTrackerProps) {
  const lastTrackedId = useRef<string | null>(null);

  useEffect(() => {
    if (!product?.id) return;
    if (lastTrackedId.current === product.id) return;
    lastTrackedId.current = product.id;

    const unit = getUnitPriceNumericFromProduct(product);
    pushGa4EcommerceEvent({
      event: "view_item",
      ecommerce: {
        currency: "NOK",
        value: unit,
        items: [buildGa4ItemFromProduct(product, 1)],
      },
    });
  }, [product]);

  return null;
}
