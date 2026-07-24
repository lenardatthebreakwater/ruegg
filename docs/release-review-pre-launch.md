# Launch checklist — peisbutikken.no (Next.js + WordPress)

**Target:** same-domain cutover to Next.js on `peisbutikken.no`.  
**Last updated:** 2026-07-16

This is the **single master list** for launch. Detailed Cloudflare route steps stay in [`docs/runbooks/domain-cutover-checklist.md`](runbooks/domain-cutover-checklist.md) — execute that runbook when you flip routes; use **this** file so nothing is forgotten.

**Status:** `[ ]` open · `[x]` done in code/docs · `Ops` = you (dashboard / WP / secrets) · `Defer` = after launch OK

---

## 0) Snapshot — where we are (2026-07-16)

| Area | Status |
| --- | --- |
| Functional shop bugs from release review | **Done in code** (branch `ingar0710`) |
| Static media Tinify → AVIF+WebP | **Done** |
| `ny.peisbutikken.no` preview host | **Removed** (Workers custom domain detached) |
| `/cartdata*` → `pb-sgtm-proxy` → Hetzner | **Live** (keep GTM env unset until `gtm.js` returns 200) |
| WP Code Snippets (WC AJAX, revalidate, lokalmontering, …) | **Verified + activated** via Code Snippets API |
| WP exclusion Workers Routes | **Live** (checkout, graphql, wp-*, vipps, `.well-known`, …) |
| Apex catch-all → Next | **Live** (2026-07-16) — Linux Worker deploy + `peisbutikken.no` / `peisbutikken.no/*` → `peisbutikken-frontend` |
| Windows `npm run deploy` | **Do not cut over from Windows** — OpenNext SSR ChunkLoadError; use manual WSL OpenNext (`deploy-linux-wsl.sh`). No GitHub Actions CI. |
| GTM `NEXT_PUBLIC_GTM_*` | **Unset on purpose** until Hetzner loader is healthy |
| Commit launch branch | Still open (large local diff) |

## 1) Blockers before anyone hits production (do today / before routes)

### A. Code that must land before deploy

- [x] **Fix broken static image references (P0)** — paths + `StaticPicture` / `staticImageSet` wired 2026-07-13. Re-verify images after deploy.
- [ ] **Commit launch branch** (do **not** commit `.env.local`, Tinify API key, or re-commit secrets). Include functional fixes + image assets + path updates.
- [ ] **Local sanity:** `npm run build` — homepage, a category, a PDP, contact, cart open without `/images/…` 404 storms.
- [x] **Deploy Worker from Linux** (WSL `deploy-linux-wsl.sh`, 2026-07-16). Windows OpenNext deploys can upload successfully but 500 with SSR `ChunkLoadError`. Smoke `*.workers.dev` **before** zone catch-all. Keep `"keep_vars": true` in `wrangler.jsonc`.

### B. Secrets & production env (Ops — blocking)

Old `.dev.vars` was tracked in git history; treat those values as **compromised**.

- [ ] **Rotate** and set only via Worker secrets / dashboard (never commit):
  - R2 contact keys (`CONTACT_R2_*`)
  - Contact D1 `CONTACT_SUBMISSIONS_DB` (+ R2 attachments / email tokens)
  - `PRODUCT_REVALIDATE_SECRET` (+ WP snippet)
  - `AUTH_SESSION_SECRET`
  - `WORDPRESS_AUTH_SHARED_SECRET` (+ WP)
  - Shipping / side-cart upsell secrets aligned with WP
  - `SEARCH_INDEX_REBUILD_SECRET` (or shared revalidate secret)
  - `TURNSTILE_SECRET_KEY` + real `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (rebuild required for public key)
  - Contact email: `CONTACT_EMAIL_*` / Cloudflare Email token
- [ ] **`CONTACT_RECIPIENT_OVERRIDE`** set on Worker (e.g. `post@peisbutikken.no`) — client `recipientEmail` is ignored in code; without override, inbox may be wrong/default.
- [ ] Confirm **`NEXT_PUBLIC_DEBUG_ACCESSORIES` unset** in production.
- [ ] Confirm **`NEXT_PUBLIC_SITE_URL=https://peisbutikken.no`** and **`NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL=https://peisbutikken.no/graphql`** on the Worker (public vars baked at build).
- [ ] GTM/Stape public IDs/URLs set if used in prod (`NEXT_PUBLIC_GTM_*`).

### C. WordPress (Ops — blocking before catch-all)

