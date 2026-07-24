/**
 * Side cart upsell payload (WordPress pb/v1 + Next proxy).
 */
export type SideCartUpsellsStatus = "idle" | "loading" | "success"

export type SideCartUpsellItem = {
  databaseId: number
  slug: string
  name: string
  price: string
  priceNumeric: number
  regularPrice: string | null
  onSale: boolean
  imageUrl: string
  imageAlt: string
}

export type SideCartUpsellsApiResponse = {
  ok: boolean
  upsells?: SideCartUpsellItem[]
  error?: string
}

export type SideCartUpsellsRequestBody = {
  items: Array<{ productId: number; quantity: number }>
}
