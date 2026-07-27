function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "")
}

function normalizePath(path: string): string {
  if (!path) return "/"
  return path.startsWith("/") ? path : `/${path}`
}

function getBaseUrlFromGraphqlUrl(graphqlUrl: string): string {
  const normalized = normalizeBaseUrl(graphqlUrl)
  if (normalized.endsWith("/graphql")) {
    return normalized.slice(0, -"/graphql".length)
  }
  return normalized
}

function coerceHttpBaseUrl(value: string): string | null {
  let url = value.trim().replace(/^['"]|['"]$/g, "")
  if (!url) return null
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url.replace(/^\/\//, "")}`
  }
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
    return normalizeBaseUrl(parsed.origin + parsed.pathname.replace(/\/+$/, ""))
  } catch {
    return null
  }
}

export function getWordpressSiteUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL
  if (explicit) {
    const coerced = coerceHttpBaseUrl(explicit)
    if (coerced) return coerced
  }

  const graphqlUrl = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL
  if (!graphqlUrl) return null
  const coercedGraphql = coerceHttpBaseUrl(graphqlUrl)
  if (!coercedGraphql) return null
  return getBaseUrlFromGraphqlUrl(coercedGraphql)
}

export function getWordpressCheckoutUrl(): string | null {
  const baseUrl = getWordpressSiteUrl()
  if (!baseUrl) return null

  const checkoutPath = normalizePath(
    process.env.NEXT_PUBLIC_WORDPRESS_CHECKOUT_PATH ?? "/checkout/"
  )
  return `${baseUrl}${checkoutPath}`
}

export function getWordpressCartSyncUrl(): string | null {
  const baseUrl = getWordpressSiteUrl()
  if (!baseUrl) return null

  const syncPath = normalizePath(
    process.env.NEXT_PUBLIC_WORDPRESS_CART_SYNC_PATH ?? "/wp-json/pb/v1/cart-sync"
  )
  return `${baseUrl}${syncPath}`
}

export function getWordpressShippingQuoteUrl(): string | null {
  const baseUrl = getWordpressSiteUrl()
  if (!baseUrl) return null

  const quotePath = normalizePath(
    process.env.WORDPRESS_SHIPPING_QUOTE_PATH ?? "/wp-json/pb/v1/shipping-quote"
  )
  return `${baseUrl}${quotePath}`
}

function getWordpressAuthUrl(
  envVarName: keyof NodeJS.ProcessEnv,
  fallbackPath: string
): string | null {
  const baseUrl = getWordpressSiteUrl()
  if (!baseUrl) return null

  const path = normalizePath(process.env[envVarName] ?? fallbackPath)
  return `${baseUrl}${path}`
}

export function getWordpressAuthLoginUrl(): string | null {
  return getWordpressAuthUrl(
    "WORDPRESS_AUTH_LOGIN_PATH",
    "/wp-json/pb/v1/auth/login"
  )
}

export function getWordpressAuthSignupUrl(): string | null {
  return getWordpressAuthUrl(
    "WORDPRESS_AUTH_SIGNUP_PATH",
    "/wp-json/pb/v1/auth/signup"
  )
}

export function getWordpressAuthMeUrl(): string | null {
  return getWordpressAuthUrl(
    "WORDPRESS_AUTH_ME_PATH",
    "/wp-json/pb/v1/auth/me"
  )
}

export function getWordpressAuthLogoutUrl(): string | null {
  return getWordpressAuthUrl(
    "WORDPRESS_AUTH_LOGOUT_PATH",
    "/wp-json/pb/v1/auth/logout"
  )
}

export function getWordpressAuthPasswordRequestUrl(): string | null {
  return getWordpressAuthUrl(
    "WORDPRESS_AUTH_PASSWORD_REQUEST_PATH",
    "/wp-json/pb/v1/auth/password/request-reset"
  )
}

export function getWordpressAuthPasswordResetUrl(): string | null {
  return getWordpressAuthUrl(
    "WORDPRESS_AUTH_PASSWORD_RESET_PATH",
    "/wp-json/pb/v1/auth/password/reset"
  )
}

