# Headless cart → WooCommerce checkout (cart-sync)

The Next.js storefront redirects checkout to WordPress `GET /wp-json/pb/v1/cart-sync` with query parameters `items` (JSON array of `{ "productId", "quantity" }`) and `redirect=1`. Implementation lives in [`wordpress-pb-side-cart-order-bumps.php`](../snippets/wordpress-pb-side-cart-order-bumps.php) alongside the side-cart order bumps API.

Order bump offer prices are persisted using cart item data key `pb_cfw_bump_unit_sale` and `woocommerce_before_calculate_totals`, so CheckoutWC checkout line totals match the headless “Anbefalt tilbehør” prices. When no bump unit sale prices apply, cart-sync does a **single** empty/add/totals pass (faster).

**Warm sync (no redirect):** `GET …/cart-sync?items=…` without `redirect=1` returns `{ "ok": true }` and sets Woo session cookies. The storefront may call this from the browser (`credentials: "include"`) after cart changes — best-effort only. Checkout CTA still always does the full handoff (`POST /api/cart/checkout` → cart-sync with `redirect=1`).

**Do not** use `POST /side-cart-order-bumps` (or upsells) to warm the shopper cart — that path empties the temporary Woo cart. **Do not** dual-enable legacy `wordpress-pb-headless-cart-sync.php` (snippet 54) alongside this snippet.

**Deploy:** Code Snippets API only (live ID **64**). Never mu-plugins for this PB snippet. Versions / inventory: [SNIPPETS.md](../SNIPPETS.md).

**After order (not on handoff):** Snippet `wordpress-pb-order-complete-signal.php` sets cookie `pb_order_complete` on `/checkout/order-received/` so Next can clear its local cart on the next storefront load. Do not fold that into cart-sync.

**Optional:** Define `PB_CART_SYNC_SECRET` in `wp-config.php` and pass `&secret=...` on the sync URL (Next does not send this by default).

## Measure: cold vs warm

Use the same browser session and the same `items` JSON.

1. **Warm then checkout**
   - `GET /wp-json/pb/v1/cart-sync?items=[{"productId":123,"quantity":1}]` (no `redirect`) with cookies — note `X-PB-Cart-Sync-Ms` and Network timing.
   - Then open `/checkout/` (or run the storefront CTA). Compare TTFB / total for `/checkout/`.
2. **Cold (authoritative CTA path)**
   - Fresh session (or clear Woo cookies), use storefront **Fortsett til kassen** → `POST /api/cart/checkout` → cart-sync `redirect=1` → `/checkout/`.
   - Note cart-sync `X-PB-Cart-Sync-Ms` (302 response) plus `/checkout/` TTFB.

`X-PB-Cart-Sync-Ms` is a lightweight server-side duration for the cart-sync handler only (not full checkout render). Safe for debugging; ignore if absent on older snippet versions.
