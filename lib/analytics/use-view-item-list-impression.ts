"use client";

import { useEffect, useRef } from "react";
import { pushGa4EcommerceEvent } from "@/lib/analytics/push-ga4-ecommerce-event";
import {
  buildGa4ItemFromProduct,
  slugifyItemListId,
} from "@/lib/analytics/ga4-item";
import type { Product } from "@/lib/types/product";

/**
 * Fires `view_item_list` once per distinct product-id set for a named list
 * (homepage carousels, PDP suggestions, etc.). Syncs with GTM (external).
 */
export function useViewItemListImpression(
  products: Product[],
  listName: string,
  listIdOverride?: string
) {
  const idsKey = products.map((p) => p.id).join(",");
  const lastKeyRef = useRef("");

  useEffect(() => {
    if (products.length === 0) return;
    const listId = listIdOverride ?? slugifyItemListId(listName);
    const dedupeKey = `${listId}:${idsKey}`;
    if (lastKeyRef.current === dedupeKey) return;
    lastKeyRef.current = dedupeKey;

    pushGa4EcommerceEvent({
      event: "view_item_list",
      ecommerce: {
        item_list_id: listId,
        item_list_name: listName,
        items: products.map((p, i) => buildGa4ItemFromProduct(p, 1, i)),
      },
    });
    // idsKey captures product identity; avoid depending on array reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, listName, listIdOverride]);
}