export function getWordpressAuthPasswordChangeUrl(): string | null {
  return getWordpressAuthUrl(
    "WORDPRESS_AUTH_PASSWORD_CHANGE_PATH",
    "/wp-json/pb/v1/auth/password/change"
  )
}

export function getWordpressAuthOrdersUrl(): string | null {
  return getWordpressAuthUrl(
    "WORDPRESS_AUTH_ORDERS_PATH",
    "/wp-json/pb/v1/auth/orders"
  )
}

export function getWordpressAuthAddressesUrl(): string | null {
  return getWordpressAuthUrl(
    "WORDPRESS_AUTH_ADDRESSES_PATH",
    "/wp-json/pb/v1/auth/addresses"
  )
}

export function getWordpressAuthPaymentMethodsUrl(): string | null {
  return getWordpressAuthUrl(
    "WORDPRESS_AUTH_PAYMENT_METHODS_PATH",
    "/wp-json/pb/v1/auth/payment-methods"
  )
}

export function getWordpressAuthPaymentMethodByIdUrl(
  methodId: number
): string | null {
  const base = getWordpressAuthPaymentMethodsUrl()
  if (!base || !Number.isFinite(methodId) || methodId <= 0) return null
  return `${normalizeBaseUrl(base)}/${Math.trunc(methodId)}`
}

export function getWordpressAuthPaymentMethodDefaultUrl(
  methodId: number
): string | null {
  const byId = getWordpressAuthPaymentMethodByIdUrl(methodId)
  if (!byId) return null
  return `${byId}/default`
}

export function getWordpressAuthSsoCodeUrl(): string | null {
  return getWordpressAuthUrl(
    "WORDPRESS_AUTH_SSO_CODE_PATH",
    "/wp-json/pb/v1/auth/sso-code"
  )
}

export function getWordpressAuthOrderByIdUrl(orderId: number): string | null {
  const base = getWordpressAuthOrdersUrl()
  if (!base || !Number.isFinite(orderId) || orderId <= 0) return null
  return `${normalizeBaseUrl(base)}/${Math.trunc(orderId)}`
}

export function getWordpressAuthOrderHideUrl(orderId: number): string | null {
  const byId = getWordpressAuthOrderByIdUrl(orderId)
  if (!byId) return null
  return `${byId}/hide`
}

export function getWordpressSideCartUpsellsUrl(): string | null {
  const baseUrl = getWordpressSiteUrl()
  if (!baseUrl) return null

  const path = normalizePath(
    process.env.WORDPRESS_SIDE_CART_UPSELLS_PATH ??
      "/wp-json/pb/v1/side-cart-order-bumps"
  )
  return `${baseUrl}${path}`
}

export function getWordpressReservedelerItemsUrl(): string | null {
  const baseUrl = getWordpressSiteUrl()
  if (!baseUrl) return null

  const path = normalizePath(
    process.env.WORDPRESS_RESERVEDELER_ITEMS_PATH ??
      "/wp-json/pb/v1/reservedeler-items"
  )
  return `${baseUrl}${path}`
}

/**
 * Build cart-sync URL. Pass `redirect: true` for checkout handoff (302 → /checkout/).
 * Omit redirect for best-effort warm sync (`{ ok: true }` + Woo session cookies).
 */
export function buildCartSyncUrl(
  cartSyncUrl: string,
  items: Array<{ productId: number; quantity: number }>,
  options?: { redirect?: boolean }
): string {
  const next = new URL(cartSyncUrl)
  next.searchParams.set("items", JSON.stringify(items))
  if (options?.redirect) {
    next.searchParams.set("redirect", "1")
  }
  return next.toString()
}

export function buildCartSyncRedirectUrl(
  cartSyncUrl: string,
  items: Array<{ productId: number; quantity: number }>
): string {
  return buildCartSyncUrl(cartSyncUrl, items, { redirect: true })
}

export function withAddToCartParams(
  url: string,
  productId: number,
  quantity: number
): string {
  const next = new URL(url)
  next.searchParams.set("add-to-cart", String(productId))
  next.searchParams.set("quantity", String(Math.max(1, quantity)))
  return next.toString()
}
