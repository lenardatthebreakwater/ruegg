"use client"

import {
  useCallback,
  createContext,
  useRef,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { decodeRelayDatabaseId } from "@/lib/graphql/relay-id"
import { CartSheet } from "@/components/cart/cart-sheet"
import type {
  SideCartUpsellItem,
  SideCartUpsellsApiResponse,
  SideCartUpsellsStatus,
} from "@/lib/cart/side-cart-upsells-types"
import {
  consumeOrderCompleteSignal,
  hasOrderCompleteSignal,
  markCheckoutHandoff,
} from "@/lib/cart/checkout-handoff"
import { useMountEffect } from "@/lib/hooks/effect-last"
import {
  buildCartSyncUrl,
  getWordpressCartSyncUrl,
  getWordpressCheckoutUrl,
} from "@/lib/wordpress-urls"
import {
  formatNok,
  getCartSubtotal,
  useCartStore,
  type CartItem,
} from "@/stores/cart-store"
import type { Product } from "@/lib/types/product"
import {
  buildGa4ItemFromCartItem,
  buildGa4ItemFromProduct,
  getUnitPriceNumericFromProduct,
} from "@/lib/analytics/ga4-item"
import { pushGa4EcommerceEvent } from "@/lib/analytics/push-ga4-ecommerce-event"

type CartContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  addProduct: (product: Product, quantity?: number) => void
  itemCount: number
}

const CartContext = createContext<CartContextValue>({
  open: false,
  setOpen: () => {},
  addProduct: () => {},
  itemCount: 0,
})

type UpsellCartLine = { productId: number; quantity: number }

/** Debounce for best-effort Woo cart warm (browser → cart-sync, no redirect). */
const WARM_CART_SYNC_DEBOUNCE_MS = 650

function normalizeCartItemsForUpsells(cartItems: CartItem[]): UpsellCartLine[] {
  return cartItems
    .map((item) => {
      const productId = item.databaseId ?? decodeRelayDatabaseId(item.id)
      if (!productId) return null
      return {
        productId,
        quantity: Math.max(1, item.quantity),
      }
    })
    .filter((row): row is UpsellCartLine => row !== null)
    .sort((a, b) => a.productId - b.productId)
}

function upsellCartSignatureFromLines(lines: UpsellCartLine[]): string {
  return JSON.stringify(lines)
}

function useCartItems(): CartItem[] {
  return useCartStore((state) => state.items)
}

