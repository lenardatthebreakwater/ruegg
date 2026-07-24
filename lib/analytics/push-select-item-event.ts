import { pushGa4EcommerceEvent } from "@/lib/analytics/push-ga4-ecommerce-event";
import { buildGa4ItemFromProduct } from "@/lib/analytics/ga4-item";
import type { Product } from "@/lib/types/product";

export type SelectItemListContext = {
  listId?: string;
  listName?: string;
  listIndex?: number;
};

/** GA4 `select_item` when a product card navigates to the PDP. */
export function pushSelectItemEvent(
  product: Product,
  context?: SelectItemListContext
) {
  pushGa4EcommerceEvent({
    event: "select_item",
    ecommerce: {
      ...(context?.listId ? { item_list_id: context.listId } : {}),
      ...(context?.listName ? { item_list_name: context.listName } : {}),
      items: [buildGa4ItemFromProduct(product, 1, context?.listIndex)],
    },
  });
}
