import type { CartItem } from "@/stores/cart-store";
import { decodeRelayDatabaseId } from "@/lib/graphql/relay-id";
import type { Product } from "@/lib/types/product";

/** GA4 ecommerce `items[]` row (subset of spec fields we populate). */
export type Ga4Item = {
  item_id: string;
  item_name: string;
  price?: number;
  item_brand?: string;
  quantity?: number;
  index?: number;
};

function parsePriceNumeric(price: string): number {
  const cleaned = price.replace(/&nbsp;/g, " ").replace(/[^\d,.\s]/g, "").trim();
  if (!cleaned) return 0;

  const compact = cleaned.replace(/\s/g, "");
  const hasComma = compact.includes(",");
  const hasDot = compact.includes(".");

  if (hasComma && hasDot) {
    return Number.parseFloat(compact.replace(/\./g, "").replace(",", ".")) || 0;
  }

  if (hasComma) {
    return Number.parseFloat(compact.replace(",", ".")) || 0;
  }

  return Number.parseFloat(compact) || 0;
}

/**
 * Prefer Woo numeric id from GraphQL relay id, else URL slug.
 */
export function resolveGa4ItemId(product: Product): string {
  const decoded = decodeRelayDatabaseId(product.id);
  if (decoded != null) return String(decoded);
  return product.slug;
}

export function resolveGa4ItemIdFromCartItem(item: CartItem): string {
  if (item.databaseId != null) return String(item.databaseId);
  const decoded = decodeRelayDatabaseId(item.id);
  if (decoded != null) return String(decoded);
  return item.slug;
}

export function buildGa4ItemFromProduct(
  product: Product,
  quantity = 1,
  index?: number
): Ga4Item {
  const price =
    typeof product.priceNumeric === "number"
      ? product.priceNumeric
      : parsePriceNumeric(product.price);

  const row: Ga4Item = {
    item_id: resolveGa4ItemId(product),
    item_name: product.name,
    quantity,
    price,
  };

  if (product.brand) {
    row.item_brand = product.brand;
  }
  if (index !== undefined) {
    row.index = index;
  }

  return row;
}

export function buildGa4ItemFromCartItem(
  item: CartItem,
  quantityOverride?: number
): Ga4Item {
  const q = quantityOverride ?? item.quantity;
  const row: Ga4Item = {
    item_id: resolveGa4ItemIdFromCartItem(item),
    item_name: item.name,
    quantity: q,
    price: item.unitPriceNumeric,
  };
  return row;
}

export function getUnitPriceNumericFromProduct(product: Product): number {
  if (typeof product.priceNumeric === "number") return product.priceNumeric;
  return parsePriceNumeric(product.price);
}

/** Stable id for PLP list context (GTM / GA4 `item_list_id`). */
export function slugifyItemListId(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 64);
  return slug || "product_list";
}