export function useCart() {
  return useContext(CartContext)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  /** Defer CartSheet mount until first open — keeps header cart hydration intact. */
  const [sheetMounted, setSheetMounted] = useState(false)
  const [checkoutPending, setCheckoutPending] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)
  const [highlightPulse, setHighlightPulse] = useState(0)
  const highlightTimeoutRef = useRef<number | null>(null)
  const upsellDebounceRef = useRef<number | null>(null)
  const warmSyncDebounceRef = useRef<number | null>(null)
  /** Ignores stale fetch responses when multiple refreshUpsells overlap (open sheet + debounced qty). */
  const upsellRequestIdRef = useRef(0)
  /** Cart signature currently being fetched (dedupes open-sheet + add-to-cart). */
  const upsellInFlightSigRef = useRef<string | null>(null)
  /** Cart snapshot (signature) used for the last successful `/api/cart/upsells` response. */
  const lastSuccessfulUpsellCartSigRef = useRef<string | null>(null)
  const upsellItemsRef = useRef<SideCartUpsellItem[]>([])
  const upsellsStatusRef = useRef<SideCartUpsellsStatus>("idle")
  /** Double-click / in-flight guard (state alone can lag one frame). */
  const checkoutInFlightRef = useRef(false)
  const checkoutPendingRef = useRef(false)
  /** Supersedes out-of-order warm sync responses (signature + monotonic version). */
  const warmSyncVersionRef = useRef(0)
  const lastWarmSyncSigRef = useRef<string | null>(null)
  const [upsellItems, setUpsellItems] = useState<SideCartUpsellItem[]>([])
  const [upsellsStatus, setUpsellsStatus] = useState<SideCartUpsellsStatus>("idle")
  // Keep latest upsell snapshot for async refreshUpsells (stable callback deps).
  useLayoutEffect(() => {
    upsellItemsRef.current = upsellItems
    upsellsStatusRef.current = upsellsStatus
  }, [upsellItems, upsellsStatus])
  const items = useCartItems()
  const addProductToStore = useCartStore((state) => state.addProduct)
  const removeItem = useCartStore((state) => state.removeItem)
  const setQuantity = useCartStore((state) => state.setQuantity)

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )
  const subtotal = useMemo(() => formatNok(getCartSubtotal(items)), [items])

  const checkoutUrl = getWordpressCheckoutUrl()
  const cartSyncUrl = getWordpressCartSyncUrl()

  const clearHighlightTimeout = useCallback(() => {
    if (highlightTimeoutRef.current === null) return
    window.clearTimeout(highlightTimeoutRef.current)
    highlightTimeoutRef.current = null
  }, [])

  // Intentionally no pagehide/pageshow cart clear: Back / abandon from Woo keeps Next cart.
  // After Woo order-received, WP sets pb_order_complete; clear local cart on Next mount only.
  useMountEffect(() => {
    if (!hasOrderCompleteSignal()) return

    const clearLocalCartAfterOrder = () => {
      useCartStore.getState().clear()
      consumeOrderCompleteSignal()
    }

    if (useCartStore.persist.hasHydrated()) {
      clearLocalCartAfterOrder()
      return
    }

    return useCartStore.persist.onFinishHydration(clearLocalCartAfterOrder)
  })

  const refreshUpsells = useCallback(async () => {
    const cartItems = useCartStore.getState().items
    const normalizedItems = normalizeCartItemsForUpsells(cartItems)
    const sig = upsellCartSignatureFromLines(normalizedItems)

    if (normalizedItems.length === 0) {
      upsellRequestIdRef.current += 1
      upsellInFlightSigRef.current = null
      setUpsellItems([])
      setUpsellsStatus("idle")
      lastSuccessfulUpsellCartSigRef.current = upsellCartSignatureFromLines([])
      return
    }

    if (
      upsellsStatusRef.current === "success" &&
      sig === lastSuccessfulUpsellCartSigRef.current
    ) {
      return
    }

    if (upsellInFlightSigRef.current === sig) {
      return
    }

    const requestId = ++upsellRequestIdRef.current
    upsellInFlightSigRef.current = sig

    // Keep previous upsells visible while revalidating; skeleton only when empty.
    if (upsellItemsRef.current.length === 0) {
      setUpsellsStatus("loading")
    }

    try {
      const response = await fetch("/api/cart/upsells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: normalizedItems }),
      })
      const data = (await response.json()) as SideCartUpsellsApiResponse
      if (requestId !== upsellRequestIdRef.current) return
      if (upsellInFlightSigRef.current === sig) {
        upsellInFlightSigRef.current = null
      }
      if (!response.ok || !data.ok) {
        // Fail silently for the shopper: hide section when we have nothing useful.
        setUpsellItems([])
        setUpsellsStatus("idle")
        return
      }
      setUpsellItems(data.upsells ?? [])
      setUpsellsStatus("success")
      lastSuccessfulUpsellCartSigRef.current = sig
    } catch {
      if (requestId !== upsellRequestIdRef.current) return
      if (upsellInFlightSigRef.current === sig) {
        upsellInFlightSigRef.current = null
      }
      setUpsellItems([])
      setUpsellsStatus("idle")
    }
  }, [])

  const scheduleUpsellRefresh = useCallback(() => {
    if (upsellDebounceRef.current !== null) {
      window.clearTimeout(upsellDebounceRef.current)
    }
    upsellDebounceRef.current = window.setTimeout(() => {
      upsellDebounceRef.current = null
      void refreshUpsells()
    }, 220)
  }, [refreshUpsells])

  const cancelWarmCartSync = useCallback(() => {
    if (warmSyncDebounceRef.current !== null) {
      window.clearTimeout(warmSyncDebounceRef.current)
      warmSyncDebounceRef.current = null
    }
    warmSyncVersionRef.current += 1
  }, [])

  const warmCartSync = useCallback(async () => {
    // Never warm during authoritative checkout handoff.
    if (checkoutPendingRef.current || checkoutInFlightRef.current) return
    if (!cartSyncUrl) return

    const cartItems = useCartStore.getState().items
    const normalizedItems = normalizeCartItemsForUpsells(cartItems)
    if (normalizedItems.length === 0) {
      lastWarmSyncSigRef.current = upsellCartSignatureFromLines([])
      return
    }

    const sig = upsellCartSignatureFromLines(normalizedItems)
    if (sig === lastWarmSyncSigRef.current) return

    const version = ++warmSyncVersionRef.current
    const url = buildCartSyncUrl(cartSyncUrl, normalizedItems)

    let ok = false
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        mode: "cors",
        keepalive: true,
      })
      ok = response.ok
    } catch {
      // Best-effort only — checkout CTA remains authoritative.
    }

    if (version !== warmSyncVersionRef.current) return
    if (checkoutPendingRef.current || checkoutInFlightRef.current) return
    if (ok) {
      lastWarmSyncSigRef.current = sig
    }
  }, [cartSyncUrl])

  const scheduleWarmCartSync = useCallback(() => {
    if (checkoutPendingRef.current || checkoutInFlightRef.current) return
    if (warmSyncDebounceRef.current !== null) {
      window.clearTimeout(warmSyncDebounceRef.current)
    }
    warmSyncDebounceRef.current = window.setTimeout(() => {
      warmSyncDebounceRef.current = null
      void warmCartSync()
    }, WARM_CART_SYNC_DEBOUNCE_MS)
  }, [warmCartSync])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) setSheetMounted(true)
      setOpen(nextOpen)
      if (!nextOpen) {
        clearHighlightTimeout()
        setHighlightedItemId(null)
        return
      }
      const lineItems = useCartStore.getState().items
      if (lineItems.length > 0) {
        const subtotal = getCartSubtotal(lineItems)
        pushGa4EcommerceEvent({
          event: "view_cart",
          ecommerce: {
            currency: "NOK",
            value: subtotal,
            items: lineItems.map((item, index) => ({
              ...buildGa4ItemFromCartItem(item),
              index,
            })),
          },
        })
        const sig = upsellCartSignatureFromLines(
          normalizeCartItemsForUpsells(lineItems)
        )
        const upsellsFreshForCart =
          upsellsStatusRef.current === "success" &&
          sig === lastSuccessfulUpsellCartSigRef.current
        if (!upsellsFreshForCart) {
          void refreshUpsells()
        }
      }
    },
    [clearHighlightTimeout, refreshUpsells]
  )

  const addProduct = useCallback(
    (product: Product, quantity = 1) => {
      const shouldWaitForSheetOpen = !open
      const safeQty = Math.max(1, quantity)
      addProductToStore(product, quantity)

      // Start upsell fetch immediately on cart change (do not wait for sheet open).
      void refreshUpsells()
      scheduleWarmCartSync()

      const unit = getUnitPriceNumericFromProduct(product)
      pushGa4EcommerceEvent({
        event: "add_to_cart",
        ecommerce: {
          currency: "NOK",
          value: unit * safeQty,
          items: [buildGa4ItemFromProduct(product, safeQty)],
        },
      })

      setHighlightedItemId(product.id)
      handleOpenChange(true)

      clearHighlightTimeout()

      if (shouldWaitForSheetOpen) {
        highlightTimeoutRef.current = window.setTimeout(() => {
          setHighlightPulse((value) => value + 1)
          highlightTimeoutRef.current = null
        }, 520)
        return
      }

      setHighlightPulse((value) => value + 1)
    },
    [
      addProductToStore,
      clearHighlightTimeout,
      handleOpenChange,
      open,
      refreshUpsells,
      scheduleWarmCartSync,
    ]
  )

  const value = useMemo<CartContextValue>(
    () => ({
      open,
      setOpen: handleOpenChange,
      addProduct,
      itemCount,
    }),
    [addProduct, handleOpenChange, itemCount, open]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
      {sheetMounted ? (
        <CartSheet
          open={open}
          onOpenChange={handleOpenChange}
          highlightedItemId={highlightedItemId}
          highlightPulse={highlightPulse}
          items={items}
          subtotal={subtotal}
          canCheckout={Boolean(checkoutUrl)}
          checkoutPending={checkoutPending}
          checkoutError={checkoutError}
          upsellItems={upsellItems}
          upsellsStatus={upsellsStatus}
          onAddProductFromUpsell={addProduct}
          onIncrement={(id) => {
            const existing = items.find((item) => item.id === id)
            if (!existing) return
            pushGa4EcommerceEvent({
              event: "add_to_cart",
              ecommerce: {
                currency: "NOK",
                value: existing.unitPriceNumeric,
                items: [buildGa4ItemFromCartItem(existing, 1)],
              },
            })
            setQuantity(id, existing.quantity + 1)
            scheduleUpsellRefresh()
            scheduleWarmCartSync()
          }}
          onDecrement={(id) => {
            const existing = items.find((item) => item.id === id)
            if (!existing) return
            pushGa4EcommerceEvent({
              event: "remove_from_cart",
              ecommerce: {
                currency: "NOK",
                value: existing.unitPriceNumeric,
                items: [buildGa4ItemFromCartItem(existing, 1)],
              },
            })
            setQuantity(id, existing.quantity - 1)
            scheduleUpsellRefresh()
            scheduleWarmCartSync()
          }}
          onRemove={(id) => {
            const existing = items.find((item) => item.id === id)
            if (existing) {
              pushGa4EcommerceEvent({
                event: "remove_from_cart",
                ecommerce: {
                  currency: "NOK",
                  value: existing.unitPriceNumeric * existing.quantity,
                  items: [buildGa4ItemFromCartItem(existing)],
                },
              })
            }
            removeItem(id)
            scheduleUpsellRefresh()
            scheduleWarmCartSync()
          }}
          onCheckout={() => {
            void (async () => {
              if (!checkoutUrl) return
              if (checkoutPending || checkoutInFlightRef.current) return

              checkoutInFlightRef.current = true
              checkoutPendingRef.current = true
              setCheckoutError(null)
              cancelWarmCartSync()

              const lineItems = useCartStore.getState().items

              if (lineItems.length > 0) {
                const beginSubtotal = getCartSubtotal(lineItems)
                pushGa4EcommerceEvent({
                  event: "begin_checkout",
                  ecommerce: {
                    currency: "NOK",
                    value: beginSubtotal,
                    items: lineItems.map((item, index) => ({
                      ...buildGa4ItemFromCartItem(item),
                      index,
                    })),
                  },
                })
              }

              const normalizedItems = lineItems
                .map((item) => {
                  const productId = item.databaseId ?? decodeRelayDatabaseId(item.id)
                  if (!productId) return null
                  return {
                    productId,
                    quantity: Math.max(1, item.quantity),
                  }
                })
                .filter(
                  (item): item is { productId: number; quantity: number } =>
                    item !== null
                )

              const resetCheckoutGuard = () => {
                checkoutInFlightRef.current = false
                checkoutPendingRef.current = false
                setCheckoutPending(false)
              }

              if (normalizedItems.length === 0) {
                resetCheckoutGuard()
                setCheckoutError(
                  "Handlekurven mangler gyldige produkter. Oppdater siden og prøv igjen."
                )
                return
              }

              if (normalizedItems.length !== lineItems.length) {
                resetCheckoutGuard()
                setCheckoutError(
                  "Noen produkter i handlekurven kunne ikke synkroniseres. Fjern dem eller åpne produktsiden og legg dem til på nytt."
                )
                return
              }

              if (!cartSyncUrl) {
                resetCheckoutGuard()
                setCheckoutError(
                  "Kassen er ikke tilgjengelig akkurat nå. Prøv igjen om litt."
                )
                return
              }

              setCheckoutPending(true)
              try {
                const response = await fetch("/api/cart/checkout", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "same-origin",
                  body: JSON.stringify({ items: normalizedItems }),
                })
                const data = (await response.json().catch(() => null)) as {
                  ok?: boolean
                  redirectUrl?: string
                  error?: string
                } | null

                if (!response.ok || !data?.ok || !data.redirectUrl) {
                  resetCheckoutGuard()
                  setCheckoutError(
                    data?.error ??
                      "Kunne ikke starte kassen. Prøv igjen om litt."
                  )
                  return
                }

                // Keep lines + "Sender til kassen..." visible (never clearCart before assign).
                // Back from Woo restores this page from bfcache / remount with cart intact.
                markCheckoutHandoff()
                window.location.assign(data.redirectUrl)
              } catch {
                resetCheckoutGuard()
                setCheckoutError(
                  "Kunne ikke starte kassen. Sjekk nettverket og prøv igjen."
                )
              }
            })()
          }}
        />
      ) : null}
    </CartContext.Provider>
  )
}
