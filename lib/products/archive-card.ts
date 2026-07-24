import { getCanonicalArchiveAttribute } from "@/lib/product-archive-attributes";
import type { Product } from "@/lib/types/product";

export type ToArchiveCardProductOptions = {
  /**
   * Attribute term slugs are only needed on reservedeler pages (term-based
   * filtering). Everywhere else they are dead weight in the RSC payload.
   */
  keepAttributeTermSlugs?: boolean;
};

/**
 * Reduces a full Product to the subset the archive UI actually consumes
 * (cards, sidebar filters, client search, GA4 items, add-to-cart). Archive
 * pages embed thousands of these in the prerendered HTML/RSC payload, so
 * dropping unused fields cuts multiple MB per page and keeps the aggregated
 * dataset within the 2MB `unstable_cache` entry limit.
 *
 * Intentionally omits `shortDescription` (list-view only) to keep the /shop
 * aggregate under the Next.js Data Cache 2MB entry limit.
 */
export function toArchiveCardProduct(
  product: Product,
  options?: ToArchiveCardProductOptions
): Product {
  const slim: Product = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
  };

  if (product.productType) slim.productType = product.productType;
  if (product.stockStatus) slim.stockStatus = product.stockStatus;

  if (product.image?.sourceUrl) {
    slim.image = {
      sourceUrl: product.image.sourceUrl,
      ...(product.image.altText ? { altText: product.image.altText } : {}),
    };
  }
  if (product.brand) slim.brand = product.brand;
  if (product.brandSlug) slim.brandSlug = product.brandSlug;
  if (product.sku) slim.sku = product.sku;
  if (product.energyRatingBadgeUrl) {
    slim.energyRatingBadgeUrl = product.energyRatingBadgeUrl;
  }
  if (product.priceNumeric != null) slim.priceNumeric = product.priceNumeric;
  if (product.regularPrice) slim.regularPrice = product.regularPrice;
  if (product.onSale) {
    slim.onSale = true;
    if (product.saleBadge) slim.saleBadge = product.saleBadge;
  }
  if (product.maxPower != null) slim.maxPower = product.maxPower;
  if (product.nominalPower != null) slim.nominalPower = product.nominalPower;
  if (product.fireplaceType) slim.fireplaceType = product.fireplaceType;
  if (product.color) slim.color = product.color;

  if (product.categories?.length) {
    slim.categories = product.categories.map((category) => ({
      name: category.name,
      slug: category.slug,
    }));
  }

  // Only the canonical archive attributes drive sidebar filter sections; the
  // rest of the (often long) spec list is never read on archive pages.
  const canonicalAttributes = (product.attributes ?? []).filter(
    (attribute) =>
      attribute.label &&
      attribute.value &&
      getCanonicalArchiveAttribute(attribute.label) !== null
  );
  if (canonicalAttributes.length > 0) {
    slim.attributes = canonicalAttributes.map((attribute) => ({
      label: attribute.label,
      value: attribute.value,
    }));
  }

  if (options?.keepAttributeTermSlugs && product.attributeTermSlugs?.length) {
    slim.attributeTermSlugs = product.attributeTermSlugs;
  }

  return slim;
}
