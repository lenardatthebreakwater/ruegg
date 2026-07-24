import { NextResponse } from "next/server";
import { getWordpressShippingQuoteUrl } from "@/lib/wordpress-urls";

type QuoteRequestBody = {
  country?: string;
  postcode?: string;
  productId?: number | string | null;
  productSlug?: string | null;
  quantity?: number;
};

type QuoteMethod = {
  id: string;
  name: string;
  priceLabel?: string;
};

const DEFAULT_TIMEOUT_MS = 12_000;

function normalizeCountry(value: string): string {
  return value.trim().toUpperCase();
}

function normalizePostcode(value: string): string {
  return value.replace(/\s+/g, "").trim();
}

function toNok(value: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function parseNumberish(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return null;
  const parsed = Number.parseFloat(cleaned.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseWordpressProductId(value: QuoteRequestBody["productId"]): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);

  if (typeof value === "string" && value.trim()) {
    const directNumeric = Number.parseInt(value, 10);
    if (Number.isFinite(directNumeric)) return directNumeric;

    try {
      const decoded = Buffer.from(value, "base64").toString("utf8");
      const match = decoded.match(/(\d+)/);
      if (!match) return null;
      const parsed = Number.parseInt(match[1], 10);
      return Number.isFinite(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return null;
}

function getValue(source: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (key in source) return source[key];
  }
  return undefined;
}

function normalizeMethod(candidate: unknown, index: number): QuoteMethod | null {
  if (!candidate || typeof candidate !== "object") return null;
  const source = candidate as Record<string, unknown>;

  const idValue = getValue(source, ["id", "method_id", "instance_id", "rate_id"]);
  const nameValue = getValue(source, [
    "name",
    "label",
    "title",
    "method_title",
    "display_name",
  ]);

  const id = typeof idValue === "string" && idValue.trim() ? idValue : `method-${index}`;
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  if (!name) return null;

  const rawPrice = getValue(source, [
    "priceLabel",
    "formatted_price",
    "formatted_cost",
    "price",
    "cost",
    "amount",
  ]);

  let priceLabel: string | undefined;
  if (typeof rawPrice === "string" && rawPrice.trim()) {
    priceLabel = rawPrice.trim();
  } else {
    const numeric = parseNumberish(rawPrice);
    if (numeric != null) {
      priceLabel = toNok(numeric);
    }
  }

  return { id, name, priceLabel };
}

function extractMethods(payload: unknown): QuoteMethod[] {
  if (Array.isArray(payload)) {
    return payload
      .map((method, index) => normalizeMethod(method, index))
      .filter((method): method is QuoteMethod => method !== null);
  }

  if (!payload || typeof payload !== "object") return [];
  const source = payload as Record<string, unknown>;
  const collections = [
    source.methods,
    source.shippingMethods,
    source.shipping_methods,
    source.rates,
    source.data,
    source.result,
  ];

  for (const collection of collections) {
    if (!Array.isArray(collection)) continue;
    const normalized = collection
      .map((method, index) => normalizeMethod(method, index))
      .filter((method): method is QuoteMethod => method !== null);
    if (normalized.length > 0) return normalized;
  }

  return [];
}

export async function POST(request: Request) {
  const quoteUrl = getWordpressShippingQuoteUrl();
  if (!quoteUrl) {
    return NextResponse.json(
      { ok: false, error: "WordPress URL er ikke konfigurert." },
      { status: 500 }
    );
  }

  let body: QuoteRequestBody;
  try {
    body = (await request.json()) as QuoteRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ugyldig forespørsel for fraktberegning." },
      { status: 400 }
    );
  }

  const country = normalizeCountry(body.country ?? "");
  const postcode = normalizePostcode(body.postcode ?? "");
  const productId = parseWordpressProductId(body.productId);

  if (!country || !postcode) {
    return NextResponse.json(
      { ok: false, error: "Land og postnummer må oppgis." },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const secret = process.env.WORDPRESS_SHIPPING_QUOTE_SECRET;
    if (secret) {
      headers["X-PB-Shipping-Secret"] = secret;
    }

    const payload = {
      country,
      postcode,
      postalCode: postcode,
      productId,
      product_id: productId,
      productSlug: body.productSlug ?? null,
      quantity: Math.max(1, body.quantity ?? 1),
    };

    const response = await fetch(quoteUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await response.text();
    let json: unknown = null;
    if (text) {
      try {
        json = JSON.parse(text) as unknown;
      } catch {
        json = { raw: text };
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Klarte ikke hente fraktalternativer fra WordPress.",
        },
        { status: 502 }
      );
    }

    const methods = extractMethods(json);
    return NextResponse.json({ ok: true, methods });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        { ok: false, error: "Forespørselen mot WordPress tok for lang tid." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Uventet feil ved henting av fraktalternativer." },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
