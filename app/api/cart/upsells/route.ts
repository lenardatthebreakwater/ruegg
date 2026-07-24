import { NextResponse } from "next/server"
import {
  buildSideCartUpsellsCacheKey,
  getCachedSideCartUpsells,
  setCachedSideCartUpsells,
} from "@/lib/cart/side-cart-upsells-cache"
import type {
  SideCartUpsellItem,
  SideCartUpsellsApiResponse,
} from "@/lib/cart/side-cart-upsells-types"
import { getWordpressSideCartUpsellsUrl } from "@/lib/wordpress-urls"

/** Order bump evaluation on WordPress can exceed 2s with multiple cart lines; keep headroom for cold starts. */
const DEFAULT_TIMEOUT_MS = 15_000

function parseUpsellItem(raw: unknown): SideCartUpsellItem | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const databaseId = Number(o.databaseId ?? o.database_id)
  const slug = typeof o.slug === "string" ? o.slug.trim() : ""
  const name = typeof o.name === "string" ? o.name : ""
  const price = typeof o.price === "string" ? o.price : ""
  const priceNumeric = typeof o.priceNumeric === "number" ? o.priceNumeric : Number(o.priceNumeric)
  const imageUrl = typeof o.imageUrl === "string" ? o.imageUrl : ""
  const imageAlt = typeof o.imageAlt === "string" ? o.imageAlt : ""
  if (!Number.isFinite(databaseId) || databaseId <= 0 || !slug || !name) {
    return null
  }
  const regularRaw = o.regularPrice ?? o.regular_price
  const regularPrice =
    typeof regularRaw === "string" && regularRaw.trim() ? regularRaw : null
  const onSale = Boolean(o.onSale ?? o.on_sale)
  return {
    databaseId: Math.trunc(databaseId),
    slug,
    name,
    price: price || "—",
    priceNumeric: Number.isFinite(priceNumeric) ? priceNumeric : 0,
    regularPrice,
    onSale,
    imageUrl,
    imageAlt,
  }
}

function extractUpsells(payload: unknown): SideCartUpsellItem[] {
  if (!payload || typeof payload !== "object") return []
  const source = payload as Record<string, unknown>
  const rawList = source.upsells
  if (!Array.isArray(rawList)) return []
  return rawList
    .map((item) => parseUpsellItem(item))
    .filter((item): item is SideCartUpsellItem => item !== null)
}

export async function POST(request: Request) {
  const upsellsUrl = getWordpressSideCartUpsellsUrl()
  if (!upsellsUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "WordPress URL er ikke konfigurert.",
      } satisfies SideCartUpsellsApiResponse,
      { status: 500 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Ugyldig forespørsel for tilbehørsforslag.",
      } satisfies SideCartUpsellsApiResponse,
      { status: 400 }
    )
  }

  const source = body && typeof body === "object" ? (body as Record<string, unknown>) : {}
  const itemsRaw = source.items
  if (!Array.isArray(itemsRaw)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Listen over handlekurvlinjer mangler.",
      } satisfies SideCartUpsellsApiResponse,
      { status: 400 }
    )
  }

  const items: Array<{ productId: number; quantity: number }> = []
  for (const row of itemsRaw) {
    if (!row || typeof row !== "object") continue
    const r = row as Record<string, unknown>
    const pid = Number(r.productId ?? r.product_id)
    const qty = Number(r.quantity ?? 1)
    if (!Number.isFinite(pid) || pid <= 0) continue
    items.push({
      productId: Math.trunc(pid),
      quantity: Number.isFinite(qty) && qty > 0 ? Math.trunc(qty) : 1,
    })
  }

  if (items.length === 0) {
    return NextResponse.json({
      ok: true,
      upsells: [],
    } satisfies SideCartUpsellsApiResponse)
  }

  const cacheKey = buildSideCartUpsellsCacheKey(items)
  const cached = getCachedSideCartUpsells(cacheKey)
  if (cached) {
    return NextResponse.json({
      ok: true,
      upsells: cached,
    } satisfies SideCartUpsellsApiResponse)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    const secret = process.env.WORDPRESS_SIDE_CART_UPSELLS_SECRET
    if (secret) {
      headers["X-PB-Side-Cart-Upsells-Secret"] = secret
    }

    const response = await fetch(upsellsUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ items }),
      signal: controller.signal,
      cache: "no-store",
    })

    const text = await response.text()
    let json: unknown = null
    if (text) {
      try {
        json = JSON.parse(text) as unknown
      } catch {
        json = { raw: text }
      }
    }

    if (!response.ok) {
      console.error("[side-cart-upsells] WordPress returned non-OK", {
        status: response.status,
      })
      return NextResponse.json(
        {
          ok: false,
          error: "Kunne ikke hente tilbehørsforslag fra WordPress.",
        },
        { status: 502 }
      )
    }

    const upsells = extractUpsells(json)
    setCachedSideCartUpsells(cacheKey, upsells)
    return NextResponse.json({
      ok: true,
      upsells,
    } satisfies SideCartUpsellsApiResponse)
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("[side-cart-upsells] WordPress request timed out")
      return NextResponse.json(
        {
          ok: false,
          error: "Forespørselen mot WordPress tok for lang tid.",
        } satisfies SideCartUpsellsApiResponse,
        { status: 504 }
      )
    }

    console.error("[side-cart-upsells] Unexpected error", error)
    return NextResponse.json(
      {
        ok: false,
        error: "Uventet feil ved henting av tilbehørsforslag.",
      } satisfies SideCartUpsellsApiResponse,
      { status: 500 }
    )
  } finally {
    clearTimeout(timeoutId)
  }
}
