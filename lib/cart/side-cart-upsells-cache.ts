import type { SideCartUpsellItem } from "@/lib/cart/side-cart-upsells-types"

/**
 * In-memory TTL cache for side-cart order bumps, keyed by cart signature.
 *
 * Limitation (Cloudflare Workers / OpenNext): each isolate has its own Map, so
 * hits are per-isolate rather than globally shared. Still removes most repeated
 * WordPress round-trips within a warm isolate (same cart composition).
 */

const DEFAULT_TTL_MS = 10 * 60 * 1000
const MAX_KEYS = 500

type CacheEntry = {
  upsells: SideCartUpsellItem[]
  expiresAt: number
}

const store = new Map<string, CacheEntry>()

export function buildSideCartUpsellsCacheKey(
  items: Array<{ productId: number; quantity: number }>
): string {
  const normalized = [...items]
    .map((row) => ({
      productId: Math.trunc(row.productId),
      quantity: Math.max(1, Math.trunc(row.quantity)),
    }))
    .filter((row) => Number.isFinite(row.productId) && row.productId > 0)
    .sort((a, b) => a.productId - b.productId)
  return JSON.stringify(normalized)
}

function evictIfNeeded(): void {
  if (store.size < MAX_KEYS) return
  const firstKey = store.keys().next().value
  if (firstKey !== undefined) store.delete(firstKey)
}

export function getCachedSideCartUpsells(
  cacheKey: string
): SideCartUpsellItem[] | null {
  const entry = store.get(cacheKey)
  if (!entry) return null
  if (Date.now() >= entry.expiresAt) {
    store.delete(cacheKey)
    return null
  }
  return entry.upsells
}

export function setCachedSideCartUpsells(
  cacheKey: string,
  upsells: SideCartUpsellItem[],
  ttlMs = DEFAULT_TTL_MS
): void {
  evictIfNeeded()
  store.set(cacheKey, {
    upsells,
    expiresAt: Date.now() + ttlMs,
  })
}
