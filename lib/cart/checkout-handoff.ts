/**
 * Checkout handoff markers + order-complete cart clear signals.
 *
 * Intentional product behavior:
 * - Abandon / browser Back from Woo checkout keeps the Next.js cart.
 * - Do NOT clear local cart on pagehide/pageshow after handoff (empty flash +
 *   lost cart on Back are worse than a lingering cart after a completed order).
 *
 * Order-complete clear (zero handoff latency):
 * - WP thank-you (`/checkout/order-received/…`) sets cookie `pb_order_complete`
 *   via snippet `wordpress-pb-order-complete-signal.php` (not cart-sync).
 * - On next Next.js mount, CartProvider reads that cookie (or `?order_received=1`)
 *   and clears the local cart — no Woo round-trips, no work before location.assign.
 */

/** sessionStorage key set just before navigating to Woo checkout handoff. */
export const CHECKOUT_HANDOFF_STORAGE_KEY = "pb-checkout-handoff"

/** Cookie set on Woo order-received (same domain) for Next to clear local cart. */
export const ORDER_COMPLETE_COOKIE_NAME = "pb_order_complete"

/** Query param alternative / manual test: `?order_received=1`. */
export const ORDER_RECEIVED_QUERY_PARAM = "order_received"

/** Discard stale flags (e.g. abandoned tab) after this TTL. */
const CHECKOUT_HANDOFF_TTL_MS = 10 * 60 * 1000

/** Mark that checkout handoff started (local only; used by future order-complete clear). */
export function markCheckoutHandoff(): void {
  try {
    window.sessionStorage.setItem(
      CHECKOUT_HANDOFF_STORAGE_KEY,
      String(Date.now())
    )
  } catch {
    // Private mode / quota — handoff still proceeds.
  }
}

export function hasCheckoutHandoffFlag(): boolean {
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_HANDOFF_STORAGE_KEY)
    if (raw === null) return false
    const ts = Number(raw)
    if (!Number.isFinite(ts)) return true
    return Date.now() - ts <= CHECKOUT_HANDOFF_TTL_MS
  } catch {
    return false
  }
}

/** Returns true if a valid handoff flag was present (and removes it). */
export function consumeCheckoutHandoffFlag(): boolean {
  if (!hasCheckoutHandoffFlag()) {
    try {
      window.sessionStorage.removeItem(CHECKOUT_HANDOFF_STORAGE_KEY)
    } catch {
      // ignore
    }
    return false
  }
  try {
    window.sessionStorage.removeItem(CHECKOUT_HANDOFF_STORAGE_KEY)
  } catch {
    // ignore
  }
  return true
}

function readCookie(name: string): string | null {
  try {
    const parts = document.cookie.split("; ")
    for (const part of parts) {
      const eq = part.indexOf("=")
      if (eq === -1) continue
      if (part.slice(0, eq) === name) {
        return decodeURIComponent(part.slice(eq + 1))
      }
    }
  } catch {
    // ignore
  }
  return null
}

function clearOrderCompleteCookie(): void {
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : ""
    document.cookie = `${ORDER_COMPLETE_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`
  } catch {
    // ignore
  }
}

function hasOrderReceivedQueryParam(): boolean {
  try {
    return (
      new URLSearchParams(window.location.search).get(
        ORDER_RECEIVED_QUERY_PARAM
      ) === "1"
    )
  } catch {
    return false
  }
}

function stripOrderReceivedQueryParam(): void {
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has(ORDER_RECEIVED_QUERY_PARAM)) return
    url.searchParams.delete(ORDER_RECEIVED_QUERY_PARAM)
    const next = `${url.pathname}${url.search}${url.hash}`
    window.history.replaceState(window.history.state, "", next)
  } catch {
    // ignore
  }
}

/**
 * True when Woo thank-you (or a test query) signaled a completed order.
 * Does not clear signals — call {@link consumeOrderCompleteSignal} after cart clear.
 */
export function hasOrderCompleteSignal(): boolean {
  if (hasOrderReceivedQueryParam()) return true
  const cookie = readCookie(ORDER_COMPLETE_COOKIE_NAME)
  return cookie !== null && cookie !== ""
}

/**
 * Clears order-complete cookie / query and the handoff session flag.
 * Returns true if an order-complete signal was present.
 */
export function consumeOrderCompleteSignal(): boolean {
  const hadSignal = hasOrderCompleteSignal()
  if (!hadSignal) return false
  clearOrderCompleteCookie()
  stripOrderReceivedQueryParam()
  consumeCheckoutHandoffFlag()
  return true
}
