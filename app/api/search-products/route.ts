import { NextResponse } from "next/server";
import { getSearchProducts } from "@/lib/graphql/server-products";
import { readSearchIndexPayload } from "@/lib/search/search-index-storage";
import type { SearchProductsApiResponse } from "@/lib/types/product-api";

const DEFAULT_EDGE_MAX_AGE_SECONDS = 60 * 5;
const DEFAULT_BROWSER_MAX_AGE_SECONDS = 60;
const DEFAULT_STALE_WHILE_REVALIDATE_SECONDS = 60 * 60;
const SEARCH_TARGET_DURATION_MS = 1_000;

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function getEdgeCacheControl(): string {
  const browserMaxAge = parsePositiveInt(
    process.env.PRODUCTS_BROWSER_MAX_AGE_SECONDS ?? null,
    DEFAULT_BROWSER_MAX_AGE_SECONDS
  );
  const sMaxAge = parsePositiveInt(
    process.env.PRODUCTS_EDGE_MAX_AGE_SECONDS ?? null,
    DEFAULT_EDGE_MAX_AGE_SECONDS
  );
  const staleWhileRevalidate = parsePositiveInt(
    process.env.PRODUCTS_EDGE_STALE_WHILE_REVALIDATE_SECONDS ?? null,
    DEFAULT_STALE_WHILE_REVALIDATE_SECONDS
  );
  return `public, max-age=${browserMaxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
}

export async function GET() {
  const startedAt = performance.now();

  try {
    let source = "precomputed";
    let generatedAt = "";
    let products = [] as SearchProductsApiResponse["products"];

    try {
      const searchIndex = await readSearchIndexPayload();
      generatedAt = searchIndex.generatedAt;
      products = searchIndex.products;
    } catch {
      // Keep the route resilient if index cache is unavailable.
      source = "live-fallback";
      products = await getSearchProducts();
    }

    const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;

    const payload: SearchProductsApiResponse = { products };
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": getEdgeCacheControl(),
        "Server-Timing": `search_products_api;dur=${durationMs}`,
        "X-Search-Products-Api-Duration-Ms": String(durationMs),
        "X-Search-Products-Count": String(products.length),
        "X-Search-Index-Source": source,
        "X-Search-Index-Generated-At": generatedAt,
        "X-Search-Target-Duration-Ms": String(SEARCH_TARGET_DURATION_MS),
      },
    });
  } catch (error) {
    const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
    return NextResponse.json(
      {
        error: "Kunne ikke hente produkter for sok.",
      },
      {
        status: 500,
        headers: {
          "Server-Timing": `search_products_api;dur=${durationMs}`,
          "X-Search-Products-Api-Duration-Ms": String(durationMs),
        },
      }
    );
  }
}
