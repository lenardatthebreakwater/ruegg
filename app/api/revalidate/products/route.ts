import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  getProductCacheTag,
  PRODUCTS_ARCHIVE_CACHE_TAG,
  PRODUCTS_CACHE_TAG,
  PRODUCTS_SEARCH_CACHE_TAG,
} from "@/lib/graphql/server-products";
import { SEARCH_INDEX_CACHE_TAG } from "@/lib/search/search-index-storage";
import { SITEMAP_CACHE_TAG } from "@/lib/seo/sitemap-data";
import { isRevalidateAuthorized } from "@/lib/security/webhook-secret";
import {
  decideProductRevalidate,
  type ProductRevalidatePayload,
} from "@/lib/cache/product-revalidate-decision";

export async function POST(request: Request) {
  if (!isRevalidateAuthorized(request, process.env.PRODUCT_REVALIDATE_SECRET)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let payload: ProductRevalidatePayload = {};
  try {
    payload = (await request.json()) as ProductRevalidatePayload;
  } catch {
    payload = {};
  }

  const decision = decideProductRevalidate(payload);
  if (!decision.ok) {
    return NextResponse.json(
      { ok: false, error: decision.error },
      { status: decision.status }
    );
  }

  // Any product change affects archive listings, search and the sitemap, so
  // the shared tags are always purged; per-slug tags refresh detail pages.
  const invalidatedTags = new Set<string>([
    PRODUCTS_ARCHIVE_CACHE_TAG,
    PRODUCTS_SEARCH_CACHE_TAG,
    SEARCH_INDEX_CACHE_TAG,
    SITEMAP_CACHE_TAG,
    ...decision.slugs.map(getProductCacheTag),
  ]);

  // The global "products" tag is on EVERY product fetch (all ~2,700 detail
  // pages included). Purging it on a single product save would force a
  // re-render + WordPress re-fetch for the entire catalog, so it is reserved
  // for explicit full refreshes via revalidateAll.
  if (decision.includeGlobalProductsTag) {
    invalidatedTags.add(PRODUCTS_CACHE_TAG);
  }

  for (const tag of invalidatedTags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({
    ok: true,
    revalidated: Array.from(invalidatedTags),
    revalidateAll: decision.revalidateAll,
  });
}
