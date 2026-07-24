# Revalidate cheat sheet (internal)

Practical guide for on-demand cache invalidation on the Peisbutikken Next.js / OpenNext (Cloudflare Workers) storefront.

Deeper ops: [`CLOUDFLARE.md`](./CLOUDFLARE.md), [`docs/perf/cloudflare-product-cache-runbook.md`](./docs/perf/cloudflare-product-cache-runbook.md).  
WP auto-hook: Code Snippet **65** — [`docs/wordpress/snippets/wordpress-pb-frontend-revalidate.php`](./docs/wordpress/snippets/wordpress-pb-frontend-revalidate.php) (inventory: [`docs/wordpress/SNIPPETS.md`](./docs/wordpress/SNIPPETS.md)).

---

## Mental model

1. Webhooks call `revalidateTag` / `revalidatePath` → cache entries are **marked stale now**.
2. HTML / GraphQL data **regenerates on the next request** (lazy), not inside the `curl` response.
3. Production cache lives in **OpenNext R2 incremental cache + Durable Object tag cache**. Purging a Cloudflare URL alone is **not** enough for tagged Next data.
4. Empty / ambiguous product payloads **must not** purge the global `products` tag — that requires explicit `{ "revalidateAll": true }`.

---

## Secrets

| Where | Name |
| --- | --- |
| Cloudflare Worker secret | `PRODUCT_REVALIDATE_SECRET` |
| Local `.env.local` | `PRODUCT_REVALIDATE_SECRET` |
| WordPress (snippet 65) | `PB_FRONTEND_REVALIDATE_SECRET` (must match Worker) |
| Optional search rebuild | `SEARCH_INDEX_REBUILD_SECRET` (falls back to `PRODUCT_REVALIDATE_SECRET`) |

**Headers (products + path):** `X-Revalidate-Secret` or `X-Webhook-Secret`  
**Headers (search rebuild):** `X-Revalidate-Secret` or `X-Search-Index-Secret`

Never commit or paste real secret values. Use placeholders below.

---

## Endpoints

| Method | Path | Auth | Source |
| --- | --- | --- | --- |
| `POST` | `/api/revalidate/products` | `PRODUCT_REVALIDATE_SECRET` | `app/api/revalidate/products/route.ts` |
| `POST` | `/api/revalidate/path` | same | `app/api/revalidate/path/route.ts` |
| `POST` | `/api/search-index/rebuild` | `SEARCH_INDEX_REBUILD_SECRET` or product secret | `app/api/search-index/rebuild/route.ts` |
| Auto | WP → products webhook | snippet 65 | fires on product create/update/stock/trash/delete |

Base URL examples:

- Production: `https://peisbutikken.no`
- Preview Worker: `https://peisbutikken-frontend.ingar.workers.dev`

**Note:** `/api/revalidate/path` must be **deployed** before it works in production. Products webhook + WP snippet are the long-lived path for catalog edits.

---

## 1) Products webhook — `POST /api/revalidate/products`

### Bodies

```json
{ "slug": "mitt-produkt" }
```

```json
{ "slugs": ["slug-a", "slug-b"] }
```

```json
{ "revalidateAll": true }
```

Empty body / no slugs / no `revalidateAll` → **400** (does not purge anything).

### Tags purged

Decision: `lib/cache/product-revalidate-decision.ts`  
Route always adds shared tags; global `products` only when `revalidateAll`:

| Tag | Slug save | `revalidateAll` |
| --- | --- | --- |
| `products:archive` | yes | yes |
| `products:search` | yes | yes |
| `products:search:index` | yes | yes |
| `sitemap` | yes | yes |
| `product:{slug}` (each slug) | yes | if slugs also sent |
| `products` (global — every product fetch / ~all PDPs) | **no** | **yes** |

Slug saves intentionally **omit** global `products` so one WP edit does not force a full-catalog refetch.

### Consequences (slug save vs `revalidateAll`)

| Surface | `{ "slug": "x" }` | `{ "revalidateAll": true }` |
| --- | --- | --- |
| PDP `/produkt/x/` | Fresh on next hit (`product:x`) | Fresh (via global `products` + any slugs) |
| Other PDPs | Stay warm (global `products` untouched) | Stale → regen on next hit |
| `/shop/`, `/lagersalg/`, category/brand archives | Stale via shared `products:archive` → regen on next hit | Same + heavier PDP storm |
| Quick search index | Tag purged; may need rebuild/next fetch | Same |
| Sitemap | Tag purged | Same |

---

## 2) Path webhook — `POST /api/revalidate/path`

Use when you want **one page** (and its scoped archive data) without touching shared `products:archive` or global `products`.

### Bodies

```json
{ "path": "/lagersalg" }
```

```json
{ "paths": ["/lagersalg", "/ombyggingssalg"] }
```

Relative app paths only (leading `/`, no URLs, `..`, query, or hash). App uses `trailingSlash: true` — the route revalidates both `/path` and `/path/`.

### Path → tags

Decision: `lib/cache/path-revalidate-decision.ts`

