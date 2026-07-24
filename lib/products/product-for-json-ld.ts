import { mergeProductAttributes } from "@/lib/products/merge-product-attributes";
import type { Product } from "@/lib/types/product";

/**
 * Product view for JSON-LD, aligned with the default PDP selection (first variation when variable).
 * Does not change gallery `images` — only price/sku/GTIN/stock/physical/attribute fields that vary.
 *
 * Offer strategy (see `buildProductSchema`): when variation numeric prices span a range,
 * emit AggregateOffer (low/high/offerCount); otherwise a single Offer for this first variation.
 */
export function getProductForJsonLd(product: Product): Product {
  const first = product.variations?.[0];
  if (!first) {
    return product;
  }

  return {
    ...product,
    sku: first.sku?.trim() || product.sku,
    price: first.price || product.price,
    priceNumeric: first.priceNumeric ?? product.priceNumeric,
    regularPrice: first.regularPrice ?? product.regularPrice,
    onSale: first.onSale ?? product.onSale,
    saleBadge: first.saleBadge ?? product.saleBadge,
    stockStatus: first.stockStatus ?? product.stockStatus,
    nobb: first.nobb?.trim() || product.nobb,
    gtin: first.gtin?.trim() || product.gtin,
    weight: first.weight ?? product.weight,
    dimensions: first.dimensions ?? product.dimensions,
    weightKg: first.weightKg ?? product.weightKg,
    lengthCm: first.lengthCm ?? product.lengthCm,
    widthCm: first.widthCm ?? product.widthCm,
    heightCm: first.heightCm ?? product.heightCm,
    attributes: mergeProductAttributes(product.attributes, first.attributes),
  };
}
