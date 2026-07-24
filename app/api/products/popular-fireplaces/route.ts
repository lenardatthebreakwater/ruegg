import { NextResponse } from "next/server";
import { getPopularFireplacesProducts } from "@/lib/graphql/server-products";

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parsePositiveInt(url.searchParams.get("limit"), 8);

  try {
    const products = await getPopularFireplacesProducts(limit);
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Kunne ikke hente populære peisovner.",
      },
      { status: 500 }
    );
  }
}
