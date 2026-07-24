# Cloudflare Product Cache Runbook

This runbook covers operational setup for fast product retrieval on Cloudflare Workers (OpenNext) using server-side archive rendering, cache revalidation, and precomputed quick-search index delivery.

**Release / build / deploy preflight (canonical):** [`docs/runbooks/cloudflare-release-preflight.md`](../runbooks/cloudflare-release-preflight.md) — local gates only (`npm run release:check`, `npm run release:build:verify`); **no GitHub Actions CI**. Authoritative production deploy is manual WSL OpenNext (`bash scripts/deploy-linux-wsl.sh` / `npm run deploy:opennext`), never bare `npx wrangler deploy`.

## 1) One-time infrastructure setup

### R2 incremental cache bucket

```bash
npx wrangler r2 bucket create peisbutikken-next-inc-cache-weur
```

Confirm `wrangler.jsonc` contains:

- `r2_buckets[].binding = NEXT_INC_CACHE_R2_BUCKET`
- `r2_buckets[].bucket_name = peisbutikken-next-inc-cache-weur`

### Durable Object queue

Confirm `wrangler.jsonc` contains:

- `durable_objects.bindings[].name = NEXT_CACHE_DO_QUEUE`
- `durable_objects.bindings[].class_name = DOQueueHandler`
- `migrations[].new_sqlite_classes` includes `DOQueueHandler`

## 2) Cloudflare dashboard configuration

**Authoritative deploy (manual WSL):** `bash scripts/deploy-linux-wsl.sh` (Windows OpenNext deploy prohibited — ChunkLoadError). No GitHub Actions / no GitHub-hosted CI.

Workers Builds (dashboard) may still exist historically — **not** the ship path. If that config is touched, Deploy command must be `npm run deploy:opennext`, never bare `npx wrangler deploy`.

Workers & Pages -> project -> Settings -> Variables and Secrets:

- `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` (required)
- `PRODUCTS_ARCHIVE_REVALIDATE_SECONDS` (recommended, e.g. `300`)
- `PRODUCTS_EDGE_MAX_AGE_SECONDS` (recommended, e.g. `300`)
- `PRODUCTS_EDGE_STALE_WHILE_REVALIDATE_SECONDS` (recommended, e.g. `3600`)
- `PRODUCT_REVALIDATE_SECRET` (recommended for webhook revalidation)
- `SEARCH_INDEX_REVALIDATE_SECONDS` (recommended: `86400`)
- `SEARCH_INDEX_REBUILD_SECRET` (recommended for secure rebuild endpoint)

## 3) Deploy validation

### Build and preview locally in Cloudflare runtime

```bash
npm run preview
```

In another shell:

```bash
curl -I "http://localhost:8787/api/products?first=24"
```

Expected:

- `Cache-Control` includes `s-maxage=...` and `stale-while-revalidate=...`

### Production header validation

```bash
curl -I "https://<your-domain>/api/products?first=24"
curl -I "https://<your-domain>/api/products?first=24"
```

Expected:

- `CF-Cache-Status` transitions from `MISS` to `HIT` or `UPDATING`
- `Cache-Control` contains expected policy

### Search cold-path baseline (fresh browser)

```bash
curl -s -D - "https://<your-domain>/api/search-products" -o /dev/null | rg "X-Search-Products-Api-Duration-Ms|X-Search-Products-Count|X-Search-Index-Source|X-Search-Index-Generated-At|X-Search-Target-Duration-Ms|Server-Timing|Cache-Control"
```

Track and record:

- `X-Search-Products-Api-Duration-Ms` (baseline + post-change)
- `X-Search-Index-Source` (`precomputed` expected for normal traffic)
- `X-Search-Products-Count` (sanity check index completeness)

## 4) Webhook revalidation setup (optional but recommended)

Configure WordPress (or automation) to call:

- `POST https://<your-domain>/api/revalidate/products`
- Header: `X-Revalidate-Secret: <PRODUCT_REVALIDATE_SECRET>`

Body examples:

```json
{"revalidateAll": true}
```

```json
{"slug":"example-product-slug"}
```

```json
{"slugs":["slug-a","slug-b"]}
```

Manual test:

```bash
curl -X POST "https://<your-domain>/api/revalidate/products" \
  -H "Content-Type: application/json" \
  -H "X-Revalidate-Secret: <PRODUCT_REVALIDATE_SECRET>" \
  --data '{"revalidateAll":true}'
```

Expected response:

- `{ "ok": true, "revalidated": [...] }`

### Path-only revalidation (single page, keep `/shop` warm)

Use when you need to regenerate one hub/archive page without purging the shared `products:archive` tag (so `/shop` and other archives stay warm). Does **not** replace the WordPress product-save webhook.

- `POST https://<your-domain>/api/revalidate/path`
- Header: `X-Revalidate-Secret: <PRODUCT_REVALIDATE_SECRET>`
- Body: `{"path":"/lagersalg"}` or `{"paths":["/lagersalg","/ombyggingssalg"]}`

Known path → data tag mappings (plus `revalidatePath` for every path):

| Path | Extra tag purged |
| --- | --- |
| `/lagersalg` | `products:archive:lagersalg` |
| `/ombyggingssalg` | `products:archive:peisoutlet` |
| `/shop` | `products:archive:shop` |
| `/produktkategori/{slug}` | `products:archive:{slug}` |
| Other paths | `revalidatePath` only |

```bash
curl -X POST "https://<your-domain>/api/revalidate/path" \
  -H "Content-Type: application/json" \
  -H "X-Revalidate-Secret: <PRODUCT_REVALIDATE_SECRET>" \
  --data '{"path":"/lagersalg"}'
```

Expected response:

- `{ "ok": true, "revalidated": { "paths": ["/lagersalg", "/lagersalg/"], "tags": ["products:archive:lagersalg"] } }`

## 4b) Search index rebuild setup

Call:

- `POST https://<your-domain>/api/search-index/rebuild`
- Header: `X-Revalidate-Secret: <SEARCH_INDEX_REBUILD_SECRET>`

Manual test:

```bash
curl -X POST "https://<your-domain>/api/search-index/rebuild" \
  -H "X-Revalidate-Secret: <SEARCH_INDEX_REBUILD_SECRET>"
```

Expected response:

- `{ "ok": true, "version": 1, "generatedAt": "...", "productCount": ... }`

## 5) Rollback / safety switches

- Temporarily increase `PRODUCTS_ARCHIVE_REVALIDATE_SECONDS` to reduce origin load spikes.
- Disable webhook sender if invalidation storms are detected.
- Keep API routes active as fallback data path during incident response.
