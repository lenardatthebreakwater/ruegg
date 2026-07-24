import { NextResponse } from "next/server";

type SearchBiEventPayload = {
  eventType?: string;
  query?: string;
  resultCount?: number;
  productSlug?: string;
  source?: string;
  timestamp?: string;
  visitorId?: string;
  sessionId?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SearchBiEventPayload;

    // Persisting to your BI warehouse can be added here (BigQuery, PostHog, etc.).
    console.info("[search-bi-event]", JSON.stringify(payload));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid analytics payload." },
      { status: 400 }
    );
  }
}
