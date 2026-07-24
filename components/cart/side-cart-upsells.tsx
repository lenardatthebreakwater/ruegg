"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import type {
  SideCartUpsellItem,
  SideCartUpsellsStatus,
} from "@/lib/cart/side-cart-upsells-types"
import type { Product } from "@/lib/types/product"
import { buildProductHref } from "@/lib/products/paths"
import { formatCardPrice } from "@/lib/products/format-card-price"
import { cn } from "@/lib/utils"

/** Matches WPGraphQL ContentNode global ids (`post:${databaseId}` → base64). */
function sideCartUpsellToProduct(item: SideCartUpsellItem): Product {
  return {
    id: btoa(`post:${item.databaseId}`),
    name: item.name,
    slug: item.slug,
    price: item.price,
    priceNumeric: item.priceNumeric,
    regularPrice: item.regularPrice,
    onSale: item.onSale,
    image: item.imageUrl
      ? { sourceUrl: item.imageUrl, altText: item.imageAlt || undefined }
      : null,
  }
}

type SideCartUpsellsProps = {
  upsells: SideCartUpsellItem[]
  status: SideCartUpsellsStatus
  disabled: boolean
  onCloseSheet: () => void
  onAddProduct: (product: Product, quantity?: number) => void
}

export function SideCartUpsells({
  upsells,
  status,
  disabled,
  onCloseSheet,
  onAddProduct,
}: SideCartUpsellsProps) {
  // Fail silently: never surface WordPress/proxy errors to the shopper.
  const showSkeleton = status === "loading" && upsells.length === 0
  const showSection = showSkeleton || upsells.length > 0

  if (!showSection) {
    return null
  }

  function handleAdd(item: SideCartUpsellItem) {
    onAddProduct(sideCartUpsellToProduct(item), 1)
  }

  return (
    <div className="border-t border-border px-6 py-4">
      <h3 className="mb-3 text-sm font-semibold">Anbefalt tilbehør</h3>

      {showSkeleton && (
        <div className="space-y-3" aria-busy="true">
          <p className="text-sm text-muted-foreground">Henter forslag…</p>
          <div className="h-16 animate-pulse rounded-md bg-muted" />
          <div className="h-16 animate-pulse rounded-md bg-muted" />
        </div>
      )}

      {upsells.length > 0 && (
        <ul className="flex flex-col gap-3">
          {upsells.map((item) => {
            return (
              <li key={`${item.databaseId}-${item.slug}`}>
                <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-white p-2.5 text-neutral-900 shadow-sm sm:flex-row sm:items-center sm:gap-3 sm:p-3 dark:bg-card dark:text-card-foreground">
                  <div className="flex min-w-0 flex-1 flex-row items-start gap-2.5 sm:items-center sm:gap-3">
                    <Link
                      href={buildProductHref(item.slug)}
                      className="relative size-16 shrink-0 self-start overflow-hidden rounded-md border border-border bg-muted sm:size-24"
                      onClick={() => onCloseSheet()}
                    >
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote Woo thumbs; plain img like product cards
                        <img
                          src={item.imageUrl}
                          alt={item.imageAlt || item.name}
                          className="absolute inset-0 size-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-start gap-1 sm:justify-center">
                      <Link
                        href={buildProductHref(item.slug)}
                        className="line-clamp-2 text-sm font-medium leading-tight hover:underline"
                        onClick={() => onCloseSheet()}
                      >
                        {item.name}
                      </Link>
                      <div className="mt-0.5 flex flex-wrap items-baseline gap-2 sm:mt-1">
                        <span className="text-sm font-semibold sm:text-base">
                          {formatCardPrice(item.price)}
                        </span>
                        {item.onSale && item.regularPrice ? (
                          <span className="text-xs text-neutral-500 line-through dark:text-muted-foreground sm:text-sm">
                            {formatCardPrice(item.regularPrice)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full shrink-0 items-stretch max-sm:mt-0 sm:ml-auto sm:w-auto sm:items-center">
                    <Button
                      type="button"
                      size="sm"
                      className={cn("w-full sm:w-auto")}
                      disabled={disabled}
                      onClick={() => handleAdd(item)}
                    >
                      Legg til
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

    </div>
  )
}
