import type { Product } from "@/lib/types/product";

/** Category slugs that identify fireplace / stove catalog products. */
export const FIREPLACE_CATEGORY_SLUGS = new Set([
  "peis",
  "peisovn",
  "vedovn",
  "peisinnsats",
  "elementpeis",
  "gasspeis",
  "utepeis",
  "ildsted",
]);

type FireplaceProductLike = {
  fireplaceType?: string | null;
  categories?: Array<{ slug: string }> | null;
};

/** True when the product is a peis/ovn catalog item (attribute or category). */
export function isFireplaceProduct(product: FireplaceProductLike | Product): boolean {
  if (product.fireplaceType?.trim()) return true;
  if (!product.categories || product.categories.length === 0) return false;
  return product.categories.some((category) =>
    FIREPLACE_CATEGORY_SLUGS.has(category.slug.trim().toLowerCase())
  );
}
