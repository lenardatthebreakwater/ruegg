# Domain cutover — peisbutikken.no

**Purpose:** Cloudflare routing only (where each URL goes).  
**Related:** [Release preflight](cloudflare-release-preflight.md) · [Launch master list](../release-review-pre-launch.md) · [sGTM /cartdata setup](../seo/sgtm-hetzner-cartdata-setup.md)

---

## Do this in order

| # | Phase | When |
| --- | --- | --- |
| 0 | Read the routing matrix below | Now |
| 1 | Worker secrets + deploy to `workers.dev` | Before cutover day |
| 2 | Enable WP snippets (WC AJAX + revalidate) | Before catch-all |
| 3 | Zone hygiene (Scrape Shield, cache rules) | Before catch-all |
| 4 | Finish RankMath gaps + payment URL audit | Before catch-all |
| 5 | www → apex (proxied + Redirect Rule) | Before catch-all |
| 6 | `/cartdata*` → `pb-sgtm-proxy` | Before catch-all (safe early) |
| 7 | Add all WP exclusions, then catch-all `/*` | **Cutover moment** |
| 8 | Smoke tests | Immediately after |

**Rollback:** Delete Workers Route `peisbutikken.no/*`. Site is WordPress again. Leave exclusions and `/cartdata*` as-is.

---

## Routing matrix (source of truth)

Same hostname for everything. DNS apex stays on **Servebolt** (proxied). Traffic is split by **Cloudflare Workers Routes** (most specific wins).

| Path | Goes to | How |
| --- | --- | --- |
| `www.peisbutikken.no/*` | Apex (`peisbutikken.no`) | DNS proxied + **Redirect Rule 301** (not a Workers Route) |
| `/cartdata*` | **Hetzner sGTM** | Workers Route → Worker `pb-sgtm-proxy` |
| `/checkout*` | **WordPress** | Workers Route → None |
| `/graphql*` | **WordPress** | Workers Route → None |
| `/wp-json*` | **WordPress** | Workers Route → None |
| `/wp-admin*` | **WordPress** | Workers Route → None |
| `/wp-login.php*` | **WordPress** | Workers Route → None |
| `/wp-content*` | **WordPress** | Workers Route → None |
| `/wp-includes*` | **WordPress** | Workers Route → None |
| `/wc-api*` | **WordPress** | Workers Route → None |
| `/wp-cron.php*` | **WordPress** | Workers Route → None |
| `/xmlrpc.php*` | **WordPress** | Workers Route → None |
| `/index.php*` | **WordPress** | Workers Route → None |
| `/vipps-betaling*` | **WordPress** | Workers Route → None |
| `/vipps-express-checkout*` | **WordPress** | Workers Route → None |
| `/vipps-buy-product*` | **WordPress** | Workers Route → None |
| `/.well-known*` | **WordPress** | Workers Route → None (Apple Pay) |
| `/cart*`, `/handlekurv*` | **Next** → 301 `/` | Catch-all + `next.config.ts` |
| `/my-account*` | **Next** → 301 `/min-konto/` | Catch-all + `next.config.ts` |
| `/merke*`, `/varkampanje*` | **Next** → 301s | Catch-all + `next.config.ts` |
| `/page/N/`, `/shop/page/N/`, `/blog/page/N/` | **Next** → 301 | Catch-all + `next.config.ts` |
| `/wp-sitemap.xml`, `*-sitemap*.xml` | **Next** → 301 `/sitemap.xml` | Catch-all + `next.config.ts` |
| **Everything else** `/*` | **Next.js** Worker `peisbutikken-frontend` | Workers Route catch-all |

Locked decisions (2026-07-14): www Redirect Rule only · `/cartdata*` via proxy Worker · Vipps + `.well-known` excluded · cart/account → Next 301s · xmlrpc + index.php excluded.

---

## Copy-paste: Workers Routes to add

**Step A — exclusions first** (each → Worker: **None**):

