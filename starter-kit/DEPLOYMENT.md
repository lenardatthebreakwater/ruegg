# Deploying Next.js to Cloudflare Workers — Playbook

Lessons learned from deploying christianiakakkelovner.no (Next.js 16 + Velite
+ OpenNext + Cloudflare Workers, built locally on Windows). Following this
from day 1 turns a ~1 hour debugging session into a ~10 minute deploy.

Stack this applies to: **Next.js (App Router) → @opennextjs/cloudflare →
Cloudflare Workers**, with D1 for storage and Brevo for transactional email.

---

## TL;DR checklist for a new project

1. `npm i -D @opennextjs/cloudflare@latest wrangler@latest`
2. Copy `wrangler.jsonc`, `open-next.config.ts` and the `package.json`
   scripts from this repo; change `name`, domain, D1 binding.
3. Build script MUST be `next build --webpack` (not Turbopack — see #1).
4. `open-next.config.ts` MUST use `staticAssetsIncrementalCache` if you use
   Velite/MDX or want prerendered pages served as-is (see #2).
5. No `opengraph-image.tsx` / `ImageResponse` — generate a static
   `public/opengraph-image.png` with the sharp script instead (see #3).
6. Set `NEXT_PUBLIC_SITE_URL` to the production domain in `.env.local`
   BEFORE building (it is inlined at build time).
7. `npx wrangler login` → `npm run deploy` → smoke test on workers.dev.
8. Secrets: `echo <value> | npx wrangler secret put BREVO_API_KEY`.
   Non-secrets go in `wrangler.jsonc` → `"vars"`.
9. Domain cutover LAST: delete old A/AAAA/CNAME records for `@` and `www`
   in the dashboard first (keep MX/TXT!), then deploy with `routes` (see #5).

---

## The four issues that cost the most time

### 1. Turbopack builds break at runtime on Workers (upstream adapter bug)

**Symptom:** every server-rendered route returns 500;
`ChunkLoadError: Failed to load chunk server/chunks/...` and
`ComponentMod.handler is not a function` in the Worker logs. The build
itself succeeds — the failure only shows after deploying.

**Fix:** build with webpack:

```json
"build": "velite && next build --webpack"
```

**Root cause (verified against the issue tracker, not Windows-related):**
Turbopack is nominally supported by @opennextjs/cloudflare since v1.15, but
Next.js 16.2.x + adapter 1.19/1.20 hits a known bug — see
[opennextjs-cloudflare#1258](https://github.com/opennextjs/opennextjs-cloudflare/issues/1258)
("Turbopack handler delegation"). Linux/macOS users report the identical
errors, so building in WSL does NOT avoid this. Re-test Turbopack when a
fixed adapter version ships — Turbopack builds are ~2x faster.

Related: always deploy with wrangler >= 4.33 (older versions miscompile the
worker and produce the same 500s — see
[opennextjs-cloudflare#1286](https://github.com/opennextjs/opennextjs-cloudflare/issues/1286)),
and never deploy OpenNext output to Cloudflare **Pages** — Workers only.

### 2. Anything using `eval` / `new Function` crashes on Workers

**Symptom:** `EvalError: Code generation from strings disallowed for this
context`. In our case: Velite compiles MDX to a code string that
`mdx-content.tsx` evaluates with `new Function(code)` — fine in Node, fatal
on Workers.

**Fix:** make sure every such page is fully prerendered (SSG via
`generateStaticParams`) and configure OpenNext to serve prerendered pages
from static assets so they are never re-rendered at request time:

```ts
// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
```

Notes:
- `opennextjs-cloudflare deploy` populates the cache assets automatically.
- For local testing with `wrangler dev`, run
  `npx opennextjs-cloudflare populateCache local` first — or just use
  `npm run preview`, which does everything.
- Trade-off: this cache is read-only, so no ISR/revalidation. Fine for
  fully static marketing sites; a content change = rebuild + redeploy.

### 3. `opengraph-image.tsx` (next/og) breaks the Worker bundle

**Symptom:** `wrangler deploy` fails with `Could not resolve
".../resvg.wasm"` / `yoga.wasm` (mangled paths — a Windows path bug in the
OpenNext bundler).

**Fix:** don't use dynamic OG images at all. Generate a static PNG once with
sharp (`scripts/generate-og-image.mjs` in this repo: brand photo + gradient
+ logo → `public/opengraph-image.png`) and point `siteConfig.ogImage` at the
file. Cheaper at runtime, too.

Unlike #1, this one IS Windows-specific (the mangled paths have stripped
backslashes) — building on Linux/WSL would likely tolerate `next/og`. The
static PNG is still the better choice: zero runtime cost and no WASM in the
bundle.

### 4. Custom-domain attach fails while old DNS records exist

**Symptom:** deploy reports `Some triggers failed to deploy`; the API
returns 409 `Hostname already has externally managed DNS records`.

**Why it can't be automated:** wrangler's OAuth login has **no DNS scope**
(verified — there is no `dns_records` scope in `wrangler login
--scopes-list`), so neither wrangler nor its token can delete zone records.

**Fix (manual, 1 minute):** in the Cloudflare dashboard → zone → DNS →
Records, delete the old A/AAAA/CNAME records for `@` and `www` only.
**Never touch MX/TXT** (email, SPF/DKIM, site verifications). Then deploy
with routes in `wrangler.jsonc`:

```jsonc
"workers_dev": true,   // keep the workers.dev preview URL!
"routes": [
  { "pattern": "example.no", "custom_domain": true },
  { "pattern": "www.example.no", "custom_domain": true }
]
```

Cloudflare creates Worker-managed DNS records and certificates itself.
Gotcha: adding `routes` without `"workers_dev": true` silently disables the
workers.dev URL on the next deploy.

---

## Smaller gotchas

- **Windows file locks:** after `wrangler dev`, stray `workerd` processes
  keep `.open-next\assets` locked → the next build fails with `EPERM`.
  Fix: `Get-Process workerd | Stop-Process -Force`, then rebuild.
- **`wrangler tail` is flaky on Windows** (libuv assertion crash). Use the
  dashboard's Workers Observability (enable `"observability"` in
  `wrangler.jsonc`) or the Cloudflare observability MCP instead.
- **D1 in production = native binding, no token.** In server actions, get it
  via `getCloudflareContext({ async: true })` from `@opennextjs/cloudflare`
  (see `app/actions/contact.ts`). The D1 HTTP API + token is only needed as
  a fallback for `next dev`. Create the DB and table before first deploy.
- **Env vars:** `NEXT_PUBLIC_*` are baked in at build time from
  `.env.local`. Runtime config lives in `wrangler.jsonc` `"vars"`; secrets
  via `wrangler secret put`. `.dev.vars` is for `wrangler dev` only.
- **Brevo:** if the account has an authorised-IP allowlist, sends from
  Cloudflare's egress IPs may be blocked — disable it at
  app.brevo.com/security/authorised_ips.
- **Boilerplate cleanup before first deploy:** delete the starter's
  `opengraph-image.tsx` and placeholder `logo.svg` early; they bite at
  deploy time, not dev time.
- **Deploy order that avoids surprises:** deploy to workers.dev → curl-smoke
  every route (incl. redirects) → test the form end-to-end (check D1 row +
  email) → only then cut over the domain.
- **Post-launch:** submit the sitemap in Google Search Console immediately
  so 301s from the old site are picked up.

## Building on Windows vs WSL2 vs CI

OpenNext itself warns it is "not fully compatible with Windows". Score card
from this deployment — what a Linux build environment does and doesn't fix:

| Issue | Fixed by building on Linux/WSL? |
|---|---|
| Turbopack chunk errors (#1) | No — upstream adapter bug, OS-independent |
| MDX `new Function` EvalError (#2) | No — Workers runtime restriction |
| OG image WASM path mangling (#3) | Yes — Windows path bug |
| `EPERM` locks from stray `workerd` processes | Yes — Windows-only |
| Custom-domain DNS dance (#4) | No — permissions, not platform |

Building on Windows works with the fixes in this playbook. This project
additionally has a **working WSL2 build pipeline** set up (see below) — the
source stays in the OneDrive folder, dev happens on Windows, deploys happen
from WSL with `npm run deploy:wsl`.

### The WSL2 setup used here (project stays in OneDrive)

Building directly in the shared `/mnt/c/...` OneDrive folder from WSL does
NOT work reliably. Approaches tried, in order:

1. **`npm install` from WSL in the shared folder** — breaks Windows dev: npm
   installs only the *current* platform's binaries (esbuild, sharp, workerd),
   so each install deletes the other OS's binaries. drvfs is also ~10x
   slower for `node_modules` I/O.
2. **ext4 bind mounts over `node_modules`/`.next`/`.wrangler`** — clever but
   fragile: OpenNext `rm -rf`s `.open-next` at build start (fails on a
   mountpoint with `EBUSY`, so that one can't be mounted), and with
   `.open-next` left on NTFS, **OneDrive itself takes locks on the build
   output** and the next build dies with `EACCES`/"used by another process".
   Abandoned.
3. **Mirror-and-build (what we use):** `scripts/wsl-deploy.sh` rsyncs the
   source (excluding `.git`, `node_modules`, build outputs) into a
   Linux-native dir (`~/ck-build/src`), then runs `npm install` + the full
   build + deploy there. OneDrive never sees build artifacts, Windows
   `node_modules` is never touched, everything runs at ext4 speed. The
   mirror is incremental, so subsequent deploys are fast.

One-time setup:

```powershell
wsl -e bash scripts/wsl-setup.sh    # nvm + Node 24 inside WSL
# wrangler auth: copy the Windows OAuth config into WSL (no new login):
#   %APPDATA%\xdg.config\.wrangler\config\default.toml
#   -> WSL ~/.config/.wrangler/config/default.toml
```

Routine deploys — from any Windows terminal in the project root:

```powershell
npm run deploy:wsl
```

Gotchas discovered while setting this up:

- **Shell scripts must be LF.** With `core.autocrlf` on Windows, a checkout
  can turn them CRLF and bash in WSL chokes. `.gitattributes` pins
  `*.sh text eol=lf`.
- **Windows' node leaks into WSL via PATH** (`/mnt/c/Program Files/nodejs/`).
  Always source nvm first (`scripts/wsl-deploy.sh` does).
- **wrangler auth sharing caveat:** Windows and WSL now share a refresh
  token — if one side refreshes it, the other may eventually need
  `npx wrangler login` again.
- **miniflare needs ext4:** running `opennextjs-cloudflare deploy` (which
  boots miniflare to read bindings) from `/mnt/c` fails with
  `SQLITE_IOERR_SHMOPEN` — SQLite shared memory doesn't work on drvfs.
  Another reason for the mirror approach.
- `npm ci` may fail in WSL with "Missing: @emnapi/... from lock file" if the
  lockfile was generated on Windows — run `npm install` once instead; it
  adds the Linux-only optional deps to the lockfile.
- `.env.local` is intentionally NOT excluded from the rsync mirror —
  `NEXT_PUBLIC_SITE_URL` must be present at build time.

Do **not** wire GitHub Actions for deploy in Peisbutikken-derived projects unless
the team explicitly changes policy. Prefer manual Linux/WSL OpenNext deploy
(same pattern as `scripts/deploy-linux-wsl.sh` / `npm run deploy:opennext`).

## Files to copy into the next project

| File | Purpose |
|---|---|
| `wrangler.jsonc` | Worker config: assets, D1, vars, routes, observability |
| `open-next.config.ts` | Static-assets incremental cache |
| `package.json` scripts (`build`, `preview`, `deploy`) | Webpack build + OpenNext pipeline |
| `scripts/generate-og-image.mjs` | Static OG image generation |
| `app/actions/contact.ts` | D1 binding + Brevo pattern with dev fallbacks |
| `.gitignore` additions | `.open-next/`, `.wrangler/`, `.dev.vars`, `/data` |

## Files to copy into the next project (WSL pipeline)

| File | Purpose |
|---|---|
| `scripts/wsl-setup.sh` | nvm + Node install inside WSL |
| `scripts/wsl-deploy.sh` | rsync mirror to ext4 + build + deploy (`deploy:wsl`) |
| `.gitattributes` | keeps `*.sh` LF so bash in WSL can run them |

## Routine deploys after setup

```bash
npm run deploy:wsl    # RECOMMENDED: mirror to WSL ext4, build + deploy on Linux
npm run deploy        # same, but on Windows (works with playbook fixes)
npm run preview       # build + serve locally in the Workers runtime
```
