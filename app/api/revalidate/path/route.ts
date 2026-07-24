import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  decidePathRevalidate,
  revalidatePathVariants,
  type PathRevalidatePayload,
} from "@/lib/cache/path-revalidate-decision";
import { isRevalidateAuthorized } from "@/lib/security/webhook-secret";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      endpoint: "/api/revalidate/path",
      methods: ["POST"],
      usage: 'POST JSON { "path": "/lagersalg" } or { "paths": ["/lagersalg"] }',
    },
    { status: 405, headers: { Allow: "POST" } }
  );
}

export async function POST(request: Request) {
  if (!isRevalidateAuthorized(request, process.env.PRODUCT_REVALIDATE_SECRET)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let payload: PathRevalidatePayload = {};
  try {
    payload = (await request.json()) as PathRevalidatePayload;
  } catch {
    payload = {};
  }

  const decision = decidePathRevalidate(payload);
  if (!decision.ok) {
    return NextResponse.json(
      { ok: false, error: decision.error },
      { status: decision.status }
    );
  }

  const revalidatedPaths = new Set<string>();
  for (const path of decision.paths) {
    for (const variant of revalidatePathVariants(path)) {
      revalidatePath(variant);
      revalidatedPaths.add(variant);
    }
  }

  // Path-specific archive tags only — never shared `products` / `products:archive`.
  for (const tag of decision.tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({
    ok: true,
    revalidated: {
      paths: Array.from(revalidatedPaths),
      tags: decision.tags,
    },
  });
}
