import { NextResponse } from "next/server";
import { getProductDetailBySlug } from "@/lib/graphql/server-products";

const DEFAULT_EDGE_MAX_AGE_SECONDS = 60 * 15;
const DEFAULT_BROWSER_MAX_AGE_SECONDS = 60;
const DEFAULT_STALE_WHILE_REVALIDATE_SECONDS = 60 * 60;

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function getEdgeCacheControl(): string {
  const browserMaxAge = parsePositiveInt(
    process.env.PRODUCT_DETAIL_BROWSER_MAX_AGE_SECONDS ?? null,
    DEFAULT_BROWSER_MAX_AGE_SECONDS
  );
  const sMaxAge = parsePositiveInt(
    process.env.PRODUCT_DETAIL_EDGE_MAX_AGE_SECONDS ?? null,
    DEFAULT_EDGE_MAX_AGE_SECONDS
  );
  const staleWhileRevalidate = parsePositiveInt(
    process.env.PRODUCT_DETAIL_EDGE_STALE_WHILE_REVALIDATE_SECONDS ?? null,
    DEFAULT_STALE_WHILE_REVALIDATE_SECONDS
  );
  return `public, max-age=${browserMaxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
}

type ProductDetailRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: ProductDetailRouteProps) {
  const { slug } = await params;
  if (!slug?.trim()) {
    return NextResponse.json(
      { error: "Produkt-slug mangler." },
      { status: 400 }
    );
  }

  try {
    const data = await getProductDetailBySlug(slug);
    if (!data.product) {
      return NextResponse.json({ product: null }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": getEdgeCacheControl() },
    });
  } catch (error) {
    console.error("Product detail API failed", error);
    return NextResponse.json(
      {
        error: "Kunne ikke hente produktdetaljer.",
      },
      { status: 500 }
    );
  }
}
