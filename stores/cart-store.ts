"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { decodeRelayDatabaseId } from "@/lib/graphql/relay-id"
import type { Product } from "@/lib/types/product"

export type CartItem = {
  id: string
  databaseId: number | null
  slug: string
  name: string
  image: { sourceUrl: string; altText?: string } | null
  unitPrice: string
  unitPriceNumeric: number
  quantity: number
}

type CartStore = {
  items: CartItem[]
  addProduct: (product: Product, quantity?: number) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
}

function parsePriceNumeric(price: string): number {
  const cleaned = price.replace(/&nbsp;/g, " ").replace(/[^\d,.\s]/g, "").trim()
  if (!cleaned) return 0

  const compact = cleaned.replace(/\s/g, "")
  const hasComma = compact.includes(",")
  const hasDot = compact.includes(".")

  if (hasComma && hasDot) {
    return Number.parseFloat(compact.replace(/\./g, "").replace(",", ".")) || 0
  }

  if (hasComma) {
    return Number.parseFloat(compact.replace(",", ".")) || 0
  }

  return Number.parseFloat(compact) || 0
}

export function formatNok(value: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPriceNumeric * item.quantity, 0)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addProduct: (product, quantity = 1) =>
        set((state) => {
          const safeQty = Math.max(1, quantity)
          const existing = state.items.find((item) => item.id === product.id)
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + safeQty }
                  : item
              ),
            }
          }

          const unitPriceNumeric =
            typeof product.priceNumeric === "number"
              ? product.priceNumeric
              : parsePriceNumeric(product.price)

          return {
            items: [
              ...state.items,
              {
                id: product.id,
                databaseId: decodeRelayDatabaseId(product.id),
                slug: product.slug,
                name: product.name,
                image: product.image ?? null,
                unitPrice: product.price,
                unitPriceNumeric,
                quantity: safeQty,
              },
            ],
          }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.id !== id)
              : state.items.map((item) =>
                  item.id === id ? { ...item, quantity } : item
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "pb-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