```
peisbutikken.no/checkout*
peisbutikken.no/graphql*
peisbutikken.no/wp-json*
peisbutikken.no/wp-admin*
peisbutikken.no/wp-login.php*
peisbutikken.no/wp-content*
peisbutikken.no/wp-includes*
peisbutikken.no/wc-api*
peisbutikken.no/wp-cron.php*
peisbutikken.no/xmlrpc.php*
peisbutikken.no/index.php*
peisbutikken.no/vipps-betaling*
peisbutikken.no/vipps-express-checkout*
peisbutikken.no/vipps-buy-product*
peisbutikken.no/.well-known*
```

**Step B — already live before catch-all:**

- `/cartdata*` → Worker `pb-sgtm-proxy` (not None)
- www Redirect Rule live; **no** `www` Workers Route

**Step C — catch-all last:**

```
peisbutikken.no/*  →  peisbutikken-frontend
```

---

## 1. Worker env / deploy

- [ ] `NEXT_PUBLIC_SITE_URL=https://peisbutikken.no` (never `ny.peisbutikken.no`)
- [ ] `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://peisbutikken.no/graphql`
- [ ] `PRODUCT_REVALIDATE_SECRET` (= WP snippet)
- [ ] `AUTH_SESSION_SECRET`
- [ ] `WORDPRESS_AUTH_SHARED_SECRET` (= WP `PB_AUTH_SECRET`)
- [ ] Turnstile: real `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`
- [ ] Contact: `CONTACT_RECIPIENT_OVERRIDE`, email token/from, R2 attachments, D1 `CONTACT_SUBMISSIONS_DB`
- [ ] Shipping / side-cart secrets (= WP)
- [ ] `SEARCH_INDEX_REBUILD_SECRET`
- [ ] GTM: only after Hetzner `gtm.js` returns **200** — `NEXT_PUBLIC_GTM_ID`, `SCRIPT_URL=https://peisbutikken.no/cartdata/gtm.js`, `SCRIPT_QUERY=id=GTM-…`, `NOSCRIPT_URL=…/cartdata/ns.html`. Omit all four to disable GTM.
- [ ] `wrangler.jsonc` has `"keep_vars": true` so dashboard Variables/Secrets are not wiped on deploy.
- [x] **Deploy from Linux (required):** use `scripts/deploy-linux-wsl.sh` (OpenNext on Windows can 500 with SSR `ChunkLoadError`). Smoke `*.workers.dev` before zone catch-all. Keep `"keep_vars": true`.
- [x] Smoke on `*.workers.dev` **before** zone catch-all: `/`, `/shop/`, `/kontakt-oss/`.
- **P2 deploy notes:** `cloudflare-worker.ts` re-exports `DOQueueHandler` / `DOShardedTagCache`. Build-time workerd DO warnings during `next build` are still expected (OpenNext known issue). R2 populate uses `--cacheChunkSize=8` and `--rclone` when `rclone.js` is installed (skips unchanged). Homepage `revalidate=3600` + cached GMB fetch so Worker `GMB_*` refreshes reviews even if Linux build lacked those env vars.

---

## 2. WordPress snippets (before catch-all)

- [ ] **PB WC AJAX checkout path** on — moves `wc-ajax` under `/checkout/` (required or checkout breaks)
- [ ] **PB Frontend Revalidate** on
- [ ] Auth, cart-sync/order-bumps, contact, shipping, reservedeler live + secrets match Worker

---

## 3. Before flip — zone & money

### Zone hygiene

- [ ] **Disable Email Address Obfuscation** (Scrape Shield) — ON today; breaks Next hydration
- [ ] Rocket Loader **OFF**
- [ ] No “Cache Everything” / long TTL on `/*` that also caches Worker→WP subrequests
- [ ] Zaraz / APO: unused (confirmed)

### RankMath redirects

WP redirects die after catch-all. Ported 2026-07-14 (`next.config.ts` + `lib/redirects/legacy-rankmath-redirects.ts`).

- [x] Export + port (generic patterns + ~260 slug exceptions)
- [ ] Fix **16 truncated CSV rows** (ids 1006–1020, 1093–1103, 1181, 1203) from DB
- [ ] Re-export + regenerate day-of cutover

