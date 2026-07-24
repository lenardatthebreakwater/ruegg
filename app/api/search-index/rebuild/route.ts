import { NextResponse } from "next/server";
import {
  rebuildSearchIndexPayload,
} from "@/lib/search/search-index-storage";
import { isSearchIndexRebuildAuthorized } from "@/lib/security/webhook-secret";

export async function POST(request: Request) {
  const configuredSecret =
    process.env.SEARCH_INDEX_REBUILD_SECRET ?? process.env.PRODUCT_REVALIDATE_SECRET;

  if (!isSearchIndexRebuildAuthorized(request, configuredSecret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = performance.now();

  try {
    const payload = await rebuildSearchIndexPayload();
    const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;

    return NextResponse.json(
      {
        ok: true,
        version: payload.version,
        generatedAt: payload.generatedAt,
        productCount: payload.products.length,
      },
      {
        headers: {
          "Server-Timing": `search_index_rebuild;dur=${durationMs}`,
          "X-Search-Index-Rebuild-Duration-Ms": String(durationMs),
        },
      }
    );
  } catch {
    const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
    return NextResponse.json(
      {
        ok: false,
        error: "Kunne ikke bygge sokeindeks.",
      },
      {
        status: 500,
        headers: {
          "Server-Timing": `search_index_rebuild;dur=${durationMs}`,
          "X-Search-Index-Rebuild-Duration-Ms": String(durationMs),
        },
      }
    );
  }
}
