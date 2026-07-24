# WordPress snippets — inventory & deploy

Source of truth for snippet **versions** lives in this repo under `docs/wordpress/snippets/`.

**Hard convention (this project):**

- **Always** deploy via the **Code Snippets** plugin (never mu-plugins for these PB snippets).
- **Agent deploys** via the Code Snippets REST API when given permission (`WP_USER` + `WP_APP_PASSWORD` in `.env.local`).
- **Human paste** only if the API/auth is unavailable.

## How to tell if live WP is up to date

1. Open this file (or the snippet header) and note the **repo version**.
2. On production WordPress, verify with the method in the inventory table (health `snippetVersion` when available).
3. If versions differ → agent deploys the repo file via Code Snippets API (steps below), then re-check.

**Critical frontend dependencies**

| Frontend feature | Requires snippet | Min version | Why |
| --- | --- | --- | --- |
| Hide order (`/min-konto/ordrer`) | `wordpress-pb-auth.php` | **1.5.0** | `POST .../orders/{id}/hide` + list skips `_pb_hidden_from_customer` |
| Min peis list (`includeLineItems`) | `wordpress-pb-auth.php` | **1.5.0** | `GET .../orders?status=completed&includeLineItems=1` |
| Order detail timeline (email + SMS notes) | `wordpress-pb-auth.php` | **1.7.0** | `GET .../orders/{id}` → `customerNotes`, `datePaid`, `dateCompleted` |
| Account orders / SSO / addresses | `wordpress-pb-auth.php` | 1.4.0+ | Orders, SSO, addresses, payment methods |
| Checkout cart-sync + side-cart bumps | `wordpress-pb-side-cart-order-bumps.php` | **1.1.0** | Prefer this over legacy `headless-cart-sync`; slim single-pass when no bump sale map |
| Clear Next cart after Woo order | `wordpress-pb-order-complete-signal.php` | **1.0.0** | Sets `pb_order_complete` cookie on order-received (not cart-sync); Next clears localStorage cart on next mount |
| Reservedeler / category / brand archive media + FAQ | `wordpress-pb-term-header-image-graphql.php` | **1.2.0** | `headerImage1` + `archiveBottomBlocks` + `archiveFaq` on `TermNode` |

---

## How to update a snippet on WordPress

**Preferred path: Code Snippets API (agent).** Do not install these as mu-plugins.

### A) Code Snippets API (normal — agent)

1. Auth: Application Password in **`.env.local`** (gitignored):

   ```env
   WP_USER=your-wp-admin-username
   WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
   ```

   Create under WP Admin → Users → Profile → Application Passwords (not the normal login password).

2. Base URL: `https://peisbutikken.no/wp-json/code-snippets/v1`
3. List: `GET .../snippets?per_page=100&page=1` (Basic auth).
4. Upsert: `PUT .../snippets/{id}` with JSON `{ name, code, scope: "global", … }`.
   - Send **body only** (strip leading `<?php` — Code Snippets wraps PHP).
   - Run `php -l` on the repo file before PUT.
5. Activate: `POST .../snippets/{id}/activate` (PUT may leave `active: false` if the previous body had a parse error).
6. Verify live version (health curl or inventory check).

**Known snippet IDs (production):**

| Repo file | Live Code Snippets name | ID |
| --- | --- | --- |
| `wordpress-pb-auth.php` | PB Auth endpoints | **58** |
| `wordpress-pb-shipping-quote.php` | PB Shipping Qoute | 55 |
| `wordpress-pb-side-cart-upsells.php` | PB Side cart upsells | 57 |
| `wordpress-pb-reservedeler-items.php` | PB Reservedeler items endpoint | 59 |
| `wordpress-pb-frontend-revalidate.php` | PB Frontend Revalidate… | 65 |
| `wordpress-pb-wc-ajax-checkout-path.php` | PB Checkout Path Re-write | 66 |
| `wordpress-pb-term-header-image-graphql.php` | PB term header image (GraphQL) – categories + brands | **61** |
| `wordpress-pb-graphql-auth-bridge.php` | PB GraphQL Auth Bridge | 67 |
| `wordpress-pb-graphql-error-log.php` | PB GraphQL Error Log | 69 |
| `wordpress-pb-stock-status-graphql.php` | PB Stock Status GraphQL… | 70 |
| `wordpress-pb-side-cart-order-bumps.php` | PB Side cart order bumps (CheckoutWC / Checkout for WooCommerce) | 64 |
| `wordpress-pb-disable-big-image-scaling.php` | PB disable big-image scaling (-scaled) | **71** |
| `wordpress-pb-order-complete-signal.php` | PB Order complete signal (headless cart clear) | **72** |

