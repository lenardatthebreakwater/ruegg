import "server-only";

import { graphqlRequest } from "@/lib/graphql/client";
import { mapWooProductToProduct } from "@/lib/graphql/map-woo-product";
import {
  MIN_PEIS_DETAIL_PRODUCT_BY_SLUG_QUERY,
  MIN_PEIS_LIST_PRODUCT_BY_SLUG_QUERY,
} from "@/lib/graphql/queries/products";
import type { WooProductBySlugResponse } from "@/lib/graphql/types";
import type { Product } from "@/lib/types/product";

const MIN_PEIS_REVALIDATE_SECONDS = 3600;

async function fetchMinPeisProductBySlug(
  slug: string,
  query: string
): Promise<Product | null> {
  const normalizedSlug = decodeURIComponent(slug).trim();
  if (!normalizedSlug) return null;

  const data = await graphqlRequest<WooProductBySlugResponse>(
    query,
    { slug: normalizedSlug },
    {
      cache: "force-cache",
      next: {
        revalidate: MIN_PEIS_REVALIDATE_SECONDS,
        tags: [`min-peis-product-${normalizedSlug}`],
      },
    }
  );

  if (!data.product) return null;
  return mapWooProductToProduct(data.product);
}

/** Slim product for Min peis list / fireplace classification (no upsells). */
export async function getMinPeisListProductBySlug(
  slug: string
): Promise<Product | null> {
  return fetchMinPeisProductBySlug(slug, MIN_PEIS_LIST_PRODUCT_BY_SLUG_QUERY);
}

/** Slim product for Min peis detail including upsell accessory cards. */
export async function getMinPeisDetailProductBySlug(
  slug: string
): Promise<Product | null> {
  return fetchMinPeisProductBySlug(slug, MIN_PEIS_DETAIL_PRODUCT_BY_SLUG_QUERY);
}
