"use client"

import Link from "next/link"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { CartPaymentMethods } from "@/components/cart/cart-payment-methods"
import { SideCartUpsells } from "@/components/cart/side-cart-upsells"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type {
  SideCartUpsellItem,
  SideCartUpsellsStatus,
} from "@/lib/cart/side-cart-upsells-types"
import { buildProductHref } from "@/lib/products/paths"
import type { Product } from "@/lib/types/product"
import { cn } from "@/lib/utils"
import type { CartItem } from "@/stores/cart-store"

type CartSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  highlightedItemId: string | null
  highlightPulse: number
  items: CartItem[]
  subtotal: string
  canCheckout: boolean
  checkoutPending: boolean
  checkoutError: string | null
  upsellItems: SideCartUpsellItem[]
  upsellsStatus: SideCartUpsellsStatus
  onAddProductFromUpsell: (product: Product, quantity?: number) => void
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onRemove: (id: string) => void
  onCheckout: () => void
}

export function CartSheet({
  open,
  onOpenChange,
  highlightedItemId,
  highlightPulse,
  items,
  subtotal,
  canCheckout,
  checkoutPending,
  checkoutError,
  upsellItems,
  upsellsStatus,
  onAddProductFromUpsell,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
}: CartSheetProps) {
  const hasItems = items.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>Handlekurv</SheetTitle>
          <SheetDescription>
            {hasItems
              ? `Du har ${items.length} ${items.length === 1 ? "produkt" : "produkter"} i handlekurven`
              : "Handlekurven din er tom"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {hasItems ? (
            <>
            <ul className="flex flex-col gap-0">
              {items.map((item, index) => (
                <li key={item.id} className="px-6 py-3">
                  <div
                    key={
                      highlightedItemId === item.id
                        ? `${item.id}-${highlightPulse}`
                        : item.id
                    }
                    className={cn(
                      "flex gap-3 rounded-lg px-2 py-1",
                      highlightedItemId === item.id && "animate-cart-item-pop"
                    )}
                  >
                    <Link
                      href={buildProductHref(item.slug)}
                      className="relative size-16 shrink-0 self-start overflow-hidden rounded-md border border-border bg-muted sm:size-24"
                      onClick={() => onOpenChange(false)}
                    >
                      {item.image?.sourceUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote Woo thumbs; plain img like product cards
                        <img
                          src={item.image.sourceUrl}
                          alt={item.image.altText ?? item.name}
                          className="absolute inset-0 size-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={buildProductHref(item.slug)}
                        className="line-clamp-2 text-sm font-medium hover:underline"
                        onClick={() => onOpenChange(false)}
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.unitPrice}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 rounded-md border p-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDecrement(item.id)}
                            disabled={checkoutPending}
                            aria-label={`Reduser antall for ${item.name}`}
                          >
                            <Minus />
                          </Button>
                          <span className="min-w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onIncrement(item.id)}
                            disabled={checkoutPending}
                            aria-label={`Øk antall for ${item.name}`}
                          >
                            <Plus />
                          </Button>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove(item.id)}
                          disabled={checkoutPending}
                        >
                          <Trash2 data-icon="inline-start" />
                          Fjern
                        </Button>
                      </div>
                    </div>
                  </div>
                  {index < items.length - 1 ? (
                    <Separator className="mt-2" />
                  ) : null}
                </li>
              ))}
            </ul>
            <SideCartUpsells
              upsells={upsellItems}
              status={upsellsStatus}
              disabled={checkoutPending}
              onCloseSheet={() => onOpenChange(false)}
              onAddProduct={onAddProductFromUpsell}
            />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <div className="flex size-12 items-center justify-center rounded-full border bg-muted">
                <ShoppingCart />
              </div>
              <p className="text-sm text-muted-foreground">
                Legg til produkter for å se handlekurven her.
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="gap-3 border-t px-6 pt-3 pb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Delsum</span>
            <span className="font-semibold">{subtotal}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Fraktkostnader beregnes i kassen.
          </p>
          {checkoutError ? (
            <p className="text-sm text-red-700" role="alert">
              {checkoutError}
            </p>
          ) : null}
          <Button
            type="button"
            size="lg"
            disabled={!hasItems || !canCheckout || checkoutPending}
            onClick={onCheckout}
          >
            {checkoutPending ? "Sender til kassen..." : "Fortsett til kassen"}
          </Button>
          <CartPaymentMethods className="pt-0.5" />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