If an ID is missing or renamed, list snippets and match by name — do not create a duplicate.

**Retired:** former live ID **56** (`PB Contact Submission endpoint` / Elementor bridge) — deactivated; contact leads now go to Cloudflare D1 + R2 (see `CLOUDFLARE.md`). Do not re-enable.

### B) Manual Code Snippets UI (fallback only)

1. WP Admin → **Snippets** → open the existing PHP snippet (same purpose / title as before).
2. Replace the **entire** snippet body with the contents of the repo file **without** the opening `<?php` tag (keep “Run snippet everywhere” / `global` scope).
3. Save + activate.
4. Verify version, then smoke-test.

### After every deploy

- Bump was already done in the repo (`Version:` + `PB_*_SNIPPET_VERSION` when present).
- Live check must return the **same** semver as the inventory table.
- Do not leave a duplicate Code Snippets row for the same routes — REST conflicts / double hooks.
- Never use mu-plugins for these PB snippets.

### Changelog discipline

When behavior changes in a snippet file:

1. Bump semver (`MAJOR.MINOR.PATCH`) in the file header `Version:` **and** matching `PB_*_SNIPPET_VERSION` constant.
2. Set `Updated: YYYY-MM-DD`.
3. Add a one-line note under `Changelog:` in that file (or a short note in the inventory “Notes” column for tiny docs-only tweaks).
4. Update this inventory table’s **Repo version** column.
5. Deploy via Code Snippets API, then confirm live version.

---

## Inventory