### Payment callbacks (paths only — query on `/` is fatal)

`/?wc-api=…` hits Next homepage after cutover and is **silently lost**.

- [ ] Stripe dashboard: webhook = `/wp-json/wc-stripe/v1/webhook` (not `/?wc-api=`)
- [ ] Vipps portal: no `/?wc-api=` static callback
- [ ] Resurs: `/wc-api/…` or `/wp-json/…` only

---

## 4. www → apex

Today `www` is grey-cloud → Servebolt CDN (outside this zone). Move in:

1. [ ] Redirect Rule: `www.peisbutikken.no/*` → `https://peisbutikken.no/${1}` **301** (preserve query)
2. [ ] DNS: `www` CNAME → `peisbutikken.no`, **proxied** (orange)
3. [ ] `curl -sI "https://www.peisbutikken.no/produkter/?a=1"` → 301 to apex + query
4. [ ] Do **not** add `www` Workers Route
5. [ ] Later: remove `www` from Servebolt CDN hostnames

---

## 5. `/cartdata*` → Hetzner

Workers Route `peisbutikken.no/cartdata*` → `pb-sgtm-proxy`.  
Do **not** use Worker:None (that would hit Servebolt WP).

Full guide: [sgtm-hetzner-cartdata-setup.md](../seo/sgtm-hetzner-cartdata-setup.md). Safe to enable before catch-all (`/cartdata` 404s on WP today).

---

## 6. Cutover moment

1. [x] Exclusions from copy-paste list above (all None) — live before flip
2. [x] Confirm www Redirect + `/cartdata*` proxy
3. [x] Add `peisbutikken.no/*` (+ bare `peisbutikken.no`) → `peisbutikken-frontend` — **2026-07-16**
4. [x] Do not add www Workers Route

**Rollback:** delete Workers Routes `peisbutikken.no` and `peisbutikken.no/*` (leave exclusions + `/cartdata*`).

---

## 7. Smoke tests (right after)

- [x] Home / category / shop / kontakt from Worker (`x-powered-by: Next.js`, cache HIT)
- [x] `/graphql` GET = WPGraphQL; Worker APIs (`/api/products/*`) prove edge→WP GraphQL POST works
- [x] www → apex 301 keeps path + query
- [x] `/.well-known/apple-developer-merchantid-domain-association` → 200
- [ ] `/vipps-betaling/` = WordPress (hits WP; page currently HTTP 500 — investigate on Servebolt)
- [x] `/cartdata/healthz` → 200; `gtm.js` still deferred until Hetzner returns 200
- [ ] Stripe purchase: ATC → `/checkout/` → order-received
- [ ] Vipps purchase: return page + `/wc-api/wc_gateway_vipps`
- [ ] Stripe / Resurs webhooks green
- [ ] Contact, login, shipping quote via `/wp-json`
- [ ] Product save → revalidate
- [ ] `npm run warm` · `/sitemap.xml` · disable RankMath sitemap in WP

---

## Appendix A — Architecture (why)

| | |
| --- | --- |
| Goal | Next storefront + WP checkout/media/GraphQL on **one** domain |
| DNS | Apex stays Servebolt; CF proxies |
| Rollback | Delete catch-all route |
| Benefits | No WP migrate, no cookie/domain split, payment URLs unchanged |

Already in repo (no action): apex canonicals, WP URL helpers, revalidate snippet target, legacy redirects in `next.config.ts`.

---

## Appendix B — Notes

| Topic | Note |
| --- | --- |
| Empty cart from checkout | May land on Next — OK |
| SEO | Worker owns `robots.txt`, sitemaps, and `/llms.txt` (not a WP exclusion — catch-all serves Next) |
| xmlrpc | Excluded for plugin safety; WAF-rate-limit later if noisy |
| `/?s=`, `/?p=` | Hit Next homepage (routes ignore query) |
| `.well-known` | Stays on WP while excluded — put new files in WP |
| Servebolt load | Only exclusions + Worker→WP fetches |
