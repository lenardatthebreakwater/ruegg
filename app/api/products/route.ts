import { NextResponse } from "next/server";
import { getArchiveProductsPage } from "@/lib/graphql/server-products";
import { toArchiveCardProduct } from "@/lib/products/archive-card";

const DEFAULT_EDGE_MAX_AGE_SECONDS = 60 * 5;
const DEFAULT_BROWSER_MAX_AGE_SECONDS = 60;
const DEFAULT_STALE_WHILE_REVALIDATE_SECONDS = 60 * 60;
const MAX_PAGE_SIZE = 100;

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

export async function GET(request: Request) {
  const startedAt = performance.now();
  const url = new URL(request.url);
  const rawFirst = parsePositiveInt(url.searchParams.get("first"), 24);
  const first = Math.min(rawFirst, MAX_PAGE_SIZE);
  const after = url.searchParams.get("after");
  const onSaleOnly = url.searchParams.get("onSaleOnly") === "true";
  const rawCategorySlug = url.searchParams.get("categorySlug");
  const categorySlug =
    rawCategorySlug && rawCategorySlug.trim().length > 0
      ? rawCategorySlug.trim()
      : null;
  const rawBrandSlug = url.searchParams.get("brandSlug");
  const brandSlug =
    rawBrandSlug && rawBrandSlug.trim().length > 0 ? rawBrandSlug.trim() : null;
  const rawReservedelerItemSlug = url.searchParams.get("reservedelerItemSlug");
  const reservedelerItemSlug =
    rawReservedelerItemSlug && rawReservedelerItemSlug.trim().length > 0
      ? rawReservedelerItemSlug.trim()
      : null;

  try {
    const data = await getArchiveProductsPage({
      first,
      after: after && after.trim().length > 0 ? after : null,
      onSaleOnly,
      categorySlug,
      brandSlug,
      reservedelerItemSlug,
    });

    // Mirror the server aggregate: archive consumers only need card fields.
    const slimData = {
      ...data,
      products: data.products.map((product) =>
        toArchiveCardProduct(product, {
          keepAttributeTermSlugs: Boolean(reservedelerItemSlug),
        })
      ),
    };

    const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
    return NextResponse.json(slimData, {
      headers: {
        "Cache-Control": getEdgeCacheControl(),
        "Server-Timing": `products_api;dur=${durationMs}`,
        "X-Products-Api-Duration-Ms": String(durationMs),
        "X-Products-Api-First": String(first),
        "X-Products-Api-On-Sale-Only": onSaleOnly ? "true" : "false",
        "X-Products-Api-Has-After": after && after.trim().length > 0 ? "true" : "false",
        "X-Products-Api-Category-Slug": categorySlug ?? "none",
        "X-Products-Api-Brand-Slug": brandSlug ?? "none",
        "X-Products-Api-Reservedeler-Item-Slug": reservedelerItemSlug ?? "none",
      },
    });
  } catch (error) {
    const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
    return NextResponse.json(
      {
        error: "Kunne ikke hente produkter.",
      },
      {
        status: 500,
        headers: {
          "Server-Timing": `products_api;dur=${durationMs}`,
          "X-Products-Api-Duration-Ms": String(durationMs),
          "X-Products-Api-First": String(first),
          "X-Products-Api-On-Sale-Only": onSaleOnly ? "true" : "false",
          "X-Products-Api-Has-After": after && after.trim().length > 0 ? "true" : "false",
          "X-Products-Api-Category-Slug": categorySlug ?? "none",
          "X-Products-Api-Brand-Slug": brandSlug ?? "none",
          "X-Products-Api-Reservedeler-Item-Slug": reservedelerItemSlug ?? "none",
        },
      }
    );
  }
}