| Snippet file | Purpose | Repo version | Verify live version | Notes |
| --- | --- | --- | --- | --- |
| `wordpress-pb-auth.php` | Headless auth, orders, hide order, addresses, SSO, … | **1.7.0** | `GET /wp-json/pb/v1/auth/health` → `snippetVersion` | **1.7.0:** `customerNotes` includes WC “email sent” notes (+ logger on WC before 10.9). **1.6.0:** customer notes + `datePaid`/`dateCompleted`. **1.5.0:** hide order + `includeLineItems`. Live ID **58**. |
| `wordpress-pb-side-cart-order-bumps.php` | Side-cart CheckoutWC bumps + `cart-sync` | **1.1.0** | `GET /wp-json/pb/v1/side-cart-order-bumps/health` → `snippetVersion` | **1.1.0:** slim cart-sync (skip 2nd replay when no bump sale map); `X-PB-Cart-Sync-Ms`; warm without `redirect`. Live ID **64**. Prefer over legacy cart-sync file. |
| `wordpress-pb-order-complete-signal.php` | Cookie signal after order for Next cart clear | **1.0.0** | Header `Version:` on live Code Snippet; DevTools cookie `pb_order_complete` on `/checkout/order-received/` | **1.0.0:** `template_redirect` sets first-party cookie only (no redirect, no cart-sync). Live ID **72**. |
| `wordpress-pb-side-cart-upsells.php` | Legacy linked-product upsells | 1.0.0 | `GET /wp-json/pb/v1/side-cart-upsells/health` → `snippetVersion` | Superseded for storefront by order-bumps; keep only if still needed elsewhere. |
| `wordpress-pb-headless-cart-sync.php` | Legacy `cart-sync` only | 1.0.0 | No health; see Notes | **Do not deploy alongside** order-bumps. Superseded by `wordpress-pb-side-cart-order-bumps.php`. |
| `wordpress-pb-reservedeler-items.php` | Spare-parts items API | 1.0.0 | `GET /wp-json/pb/v1/reservedeler-items/health` → `snippetVersion` | |
| `wordpress-pb-shipping-quote.php` | Shipping quote API | 1.0.0 | `GET /wp-json/pb/v1/shipping-quote/health` → `snippetVersion` | |
| `wordpress-pb-frontend-revalidate.php` | Product change → Next.js revalidate | 1.0.0 | Header `Version:` on live Code Snippet | No REST health (hook-only). |
| `wordpress-pb-wc-ajax-checkout-path.php` | Move `wc-ajax` under `/checkout/` | 1.0.0 | View source on `/checkout/` → `wc_ajax_url` contains `/checkout/?wc-ajax=` | Also compare live snippet header `Version:`. |
| `wordpress-pb-graphql-auth-bridge.php` | Map PB Bearer → WP user on GraphQL | 1.0.0 | Header `Version:` on live snippet | Needs PB Auth active. |
| `wordpress-pb-graphql-error-log.php` | GraphQL error logging | 1.1.0 | Header `Version:` on live snippet | |
| `wordpress-pb-stock-status-graphql.php` | `AVAILABLE_ON_ORDER` on StockStatusEnum | 1.0.0 | GraphiQL: enum includes `AVAILABLE_ON_ORDER` + header `Version:` | |
| `wordpress-pb-gtin-graphql.php` | GTIN on product GraphQL | 1.0.0 | GraphiQL field + header `Version:` | |
| `wordpress-pb-product-brand-graphql.php` | Product brand GraphQL | 1.0.0 | GraphiQL + header `Version:` | See brand runbook. |
| `wordpress-pb-term-header-image-graphql.php` | Term `headerImage1` + `archiveBottomBlocks` + `archiveFaq` GraphQL | **1.2.0** | GraphiQL on category/brand/attribute term + header `Version:` | Live ID **61**. `TermNode` fields for categories, brands, attribute terms. FAQ from JetEngine `archive-faq` (`arch_q` / `arch_a`). |
| `wordpress-pb-disable-big-image-scaling.php` | Disable WP `-scaled` big-image threshold | **1.0.0** | Header `Version:` on live snippet | Live ID **71**. New uploads keep original size; existing `-scaled` files unchanged. |
| `wordpress-pb-lokalmontering-post-fields.php` | **Deprecated** — empty stub | 1.1.0 (deprecated) | Should **not** be active | Disable/remove on WP. JetEngine REST replaces it. |

### Quick health checks (REST snippets)

```bash
# Expect snippetVersion to match the table above
curl -sS "https://peisbutikken.no/wp-json/pb/v1/auth/health" | jq .snippetVersion
# → "1.7.0"

curl -sS "https://peisbutikken.no/wp-json/pb/v1/side-cart-order-bumps/health" | jq .snippetVersion
curl -sS "https://peisbutikken.no/wp-json/pb/v1/reservedeler-items/health" | jq .snippetVersion
curl -sS "https://peisbutikken.no/wp-json/pb/v1/shipping-quote/health" | jq .snippetVersion
curl -sS "https://peisbutikken.no/wp-json/pb/v1/side-cart-upsells/health" | jq .snippetVersion
```

### Snippets without a live health API

Hook / GraphQL-only snippets do not expose `snippetVersion` over HTTP (by design — avoids extra REST surface). Confirm by:

1. Reading `Version: X.Y.Z` / `PB_*_SNIPPET_VERSION` in the live Code Snippets body (API GET or WP Admin), **or**
2. Using the functional check in the inventory (GraphiQL field, `wc_ajax_url`, etc.).

---

## Related runbooks

- [Auth login/signup](./runbooks/auth-login-signup-runbook.md)
- [Cart sync / headless checkout](./runbooks/cart-sync-headless-checkout.md)
- [Product brand GraphQL](./runbooks/product-brand-graphql-runbook.md)
