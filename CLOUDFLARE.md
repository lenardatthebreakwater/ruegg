# Deploying to Cloudflare

This Next.js app deploys to **Cloudflare Workers** using [OpenNext](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare`).

## Source control & deploy

- **No GitHub Actions / no GitHub-hosted CI/CD.** Do not add `.github/workflows`.
- **GitHub** stores code as a safety backup only (clone, PRs, history).
- **Builds and production deploys are manual** on a local machine / WSL — iterate fast with `npm run release:check`, `npm run release:build:verify`, then authorized `bash scripts/deploy-linux-wsl.sh`.
- A Cloudflare **Workers Builds** dashboard config may still exist historically. It is **not** the authoritative path. Prefer local WSL OpenNext (`deploy-linux-wsl.sh` / `npm run deploy:opennext` on Linux).

## Release preflight (canonical)

Before any production deploy, follow the human/agent runbook:

**[`docs/runbooks/cloudflare-release-preflight.md`](docs/runbooks/cloudflare-release-preflight.md)**

Safe local commands (never publish):

```bash
npm run release:check            # typecheck, lint, tests, lockfile, git diff, shop cache size
npm run release:build:verify     # WSL/Linux OpenNext build + wrangler --dry-run only
```

Agent skill: [`.cursor/skills/cloudflare-release-preflight/SKILL.md`](.cursor/skills/cloudflare-release-preflight/SKILL.md).

Do **not** deploy, mutate routes/cache/secrets, or flush production unless explicitly authorized in that message.

## Production deploy path (required)

**Single supported production path:** Linux / WSL OpenNext build + deploy (populates the R2 incremental cache).

```bash
# From Windows project root — runs inside WSL with Node 22
# Requires explicit authorization. Prefer release:check + release:build:verify first.
bash scripts/deploy-linux-wsl.sh
```

That script:

1. Copies source into a Linux working tree
2. Runs `opennextjs-cloudflare build` (via `scripts/run-opennext-loud.mjs`)
3. Runs `opennextjs-cloudflare deploy` with `--cacheChunkSize=8` (and `--rclone` when R2 API creds exist)
4. Smoke-checks `*.workers.dev`, then **≥5 apex PDPs** on `https://peisbutikken.no` (`npm run smoke:pdps` / `scripts/verify-pdp-smoke.mjs`) — fail closed if any product page is broken
5. Prunes stale R2 cache prefixes (`KEEP_BUILD_IDS` default **1** — current build only)

`npm run deploy:opennext` (Linux / WSL, after an OpenNext build) runs the same apex PDP smoke after a successful OpenNext publish.

### Windows is prohibited

Do **not** run production OpenNext deploys from Windows. Observed failure mode: upload can succeed, then SSR returns **`ChunkLoadError`**. `npm run deploy` exits immediately on `win32` and points you at the WSL script.

### Do not use bare `wrangler deploy` for production

`npx wrangler deploy` **skips OpenNext cache population**. Prefer:

| Context | Command |
| --- | --- |
| Local / workstation production (**authoritative**) | `bash scripts/deploy-linux-wsl.sh` |
| Linux shell (already on Linux, authorized) | `npm run deploy` / `npm run deploy:opennext` after install |
| Type generation only | `npm run cf-typegen` |

`build:cloudflare`, `preview`, and deploy helpers tee full OpenNext output to `tmp/opennext-logs/*.log` and print a warn/error summary. They do **not** fail the build on warnings.

## Workers Builds (historical / non-authoritative)

There is **no GitHub Actions CI** in this repo (`.github/workflows` removed; do not recreate). Production ships via **manual WSL OpenNext** (`scripts/deploy-linux-wsl.sh`).

Cloudflare **Workers Builds** settings (if still present in the dashboard) are **not** the team’s deploy path. If someone triggers a dashboard build anyway, Deploy command must be OpenNext — never bare Wrangler — but do **not** treat Workers Builds or GitHub-hosted pipelines as release gates.

In-repo hardening for local/manual deploys:

- `npm run deploy` / `npm run deploy:opennext` → `scripts/deploy-opennext.mjs` (Linux-only, fail-fast if `.open-next/worker.js` missing, OpenNext populate with `--cacheChunkSize=8`)
- `wrangler.jsonc` `build.command` blocks bare local Wrangler publish unless `PB_OPENNEXT_DEPLOY=1`

Ensure the **Worker name** matches `peisbutikken-frontend` (`name` in `wrangler.jsonc`).

## Environment variables

Set these in **Cloudflare Dashboard** → **Workers & Pages** → your project → **Settings** → **Variables and Secrets**.

### Required (build and runtime)

- **`NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL`** – WordPress/WooCommerce GraphQL URL (e.g. `https://your-site.com/graphql`).

### Optional

- **`NEXT_PUBLIC_GTM_ID`** – Web GTM container ID (e.g. `GTM-K2MX2MPS`). Omit to disable GTM in the app.
- **`NEXT_PUBLIC_GTM_SCRIPT_URL`** – Stape Custom Loader script URL **without** query string (e.g. `https://peisbutikken.no/cartdata/4h6ognmyvhwbt.js`). Omit to load the default `googletagmanager.com/gtm.js` script.
- **`NEXT_PUBLIC_GTM_SCRIPT_QUERY`** – Query string for the loader **without** a leading `?` (copy from the Stape “Custom Loader” snippet: everything after `…js?`). Stape may use a token (e.g. `bjb6j=…`) instead of the container id; if this is unset, the app falls back to appending `NEXT_PUBLIC_GTM_ID` as the query (older Stape format).
- **`NEXT_PUBLIC_GTM_NOSCRIPT_URL`** – Stape `ns.html` URL **without** query (e.g. `https://data.ny.peisbutikken.no/ns.html`). Used with `?id={NEXT_PUBLIC_GTM_ID}` for the noscript iframe. If you set `NEXT_PUBLIC_GTM_SCRIPT_URL` for Stape, set this too so the iframe matches your server container.
- **`NEXT_PUBLIC_ACCESSORIES_CATEGORY_SLUG`** – Category slug for accessories (e.g. `tilbehor`). See `lib/graphql/fetch-products.ts`.
- **`NEXT_PUBLIC_DEBUG_ACCESSORIES`** – Set to `true` to enable accessories debug API (default: only in development).
- **`PRODUCTS_ARCHIVE_REVALIDATE_SECONDS`** – Next server cache TTL for product archive queries (default: `300`).
- **`PRODUCT_DETAIL_REVALIDATE_SECONDS`** – Next server cache TTL for product detail queries (default: `900`).
- **`PRODUCTS_EDGE_MAX_AGE_SECONDS`** – Cloudflare edge cache max-age for `/api/products` (default: `300`).
- **`PRODUCTS_EDGE_STALE_WHILE_REVALIDATE_SECONDS`** – stale-while-revalidate for `/api/products` (default: `3600`).
- **`PRODUCT_DETAIL_EDGE_MAX_AGE_SECONDS`** – Cloudflare edge cache max-age for `/api/products/[slug]` (default: `900`).
- **`PRODUCT_DETAIL_EDGE_STALE_WHILE_REVALIDATE_SECONDS`** – stale-while-revalidate for `/api/products/[slug]` (default: `3600`).
- **`PRODUCT_REVALIDATE_SECRET`** – Shared secret for signed product revalidation webhook (`X-Revalidate-Secret` header).
- **`SEARCH_INDEX_REVALIDATE_SECONDS`** – server cache TTL for precomputed search index payload (default: `86400` / daily).
- **`SEARCH_INDEX_REBUILD_SECRET`** – shared secret for search-index rebuild endpoint (falls back to `PRODUCT_REVALIDATE_SECRET` if unset).
- **`NEXT_PUBLIC_TURNSTILE_SITE_KEY`** – Cloudflare Turnstile sitekey for contact + login widgets. **Must be available at Build time** (`NEXT_PUBLIC_*` is baked into the client). Use Cloudflare [dummy keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) locally; real sitekey in production.
- **`TURNSTILE_SECRET_KEY`** – Turnstile secret for server-side `siteverify`. Set as a **Secret** (not `NEXT_PUBLIC_`). Fail-closed if missing in production.

**Important:** `NEXT_PUBLIC_*` variables are baked in at **build time**. Add them as **Build** / **Environment variables** for the Cloudflare project so they are available when `opennextjs-cloudflare build` runs. You can also add them as **Production** (and **Preview** if needed) so they exist at runtime.

## Local commands

- **Develop:** `npm run dev` (unchanged)
- **Release quick gates (no deploy):** `npm run release:check`
- **Release build verify (WSL build + wrangler dry-run only):** `npm run release:build:verify`
- **Preview (Cloudflare runtime locally):** `npm run preview`
- **Production deploy:** WSL `scripts/deploy-linux-wsl.sh` (Windows blocked by design; authorize explicitly)
- **Post-deploy PDP smoke (Norway apex):** `npm run smoke:pdps` (also runs automatically after deploy)
- **Types:** `npm run cf-typegen` after `wrangler.jsonc` binding changes

## Browser vs CDN cache headers (HTML / RSC)

After deploy, R2 incremental-cache prune keeps only the current buildId (`KEEP_BUILD_IDS`, default **1**). If a browser keeps an old HTML/RSC shell that references `/_next/static/*` from a pruned build, chunks 404 and PDPs break.

- **Documents / RSC** (`text/html`, `text/x-component`): `cloudflare-worker.ts` rewrites browser `Cache-Control` to `private, no-cache, max-age=0, must-revalidate`, and copies Next’s `s-maxage` onto `CDN-Cache-Control` / `Cloudflare-CDN-Cache-Control` so shared caches can still honor ISR TTLs.
- **Hashed static** (`/_next/static/*`): still long-lived immutable via `public/_headers` (Worker does not run in front of Static Assets).
- **OpenNext ISR data** continues to live in R2 + tag cache; these HTTP header tweaks only affect browser/CDN HTTP caching of the document/RSC response.

Verify after deploy:

```bash
curl -sI "https://peisbutikken.no/" | rg -i "cache-control|cdn-cache"
curl -sI -H "RSC: 1" "https://peisbutikken.no/" | rg -i "cache-control|cdn-cache|content-type"
# Expect browser Cache-Control: private, no-cache, max-age=0, must-revalidate
# Expect CDN-* headers still carrying s-maxage when Next sent one

# Static chunks must remain immutable (pick a real chunk URL from the HTML):
curl -sI "https://peisbutikken.no/_next/static/chunks/<file>.js" | rg -i cache-control
# Expect: public, max-age=31536000, immutable
```

**Caveat:** `Cloudflare-CDN-Cache-Control` only accepts `public` / `s-maxage` / `must-revalidate` for edge caching (extra directives → BYPASS). We therefore omit `stale-while-revalidate` on that header and keep it on `CDN-Cache-Control` only. Zone OCC / Workers Cache behavior can still differ from OpenNext’s R2 ISR path.

## Observability and CPU limits

`wrangler.jsonc` enables Workers Observability with head sampling (logs ~10%, traces ~5%). Adjust sampling if volume/cost requires it.

**CPU policy (metrics-first):** do **not** set arbitrary `limits.cpu_ms` in config. Use Workers metrics / invocation CPU time first; raise limits only when evidence shows need.

## Contact form (D1 + R2 + email)

`/api/contact/submit` flow (fast UX):

1. Validate + Turnstile  
2. Upload attachments to R2 (`CONTACT_ATTACHMENTS_R2`) when present  
3. Insert lead into D1 (`CONTACT_SUBMISSIONS_DB` / `peisbutikken-contact-submissions`) — **canonical store**  
4. Return `{ ok: true }` immediately  
5. Send staff email in the background (`waitUntil` / `after`); update D1 `email_status` to `sent` or `failed`  

Elementor / WordPress submissions are **not** used. Rate limit: **5 per IP per 15 minutes** (per Worker isolate; see `lib/rate-limit.ts`).

Schema: `migrations/0001_contact_submissions.sql`. Apply remotely:

```bash
npx wrangler d1 execute peisbutikken-contact-submissions --remote --file=migrations/0001_contact_submissions.sql
```

Inspect leads (example):

```bash
npx wrangler d1 execute peisbutikken-contact-submissions --remote --command "SELECT id, submitted_at, email, form_id, email_status FROM contact_submissions ORDER BY submitted_at DESC LIMIT 20"
```

## Contact attachment uploads (Cloudflare R2)

Attachments for the contact form are stored in Cloudflare R2.

### 1) Create a dedicated R2 bucket

- Recommended name: `peisbutikken-contact-attachments`
- Keep this separate from `NEXT_INC_CACHE_R2_BUCKET` (that bucket is only for Next/OpenNext caching)

### 2) Create R2 API credentials

In Cloudflare Dashboard -> R2 -> Overview -> **Manage in API Tokens**:

- Create token with **Object Read & Write**
- Scope the token to the contact bucket only
- Save:
  - Access Key ID
  - Secret Access Key

### 3) Connect a custom domain (production)

- Add bucket custom domain (example: `contact-files.peisbutikken.no`)
- Wait until status is **Active**
- Use this domain as `CONTACT_R2_PUBLIC_BASE_URL`

Use `r2.dev` only for development. For production links in emails, prefer a custom domain.

### 4) Add runtime secrets in Workers & Pages

Set these in **Workers & Pages -> Settings -> Variables and Secrets**:

- `CONTACT_R2_ACCOUNT_ID`
- `CONTACT_R2_BUCKET_NAME`
- `CONTACT_R2_ACCESS_KEY_ID` (secret)
- `CONTACT_R2_SECRET_ACCESS_KEY` (secret)
- `CONTACT_R2_PUBLIC_BASE_URL`

### 5) CORS and retention notes

- CORS is not required for the current server-side upload flow.
- Configure CORS later only if implementing browser direct uploads/presigned URLs.
- Current policy for contact attachments: no automatic lifecycle deletion.

## Contact email (Cloudflare Email Service)

The contact form (`/api/contact/submit`) sends staff notification mail through the [Cloudflare Email Sending REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/) (no Worker `send_email` binding required).

### 1) Onboard your domain

In **Cloudflare Dashboard** → **Email Sending** → **Onboard Domain**, complete DNS (MX/SPF/DKIM/DMARC as Cloudflare adds). The `from` address must use that domain. See [Send emails — set up your domain](https://developers.cloudflare.com/email-service/get-started/send-emails/).

### 2) API token

Create an API token with permission to send email for the account (e.g. **Account** → **Email Sending** → **Send**). Store it as **`CONTACT_EMAIL_API_TOKEN`** (secret) in **Workers & Pages** → **Variables and Secrets**.

**Important (deploy `403` on R2):** Wrangler uses the environment variable **`CLOUDFLARE_API_TOKEN`** during OpenNext/Wrangler deploy (including R2 `bulk put` to `peisbutikken-next-inc-cache-weur`). If you set `CLOUDFLARE_API_TOKEN` in the same project to an **email-only** token, deploy can fail with `403` when uploading the OpenNext incremental cache. Prefer **`CONTACT_EMAIL_API_TOKEN`** for contact email so `CLOUDFLARE_API_TOKEN` (if set) can remain a broader Workers/R2 token, or leave `CLOUDFLARE_API_TOKEN` unset so the CI’s default API access applies. The app reads `CONTACT_EMAIL_API_TOKEN` first, then falls back to `CLOUDFLARE_API_TOKEN` for local one-token setups.

### 3) Runtime variables

Add alongside your other contact secrets:

| Variable | Notes |
|----------|--------|
| `CONTACT_EMAIL_API_TOKEN` | **Preferred.** Secret; Bearer for `POST .../email/sending/send` (Email Sending only) |
| `CLOUDFLARE_API_TOKEN` | Only if you use a single token for both email and deploy (must include Email Sending + Workers/R2) |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID (optional if `CONTACT_R2_ACCOUNT_ID` is already set to the same value) |
| `CONTACT_EMAIL_FROM` | Verified sender address (e.g. `no-reply@yourdomain.no`) |
| `CONTACT_EMAIL_FROM_NAME` | Optional display name (default in code: Peisbutikken) |
| `CONTACT_RECIPIENT_OVERRIDE` | Optional; forces inbound address for all submissions |
| `CONTACT_EMAIL_ATTACHMENTS_MODE` | `url` (default), `binary`, or `off` — see `.env.example` |

**Size limit:** Cloudflare caps total message size at **5 MiB** including attachments. With `CONTACT_EMAIL_ATTACHMENTS_MODE=binary`, the app skips MIME attachments when the estimate would exceed the limit but still sends the message body with R2 URLs for the files.

## Cloudflare bindings required for cache performance

These bindings are **required** for the current OpenNext ISR/data cache + on-demand revalidation setup (`open-next.config.ts`):

- **R2 Incremental Cache**
  - Binding: `NEXT_INC_CACHE_R2_BUCKET`
  - `wrangler.jsonc` value in this repo: `peisbutikken-next-inc-cache-weur` (Western Europe)
  - Create bucket if missing (prefer `weur` location hint in the dashboard):
    - `npx wrangler r2 bucket create peisbutikken-next-inc-cache-weur`
- **Durable Object Queue**
  - Binding: `NEXT_CACHE_DO_QUEUE`
  - Class: `DOQueueHandler`
  - Migration tag: `v1`
- **Sharded Durable Object Tag Cache** (**required**, not optional)
  - Binding: `NEXT_TAG_CACHE_DO_SHARDED`
  - Class: `DOShardedTagCache`
  - Migration tag: `v2`
  - Without this, `revalidateTag()` / the product-save webhook is effectively a silent no-op on Workers

If these are not provisioned, product archive revalidation and cache behavior can be inconsistent in production.

### Follow-up (not enabled in repo yet): regional Cache API purge

OpenNext supports automatic Cache API purge for on-demand revalidation when using regional/Cache API layers. Enabling it needs **account/zone resources** — do not guess secret values in git.

**Checklist before enabling:**

1. Confirm custom domain / zone is attached (purge APIs require a zone).
2. Create an API token with **Cache Purge** permission; store as Worker secret `CACHE_PURGE_API_TOKEN` (never commit).
3. Set Worker secret/var `CACHE_PURGE_ZONE_ID` to the zone ID for `peisbutikken.no`.
4. Add OpenNext `cachePurge: purgeCache({ type: "durableObject" | "direct" })` in `open-next.config.ts`.
5. If using durable-object buffering: add `NEXT_CACHE_DO_PURGE` → `BucketCachePurge` binding + a **new** migration tag (do not reuse `v1`/`v2`), and re-export `BucketCachePurge` from `cloudflare-worker.ts` if required by the installed OpenNext version.
6. Redeploy via Linux OpenNext path; validate a webhook revalidation purges as expected.
7. Run `npm run cf-typegen` so `cloudflare-env.d.ts` includes the new bindings.

Until then, tag-cache DO + R2 remain the production path; regional Cache API purge stays deferred.

## Product data caching and webhook revalidation

Product reads are proxied through internal API routes and cached:

- `GET /api/products?first=...&after=...&onSaleOnly=...`
- `GET /api/products/[slug]`
- `GET /api/products/best-selling?limit=...`
- `GET /api/products/popular-fireplaces?limit=...`
- `GET /api/search-products`

For near-instant updates after WordPress product changes, call:

- `POST /api/revalidate/products`
  - Header: `X-Revalidate-Secret: <PRODUCT_REVALIDATE_SECRET>`
  - Body examples:
    - `{"revalidateAll": true}` (full catalog cache invalidation)
    - `{"slug":"produkt-slug"}` (single product tag invalidation)
    - `{"slugs":["slug-a","slug-b"]}` (multiple product tags)

To regenerate **one page** (and its path-scoped archive data) without busting `/shop` or the shared `products:archive` tag:

- `POST /api/revalidate/path`
  - Same auth headers as products (`X-Revalidate-Secret` or `X-Webhook-Secret`)
  - Body: `{"path":"/lagersalg"}` or `{"paths":["/lagersalg","/ombyggingssalg"]}`
  - Known mappings also purge a scope tag only, e.g. `/lagersalg` → `products:archive:lagersalg` (not `products:archive`)
  - WordPress product-save webhook behavior is unchanged (still uses `/api/revalidate/products`)

```bash
curl -X POST "https://peisbutikken.no/api/revalidate/path" \
  -H "Content-Type: application/json" \
  -H "X-Revalidate-Secret: <PRODUCT_REVALIDATE_SECRET>" \
  --data '{"path":"/lagersalg"}'
```

For manual or scheduled search index rebuilds, call:

- `POST /api/search-index/rebuild`
  - Header: `X-Revalidate-Secret: <SEARCH_INDEX_REBUILD_SECRET or PRODUCT_REVALIDATE_SECRET>`

The endpoint revalidates and repopulates the precomputed payload used by `GET /api/search-products`.

## Search cold-start validation

Use these headers to baseline first-search latency and verify improvements:

```bash
curl -s -D - "https://<your-domain>/api/search-products" -o /dev/null | rg "X-Search-Products-Api-Duration-Ms|X-Search-Products-Count|X-Search-Index-Source|X-Search-Index-Generated-At|X-Search-Target-Duration-Ms|Server-Timing|Cache-Control"
```

Target:

- `X-Search-Products-Api-Duration-Ms` <= `1000` for warm/precomputed responses
- `X-Search-Index-Source: precomputed` for normal traffic

## References

- [OpenNext – Cloudflare](https://opennext.js.org/cloudflare)
- [OpenNext – Caching](https://opennext.js.org/cloudflare/caching)
- [Cloudflare Cache Revalidation](https://developers.cloudflare.com/cache/concepts/revalidation/)