| Path | Extra tag | Does **not** purge |
| --- | --- | --- |
| `/lagersalg` | `products:archive:lagersalg` | `products:archive`, `products` |
| `/ombyggingssalg` | `products:archive:peisoutlet` | same |
| `/shop` | `products:archive:shop` | same |
| `/produktkategori/{slug}` | `products:archive:{slug}` | same |
| `/produktkategori/{slug}/merke/{brand}` | `products:archive:{slug}` | same |
| Other paths (e.g. `/om-oss`) | `revalidatePath` only (no data tags) | — |

Always: `revalidatePath` for each path. Never: shared `products:archive` or global `products`.

---

## 3) Search index rebuild — `POST /api/search-index/rebuild`

Eagerly rebuilds the precomputed payload for `GET /api/search-products` (not lazy tag-only).

Product webhook **invalidates** search tags; this endpoint **rebuilds** the index payload now.

---

## Practical scenarios

| Goal | What to do |
| --- | --- |
| Changed one product in WP | Usually nothing — snippet **65** POSTs `{ "slugs": [...] }`. Manual: products webhook with that slug. |
| Fresh **lagersalg** list without cooling `/shop` | Path webhook `{ "path": "/lagersalg" }` |
| Fresh **shop** list only (scoped) | Path webhook `{ "path": "/shop" }` |
| Product edit made listings stale (normal) | Products webhook with slug already purges `products:archive` → `/shop`, hubs, categories refresh on next visit |
| Full catalog / every PDP must refetch WP | `{ "revalidateAll": true }` — rare; expensive |
| Search results still wrong after product purge | `POST /api/search-index/rebuild` |
| Forgot webhook / secret mismatch | Fix secret alignment; until then rely on TTL fallbacks below |

### When to use `revalidateAll`

- **Yes:** bulk import, suspected global tag corruption, schema/field change affecting all product fetches.
- **No:** routine single-product edits (use slug / WP snippet). Avoids regenerating ~entire PDP set.

---

## TTL fallbacks (if you never revalidate)

| Layer | Typical | Notes |
| --- | --- | --- |
| Archive GraphQL cache | Default **24h** (`PRODUCTS_ARCHIVE_REVALIDATE_SECONDS` override) | Shared + scope tags |
| Page ISR (`/shop`, PDP, category, brand, …) | **7 days** (`revalidate = 604800`) | On-demand tags beat this |
| Search index | Often **24h** (`SEARCH_INDEX_REVALIDATE_SECONDS`) | Rebuild endpoint for eager refresh |

Do not rely on ISR alone for price/stock edits — use the webhook.

---

## Curl examples (placeholders)

```bash
# One product (scoped — no global `products` tag)
curl -X POST "https://peisbutikken.no/api/revalidate/products" \
  -H "Content-Type: application/json" \
  -H "X-Revalidate-Secret: <PRODUCT_REVALIDATE_SECRET>" \
  --data '{"slug":"mitt-produkt"}'
```

```bash
# Full catalog purge (expensive)
curl -X POST "https://peisbutikken.no/api/revalidate/products" \
  -H "Content-Type: application/json" \
  -H "X-Revalidate-Secret: <PRODUCT_REVALIDATE_SECRET>" \
  --data '{"revalidateAll":true}'
```

```bash
# Lagersalg only — keeps shared products:archive /shop warm
curl -X POST "https://peisbutikken.no/api/revalidate/path" \
  -H "Content-Type: application/json" \
  -H "X-Revalidate-Secret: <PRODUCT_REVALIDATE_SECRET>" \
  --data '{"path":"/lagersalg"}'
```

```bash
# Shop scope tag + path only
curl -X POST "https://peisbutikken.no/api/revalidate/path" \
  -H "Content-Type: application/json" \
  -H "X-Revalidate-Secret: <PRODUCT_REVALIDATE_SECRET>" \
  --data '{"path":"/shop"}'
```

```bash
# Category archive page
curl -X POST "https://peisbutikken.no/api/revalidate/path" \
  -H "Content-Type: application/json" \
  -H "X-Revalidate-Secret: <PRODUCT_REVALIDATE_SECRET>" \
  --data '{"path":"/produktkategori/vedovn"}'
```

```bash
# Eager search index rebuild
curl -X POST "https://peisbutikken.no/api/search-index/rebuild" \
  -H "X-Revalidate-Secret: <SEARCH_INDEX_REBUILD_SECRET>"
```

Expected shapes:

- Products: `{ "ok": true, "revalidated": ["products:archive", ...], "revalidateAll": false }`
- Path: `{ "ok": true, "revalidated": { "paths": ["/lagersalg", "/lagersalg/"], "tags": ["products:archive:lagersalg"] } }`
- Search rebuild: `{ "ok": true, "version": 1, "generatedAt": "...", "productCount": N }`

---

## Quick decision tree

```
Changed product data in WP?
  → WP snippet 65 / POST products with slug(s)
     (archives + search tags + that PDP; not all PDPs)

Need only /lagersalg (or /shop, or one category) fresh,
without cooling other archives?
  → POST /api/revalidate/path

Need every PDP to refetch?
  → POST products with revalidateAll: true

Search still stale after tag purge?
  → POST /api/search-index/rebuild
```
