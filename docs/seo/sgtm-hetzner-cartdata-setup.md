# Hetzner sGTM setup (production path: `peisbutikken.no/cartdata`)

**Audience:** whoever configures the Hetzner server-side GTM (sGTM) container and Cloudflare edge routing.  
**Date:** 2026-07-14 (mechanism locked: proxy Worker, Stape same-origin pattern)  
**Out of scope:** In-app cookie consent / Consent Mode code (owned by the storefront team).

---

## Goal

Serve first-party tagging from **`https://peisbutikken.no/cartdata/*`** on Hetzner, while:

- the **Next.js Worker** owns the storefront catch-all, and
- **WordPress on Servebolt** owns checkout / GraphQL / `wp-*` exclusions.

`data.ny.peisbutikken.no` (CNAME → Stape) is **test only**. Production noscript
and loader must use the apex `/cartdata` path.

---

## Locked mechanism: dedicated proxy Worker

We follow [Stape's same-origin-through-Cloudflare pattern](https://stape.io/helpdesk/documentation/how-to-use-same-origin-through-cloudflare),
adapted for the self-hosted Hetzner container: a tiny Worker (`pb-sgtm-proxy`)
on the Workers Route `peisbutikken.no/cartdata*` strips the `/cartdata` prefix
and proxies to the Hetzner origin.

Why this and not the alternatives:

| Approach | Result |
| --- | --- |
| Workers Route catch-all `peisbutikken.no/*` → Next only | Next swallows `/cartdata` — **broken** |
| Workers Route exclusion `/cartdata*` → Worker: **None** | Falls through to **Servebolt WordPress** — wrong origin |
| Origin Rule alone | Never runs — the Next catch-all Worker intercepts **before** origin resolution |
| **Proxy Worker on `/cartdata*`** | Correct — Workers picks the **most specific** route, so it beats `/*` |

Because the proxy route is independent of the Next catch-all, it can (and
should) go live **before** the domain cutover: today `/cartdata/*` just 404s on
WordPress, so nothing breaks, and tracking can be smoke-tested early.

---

## Step-by-step

### Step 1 — Hetzner origin hostname + TLS

1. In the Cloudflare zone `peisbutikken.no` → DNS, add:
   - `A` record `sgtm` → `<Hetzner IPv4>` — **DNS only (grey cloud)**.
   - Optional `AAAA` for IPv6.
2. On the Hetzner server, issue a valid TLS certificate for
   `sgtm.peisbutikken.no` (Let's Encrypt via the container stack's reverse
   proxy — Caddy/nginx/Traefik — or the sGTM docker image's built-in
   auto-SSL if it has one). Grey-cloud + real cert keeps the Worker's upstream
   fetch a plain, verifiable HTTPS call — no Cloudflare SSL-mode edge cases.
3. Make sure the container answers on that hostname:

   ```bash
   curl -sI "https://sgtm.peisbutikken.no/healthz"          # or /gtm.js?id=GTM-XXXX
   ```

   Any non-TLS-error response means routing + cert are fine.

> Alternative: if you prefer the `sgtm` record **proxied** (orange cloud), you
> must also add a Configuration Rule (URI Path starts with `/cartdata` → SSL:
> Full (strict)) exactly as in Stape's guide, and the Hetzner cert must still
> be valid. Grey cloud is simpler; the hostname is only used by the Worker.

### Step 2 — sGTM container config

1. In the **server** GTM container (tagmanager.google.com → server container →
   Container Settings), ensure the container URL
   `https://sgtm.peisbutikken.no` is listed. Preview/debug runs against this
   direct URL; production traffic arrives via `/cartdata` with the prefix
   already stripped.
2. Add/enable the **"Google Tag Manager: Web Container"** client in the server
   container and whitelist the web container ID (`GTM-…`). This is what serves
   `/gtm.js` and `/ns.html` from the sGTM host — without it the loader URL
   404s.
3. Confirm the GA4 client is enabled (default paths `/g/collect` etc.).

### Step 3 — Create the proxy Worker

Create a Worker named **`pb-sgtm-proxy`** (dashboard Quick Edit is fine; it
never changes with frontend deploys). Code:

```js
const UPSTREAM_HOST = "sgtm.peisbutikken.no";
const PUBLIC_PREFIX = "/cartdata";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // /cartdata → /, /cartdata/gtm.js → /gtm.js, /cartdata/g/collect → /g/collect
    const upstreamPath =
      url.pathname === PUBLIC_PREFIX
        ? "/"
        : url.pathname.startsWith(`${PUBLIC_PREFIX}/`)
          ? url.pathname.slice(PUBLIC_PREFIX.length)
          : url.pathname;

    const upstreamUrl = `https://${UPSTREAM_HOST}${upstreamPath}${url.search}`;
    const upstreamRequest = new Request(upstreamUrl, request);

    // Preserve visitor context for GA4 geo/IP and debugging.
    const clientIp = request.headers.get("CF-Connecting-IP");
    if (clientIp) upstreamRequest.headers.set("X-Forwarded-For", clientIp);
    upstreamRequest.headers.set("X-Forwarded-Host", url.hostname);
    upstreamRequest.headers.set("X-Forwarded-Proto", "https");

    return fetch(upstreamRequest);
  },
};
```

### Step 4 — Add the Workers Route

Zone `peisbutikken.no` → Workers Routes:

- Route: `peisbutikken.no/cartdata*` → Worker: **pb-sgtm-proxy**.
- Do **not** add a `www` variant — `www` 301s to apex before Workers run
  (see the cutover checklist §3d).

This route coexists with the future `peisbutikken.no/*` → `peisbutikken-frontend`
catch-all; Cloudflare always picks the most specific matching route.

### Step 5 — Web GTM container

In the **web** GTM container, point the Google tag / GA4 configuration's
`server_container_url` / transport URL at:

```text
https://peisbutikken.no/cartdata
```

(Stape note applies even self-hosted: the transport URL must be on the **exact
hostname the page runs on** — apex, not `www`, not a subdomain.)

### Step 6 — Storefront env vars (Next.js Worker)

Standard self-hosted loader (no Stape Custom Loader power-up):

```text
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GTM_SCRIPT_URL=https://peisbutikken.no/cartdata/gtm.js
NEXT_PUBLIC_GTM_SCRIPT_QUERY=id=GTM-XXXXXXX
NEXT_PUBLIC_GTM_NOSCRIPT_URL=https://peisbutikken.no/cartdata/ns.html
```

`NEXT_PUBLIC_GTM_SCRIPT_QUERY` **must** be set to `id=GTM-…` here: the
component's fallback (`?GTM-…` without `id=`) only fits Stape's custom-loader
URL format, not stock `gtm.js`. If the Hetzner container serves an
obfuscated/custom loader filename instead, use that filename and its query.

### Step 7 — Smoke tests

Run after Step 4, and **again** right after the Next catch-all goes live at
cutover:

```bash
# Loader serves JS via the first-party path (expect 200, content-type javascript)
curl -sI "https://peisbutikken.no/cartdata/gtm.js?id=GTM-XXXXXXX"

# Noscript page (expect 200, HTML)
curl -sI "https://peisbutikken.no/cartdata/ns.html?id=GTM-XXXXXXX"

# Unknown path should 4xx from sGTM (NOT a WordPress/Next 404 page)
curl -s "https://peisbutikken.no/cartdata/definitely-not-a-thing" | head -c 300
```

Then open sGTM **Preview** (against `https://sgtm.peisbutikken.no`), load the
storefront, and confirm a `page_view` and one ecommerce event (`add_to_cart`)
arrive and forward to GA4.

### Step 8 — Retire the test host

Once apex `/cartdata` is healthy in production:

- [ ] Remove `data.ny.peisbutikken.no` from web GTM / any hardcoded snippets.
- [ ] Delete the `data.ny` CNAME (→ `eue.stape.net`) from DNS.

---

## Checklist (condensed)

- [ ] `sgtm.peisbutikken.no` A record (grey cloud) + valid TLS on Hetzner.
- [ ] sGTM container: container URL + Web Container client (serves `gtm.js`/`ns.html`) + GA4 client.
- [ ] Worker `pb-sgtm-proxy` deployed (code above).
- [ ] Workers Route `peisbutikken.no/cartdata*` → `pb-sgtm-proxy`.
- [ ] Web GTM transport URL = `https://peisbutikken.no/cartdata`.
- [ ] Next Worker env: `NEXT_PUBLIC_GTM_*` per Step 6 (public vars need a rebuild/deploy).
- [ ] Smoke tests pass before cutover — and re-run after the catch-all goes live.
- [ ] Test host `data.ny` retired after launch.

---

## Related

- Domain cutover (Worker vs WP exclusions): `docs/runbooks/domain-cutover-checklist.md`
- Stape same-origin reference: <https://stape.io/helpdesk/documentation/how-to-use-same-origin-through-cloudflare>
- Storefront GTM env examples: `.env.example`, `CLOUDFLARE.md`
