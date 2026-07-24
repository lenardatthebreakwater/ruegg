# Ruegg frontend fork — starter runbook

Actionable checklist for cloning `peisbutikken-frontend` into a Ruegg catalog/lead-gen storefront. Companion canvas: `ruegg-fork-starter.canvas.tsx` (Cursor canvases folder).

**Default strategy:** A = catalog + lead-gen (matches live ruegg.no). Strategy B = add cart/checkout later.

Do **not** deploy Code Snippets until ruegg WP credentials are in `.env.local`. Do **not** reuse peisbutikken Application Passwords.

### Status (2026-07-24)

Phase 2 copy done. Phase 1 WP plugins + Phase 3 fill `WP_*` still human. Next message: `env ready, deploy snippets`.

| Phase | Status | Notes |
| --- | --- | --- |
| **0** Decision | Done | Strategy A approved |
| **1** WordPress admin | **Blocked — human** | Needs ruegg.no WP: WPGraphQL, WooGraphQL, Code Snippets + Application Password |
| **2** Copy project | **Done** | Full robocopy succeeded; polish (package name, `.env.local`, SEO fallback, layout title) applied |
| **3** Minimal `.env.local` | Partial | Ruegg GraphQL/site URLs set; `WP_USER` / `WP_APP_PASSWORD` still empty |
| **4** Snippet deploy | Waiting | Say `env ready, deploy snippets` after Phase 1 + WP_* filled |
| **5–6** Smoke / strip | Later | After GraphQL + snippets |

---

## Phase 0 — Decision

| Strategy | Scope |
| --- | --- |
| **A (default)** | WPGraphQL product catalog + contact/leads. Deploy GraphQL enrichment snippets only. |
| **B (later)** | Add auth, cart-sync, shipping, checkout path snippets. |

---

## Phase 1 — WordPress admin (manual)

On **ruegg.no** WP Admin:

1. Install + activate **WPGraphQL**
2. Install + activate **WooGraphQL** (WPGraphQL for WooCommerce)
3. Install + activate **Code Snippets**
4. Users → Profile → **Application Passwords** → create one (for agent deploy)
5. Open GraphiQL → confirm products query returns data

---

## Phase 2 — Copy project (Windows)

Sibling folder is created next to this repo. Excludes `node_modules`, build caches, and peisbutikken `.env.local`.

```powershell
robocopy "c:\Users\markd\Desktop\Workspace\Freelance Projects\peisbutikken-frontend" "c:\Users\markd\Desktop\Workspace\Freelance Projects\ruegg-frontend" /E /XD node_modules .next .open-next out /XF .env.local

cd "c:\Users\markd\Desktop\Workspace\Freelance Projects\ruegg-frontend"
Copy-Item .env.example .env.local
npm install
```

`robocopy` exit codes **0–7** mean success.

---

## Phase 3 — Minimal `.env.local`

Copy key **names** from `.env.example`. Never invent secrets. Set ruegg URLs:

| Key | Notes |
| --- | --- |
| `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` | Required — e.g. `https://ruegg.no/graphql` |
| `NEXT_PUBLIC_WORDPRESS_SITE_URL` | Recommended — `https://ruegg.no` |
| `NEXT_PUBLIC_SITE_URL` | Recommended — canonical storefront (e.g. `https://www.ruegg.no`) |
| `WP_USER` | Ruegg WP admin username |
| `WP_APP_PASSWORD` | Ruegg Application Password |
| `EMAIL` / `LICENSE_KEY` | Only if using shadcn premium registries |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Dummy values from `.env.example` OK for local `next dev` |

If peisbutikken `.env.local` already exists: reuse structure/dummies only. **Replace** all `WP_*` and every URL that points at peisbutikken.no. Never paste app passwords into chat.

Optional later: contact/R2/GTM/revalidate secrets — not required for first product-list smoke.

---

## Phase 4 — Snippet deploy order

Repo source: `docs/wordpress/snippets/`. Inventory: `docs/wordpress/SNIPPETS.md`.

**API base (ruegg):** `https://ruegg.no/wp-json/code-snippets/v1`

Peisbutikken live IDs (**58**, **64**, **67**, **72**, etc.) do **not** apply on a fresh ruegg WP. `GET /snippets?per_page=100`, match by **name**, or create new.

### Strategy A — minimal (catalog)

Deploy in this order:

1. `wordpress-pb-graphql-error-log.php` — PB GraphQL Error Log
2. `wordpress-pb-stock-status-graphql.php` — PB Stock Status GraphQL…
3. `wordpress-pb-gtin-graphql.php` — GTIN on product GraphQL
4. `wordpress-pb-product-brand-graphql.php` — Product brand GraphQL
5. `wordpress-pb-term-header-image-graphql.php` — Term header / archive blocks
6. `wordpress-pb-disable-big-image-scaling.php` — Disable `-scaled` uploads
7. `wordpress-pb-frontend-revalidate.php` — After Next URL + `PRODUCT_REVALIDATE_SECRET` exist

### Strategy B — extras (cart / checkout)

After Strategy A, and only when boss wants checkout:

8. `wordpress-pb-auth.php` — PB Auth endpoints
9. `wordpress-pb-graphql-auth-bridge.php` — PB GraphQL Auth Bridge (needs auth)
10. `wordpress-pb-side-cart-order-bumps.php` — cart-sync + bumps
11. `wordpress-pb-order-complete-signal.php` — headless cart clear signal
12. `wordpress-pb-shipping-quote.php` — Shipping quote API
13. `wordpress-pb-wc-ajax-checkout-path.php` — Checkout path rewrite
14. `wordpress-pb-reservedeler-items.php` — only if spare-parts UI is kept

### Do not deploy

| File | Why |
| --- | --- |
| `wordpress-pb-headless-cart-sync.php` | Conflicts with order-bumps |
| `wordpress-pb-side-cart-upsells.php` | Superseded by order-bumps |
| `wordpress-pb-lokalmontering-post-fields.php` | Deprecated stub |

Agent deploy rules: strip leading `<?php`, `php -l` before PUT, preserve name/scope/priority, confirm `active: true`.

---

## Phase 5 — Smoke test

**GraphiQL:**

```graphql
{
  products(first: 5) {
    nodes {
      databaseId
      name
      slug
    }
  }
}
```

**Next (in `ruegg-frontend`):**

```powershell
npm run dev
```

Open the shop / product list. Products should load from `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL`.

---

## Phase 6 — Strip after data works

Only after Phase 5 passes:

- Multi-brand / campaign hubs (`app/(populaere-sok-hubs)/`, black-friday, aduro/nordpeis)
- Brand chrome (logos, `#bb0013`, peisbutikken.no fallbacks)
- Service / install hubs (montering, etc.)
- Spare parts / Min peis (if Strategy A)
- Legacy RankMath redirects
- `public/images/**` peisbutikken logos
- Cloudflare Worker / R2 / D1 names → ruegg-*, not peisbutikken-*

---

## Next message (after Phases 1–3)

When plugins are installed, `ruegg-frontend` exists, and ruegg `.env.local` has GraphQL URL + `WP_USER` / `WP_APP_PASSWORD`, send:

```text
env ready, deploy snippets
```

Optional: add `Strategy A only` or `include Strategy B`.