- [ ] Enable **PB WC AJAX checkout path** (`docs/wordpress/snippets/wordpress-pb-wc-ajax-checkout-path.php`) — **checkout breaks** once root is the Worker without this.
- [ ] Enable **PB Frontend Revalidate** → `POST https://peisbutikken.no/api/revalidate/products` with matching secret.
- [ ] Confirm other PB snippets live + secrets match Worker: auth, cart-sync, contact, shipping, side-cart bumps, reservedeler, product brand GraphQL, etc.
- [ ] Prefer **fail-closed** on empty `PB_*` secrets in WP production (if still fail-open, harden before or right after launch).

---

## 2) Cutover day — Cloudflare (execute runbook)

Full step-by-step: [`docs/runbooks/domain-cutover-checklist.md`](runbooks/domain-cutover-checklist.md).

**Do not** delete Servebolt DNS / apex origin. Exclusion routes fall through to WordPress.

- [ ] **Zone feature audit:** disable Email Address Obfuscation (ON today — breaks Next hydration), confirm Rocket Loader OFF, review Cache/Page Rules that would also cache Worker subrequests (checklist §3a).
- [ ] **WP redirects ported** (done 2026-07-14: 1222 RankMath rules → generics + generated `lib/redirects/legacy-rankmath-redirects.ts`). Remaining: fix 16 truncated rows from the DB + re-export/regenerate right before cutover (checklist §3b).
- [ ] **Payment callback audit:** Stripe webhook is `/wp-json/wc-stripe/v1/webhook` (covered); verify no legacy `/?wc-api=…` root-query callbacks registered at Stripe/Vipps/Resurs (checklist §3c — query strings never match Workers routes).
- [x] **www → apex:** proxied + Redirect Rule 301 (verified path+query preserved).
- [x] Add **exclusion routes** (Worker: None) first:  
  `/checkout*` `/graphql*` `/wp-json*` `/wp-admin*` `/wp-login.php*` `/wp-content*` `/wp-includes*` `/wc-api*` `/wp-cron.php*` `/xmlrpc.php*` `/index.php*` `/vipps-betaling*` `/vipps-express-checkout*` `/vipps-buy-product*` `/.well-known*`.
- [x] Confirm **`/cartdata*` Workers Route → proxy Worker `pb-sgtm-proxy` → Hetzner sGTM** (`/cartdata/healthz` 200).
- [x] Add catch-all: `peisbutikken.no` + `peisbutikken.no/*` → Worker `peisbutikken-frontend` (2026-07-16).
- [x] **Rollback ready:** delete those two catch-all routes → WP serves everything again.

### Immediately after routes live

- [x] Homepage / category / shop / kontakt from Worker (`x-powered-by: Next.js`).
- [x] `/graphql` GET = WPGraphQL; Worker `/api/products/*` OK (edge GraphQL POST).
- [ ] `/wp-login.php` + `/wp-admin/` still WP (spot-check).
- [ ] **Full purchase:** ATC on Next → `/checkout/` → Stripe (low value) → order in Woo + order-received.
- [ ] Payment webhooks green (Stripe; Vipps/Resurs on next real tx).
- [ ] Contact form (upload), login/signup, shipping quote.
- [ ] Product-save → revalidate webhook updates PDP/archives quickly.
- [ ] `npm run warm` against `https://peisbutikken.no`.
- [x] `/sitemap.xml` is Next (200); submit Search Console; disable RankMath sitemap in WP.
- [ ] Quick visual: homepage hero + feature strips + nav images load (no broken media).

---

## 3) Functional QA (code already fixed — still retest on prod)

These were fixed in the 2026-07-12 batch; **re-verify after deploy/cutover**.

1. [ ] Variable listing → **Velg variant** → PDP ATC → checkout lines OK  
2. [ ] Multi-item cart → all lines in Woo (no silent drop)  
3. [ ] Logged-in checkout → Woo without WP re-login (SSO via `POST /api/cart/checkout`)  
4. [ ] After checkout handoff → Back keeps Next cart; order-complete clear is follow-up  
5. [ ] Catalog-hidden / search-only product **not** on `/shop` or category  
6. [ ] PDP breadcrumbs include category when product has one  
7. [ ] Price-asc: no “free” nulls at top; unpriced excluded from price filter  
8. [ ] Out-of-stock (PDP + cards + accessories): **Utsolgt**, cannot add  
9. [ ] High-kW product (e.g. Rüegg ~32,8 kW): power shows ~32,8 — not ~3,2  
10. [ ] Contact: success toast; email once to store inbox; forged `recipientEmail` ignored  
11. [ ] Signup + glemt passord: Turnstile + rate limit  
12. [ ] Search: full catalog fetch only when search opens  

