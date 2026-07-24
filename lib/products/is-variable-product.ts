import type { Product } from "@/lib/types/product";

/** True when the shopper must pick a variation on the PDP before add-to-cart. */
export function isVariableProduct(product: Product): boolean {
  if (product.productType === "variable") return true;
  return Boolean(product.variations && product.variations.length > 0);
}
