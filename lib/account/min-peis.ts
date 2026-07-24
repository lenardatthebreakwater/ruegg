import "server-only";

import type {
  MinPeisDetail,
  MinPeisDetailPayload,
  MinPeisListPayload,
  MinPeisSummary,
} from "@/lib/account/min-peis-types";
import { getCompletedOrdersWithLineItems } from "@/lib/account/server-account";
import type { AccountOrderDetail } from "@/lib/account/types";
import {
  getMinPeisDetailProductBySlug,
  getMinPeisListProductBySlug,
} from "@/lib/graphql/fetch-min-peis-product";
import { isFireplaceProduct } from "@/lib/products/is-fireplace-product";
import type { Product, ProductAttribute } from "@/lib/types/product";

export type {
  MinPeisDetail,
  MinPeisDetailPayload,
  MinPeisListPayload,
  MinPeisSummary,
} from "@/lib/account/min-peis-types";

/** Max unique line-item slugs to classify via slim GraphQL. */
export const MIN_PEIS_CLASSIFY_SLUG_CAP = 15;

/** Max fireplaces shown under Min peis. */
export const MIN_PEIS_FIREPLACE_CAP = 5;

/** Compact tech attributes shown on Min peis detail. */
const TECH_ATTRIBUTE_CAP = 8;

function parseOrderDate(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/** Unique parent product slugs from completed order line items (order preserved). */
export function collectOwnedProductSlugs(
  orders: AccountOrderDetail[]
): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const order of orders) {
    for (const item of order.lineItems) {
      const slug = item.slug?.trim();
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      slugs.push(slug);
    }
  }
  return slugs;
}

/** Earliest completed order date per product slug. */
export function earliestOwnedDateBySlug(
  orders: AccountOrderDetail[]
): Map<string, Date> {
  const map = new Map<string, Date>();
  for (const order of orders) {
    const orderDate = parseOrderDate(order.date);
    if (!orderDate) continue;
    for (const item of order.lineItems) {
      const slug = item.slug?.trim();
      if (!slug) continue;
      const existing = map.get(slug);
      if (!existing || orderDate < existing) {
        map.set(slug, orderDate);
      }
    }
  }
  return map;
}

export function toMinPeisSummary(
  product: Product,
  ownedSince: Date
): MinPeisSummary {
  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand ?? null,
    brandSlug: product.brandSlug ?? null,
    image: product.image
      ? {
          sourceUrl: product.image.sourceUrl,
          ...(product.image.altText
            ? { altText: product.image.altText }
            : {}),
        }
      : null,
    ownedSinceDate: ownedSince.toISOString(),
    ownedSinceYear: ownedSince.getFullYear(),
  };
}

function compactAttributes(
  attributes: ProductAttribute[] | null | undefined
): ProductAttribute[] | null {
  if (!attributes?.length) return null;
  return attributes.slice(0, TECH_ATTRIBUTE_CAP);
}

async function loadCompletedOrdersContext(token: string): Promise<{
  orders: AccountOrderDetail[];
  ownedProductSlugs: string[];
  ownedSinceBySlug: Map<string, Date>;
}> {
  const orders = await getCompletedOrdersWithLineItems(token);
  return {
    orders,
    ownedProductSlugs: collectOwnedProductSlugs(orders),
    ownedSinceBySlug: earliestOwnedDateBySlug(orders),
  };
}

/**
 * Derive fireplace list for Min peis from completed orders + slim GraphQL.
 */
export async function getMinPeisList(
  token: string
): Promise<MinPeisListPayload> {
  const { ownedProductSlugs, ownedSinceBySlug } =
    await loadCompletedOrdersContext(token);

  const candidates = ownedProductSlugs.slice(0, MIN_PEIS_CLASSIFY_SLUG_CAP);
  const products = await Promise.all(
    candidates.map((slug) => getMinPeisListProductBySlug(slug))
  );

  const fireplaces: MinPeisSummary[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const product = products[i];
    const slug = candidates[i];
    if (!product || !isFireplaceProduct(product)) continue;
    const ownedSince = ownedSinceBySlug.get(slug) ?? new Date();
    fireplaces.push(toMinPeisSummary(product, ownedSince));
    if (fireplaces.length >= MIN_PEIS_FIREPLACE_CAP) break;
  }

  fireplaces.sort((a, b) => a.ownedSinceDate.localeCompare(b.ownedSinceDate));

  return { fireplaces, ownedProductSlugs };
}

/**
 * Load one owned peis detail (slim GraphQL with upsells). Returns null if not owned / not peis.
 */
export async function getMinPeisDetail(
  token: string,
  slug: string
): Promise<MinPeisDetailPayload | null> {
  const normalizedSlug = decodeURIComponent(slug).trim();
  if (!normalizedSlug) return null;

  const { ownedProductSlugs, ownedSinceBySlug } =
    await loadCompletedOrdersContext(token);

  if (!ownedProductSlugs.includes(normalizedSlug)) {
    return null;
  }

  const product = await getMinPeisDetailProductBySlug(normalizedSlug);
  if (!product || !isFireplaceProduct(product)) {
    return null;
  }

  const ownedSince = ownedSinceBySlug.get(normalizedSlug) ?? new Date();
  const fireplace: MinPeisDetail = {
    ...toMinPeisSummary(product, ownedSince),
    attributes: compactAttributes(product.attributes),
    documents: product.documents ?? null,
    dimensions: product.dimensions ?? null,
    weight: product.weight ?? null,
    accessories: product.recommendedAccessories ?? [],
  };

  return { fireplace, ownedProductSlugs };
}
