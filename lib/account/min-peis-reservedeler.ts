import "server-only";

import {
  collectOwnedProductSlugs,
  earliestOwnedDateBySlug,
  toMinPeisSummary,
} from "@/lib/account/min-peis";
import type { MinPeisSummary } from "@/lib/account/min-peis-types";
import { getCompletedOrdersWithLineItems } from "@/lib/account/server-account";
import { getMinPeisDetailProductBySlug } from "@/lib/graphql/fetch-min-peis-product";
import { aggregateArchiveProducts } from "@/lib/graphql/server-archive-aggregate";
import { isFireplaceProduct } from "@/lib/products/is-fireplace-product";
import { findReservedelerItemForFireplace } from "@/lib/reservedeler/match-fireplace";
import { getReservedelerItems } from "@/lib/reservedeler/server-items";
import type { ReservedelerItemCard } from "@/lib/reservedeler/types";
import type { Product } from "@/lib/types/product";

export type MinPeisReservedelerPayload = {
  fireplace: MinPeisSummary;
  matchedItem: ReservedelerItemCard | null;
  products: Product[];
  ownedProductSlugs: string[];
};

/**
 * Owned peis → matched reservedeler model → compatible spare-part products.
 * Uses the same brand + itemSlug archive filter as storefront item pages.
 *
 * Matching assumption: peis product slug equals the reservedeler model key
 * (`aduro-15` ↔ `aduro-15-deler`), with optional attribute-term and title fallbacks.
 */
export async function getMinPeisReservedeler(
  token: string,
  slug: string
): Promise<MinPeisReservedelerPayload | null> {
  const normalizedSlug = decodeURIComponent(slug).trim();
  if (!normalizedSlug) return null;

  const orders = await getCompletedOrdersWithLineItems(token);
  const ownedProductSlugs = collectOwnedProductSlugs(orders);
  if (!ownedProductSlugs.includes(normalizedSlug)) {
    return null;
  }

  const product = await getMinPeisDetailProductBySlug(normalizedSlug);
  if (!product || !isFireplaceProduct(product)) {
    return null;
  }

  const ownedSince =
    earliestOwnedDateBySlug(orders).get(normalizedSlug) ?? new Date();
  const fireplace = toMinPeisSummary(product, ownedSince);

  const items = await getReservedelerItems();
  const matchedItem = findReservedelerItemForFireplace(
    {
      slug: product.slug,
      name: product.name,
      brandSlug: product.brandSlug,
      attributeTermSlugs: product.attributeTermSlugs,
    },
    items
  );

  if (!matchedItem) {
    return {
      fireplace,
      matchedItem: null,
      products: [],
      ownedProductSlugs,
    };
  }

  const products = await aggregateArchiveProducts({
    brandSlug: matchedItem.brandSlug,
    reservedelerItemSlug: matchedItem.itemSlug,
  });

  return { fireplace, matchedItem, products, ownedProductSlugs };
}