---

## 4) Smaller / polish — do if time before launch, else same day

- [ ] Norwegian `alt` / `title` on renamed static images (best-effort)  
- [ ] Replace stålpipe hero stand-in if you have a real asset  
- [ ] Fix/replace tiny navbar `placeholder` (Tinify skipped invalid file)  
- [ ] Decide legacy URLs: `/cart*`, `/handlekurv*`, `/my-account*` → Next 301 vs temporary WP exclusion  
- [ ] Confirm Chatway widget ID delay OK for PageSpeed (`NEXT_PUBLIC_CHATWAY_*`)  
- [ ] Spot-check blog / lokalmontering / reservedeler on production URL  

---

## 5) Explicitly deferred (not required for tomorrow)

Safe to ship without these; track after launch:

| Item | Why deferred |
| --- | --- |
| Global Workers rate limiting (KV/DO/WAF) | Per-isolate Map is weak but site won’t crash; spam residual risk |
| Zone security headers / CSP polish | Prefer CF zone rules post-cutover |
| GTM Consent Mode deep audit | Ops when analytics owner available |
| Cart-sync signed secret on redirect | Hardening |
| R2 attachment lifecycle + signed URLs | Ops |
| Filter state in URL query params | Product choice: keep clean URLs |
| `next/image` on product cards | Perf nice-to-have |
| Consolidate `framer-motion` / `motion` imports | Bundle tidy |
| Product `aggregateRating` from Woo | SEO nice-to-have |
| Timing-safe revalidate secret compare | Hardening |

---

## 6) Done in code (reference — 2026-07-12+)

| ID | What was fixed |
| --- | --- |
| C1 | Variable listing ATC → **Velg variant** |
| C2 | Multi-item checkout fail-closed |
| C3 | Logged-in checkout SSO |
| C4 | Cart kept on Back after checkout handoff (order-complete clear follow-up) |
| C5 | Contact: email OK then WP fail → still `ok` (no duplicate-mail trap) |
| A1 | Archive `visibility: CATALOG` |
| A2 | Client archive `MAX_PAGES` |
| A3 | PDP breadcrumbs from server |
| A4 | Null price sort/filter |
| A5 | OOS **Utsolgt** |
| A7 | Removed bad power ÷10 heuristic |
| SEO | Rolling `priceValidUntil`; variation availability aggregate |
| Perf | PDP prerender + 7-day ISR (webhook primary) |
| S2 | Contact open-relay closed |
| Auth | Signup/password-reset Turnstile + rate limits |
| P1 | Search index fetch only when open |
| S1 partial | `.dev.vars` gitignored + untracked (**rotate still Ops**) |
| S5 | Public APIs no longer leak upstream `details` |
| P2 | `package.json` `"build": "node scripts/build.js"` for OpenNext CI |
| Cutover docs | www, `/cartdata`, exclusions, secrets matrix |

---

## 7) Suggested order for tomorrow morning

1. Finish **image path + StaticPicture** wiring → local build smoke.  
2. Commit + deploy Worker; smoke on workers.dev.  
3. Rotate/set secrets + `CONTACT_RECIPIENT_OVERRIDE` + Turnstile prod keys.  
4. Enable WP WC AJAX + revalidate snippets; align all PB secrets.  
5. www redirect → exclusions → `/cartdata` check → catch-all.  
6. Full purchase + contact + auth + webhook + warm + sitemap.  
7. Run §3 functional QA on live domain.  
8. Only then announce / ads / Search Console push.

**Rollback:** remove `peisbutikken.no/*` Worker route.

---

## Related docs

- [`docs/runbooks/cloudflare-release-preflight.md`](runbooks/cloudflare-release-preflight.md) — **canonical** build/review/deploy preflight (`npm run release:check`, `release:build:verify`)
- [`docs/runbooks/domain-cutover-checklist.md`](runbooks/domain-cutover-checklist.md) — route-by-route cutover
- [`CLOUDFLARE.md`](../CLOUDFLARE.md) — Worker env, bindings, OpenNext path
- [`docs/seo/sgtm-hetzner-cartdata-setup.md`](seo/sgtm-hetzner-cartdata-setup.md) — Hetzner `/cartdata` sGTM (external)
- [`docs/wordpress/snippets/`](wordpress/snippets/) — WP PHP snippets
- [`docs/seo/metadata-system-checklist.md`](seo/metadata-system-checklist.md) — metadata when adding routes
- Tinify map / script: `scripts/tinify-image-map.json`, `scripts/tinify-to-avif-webp.mjs`
