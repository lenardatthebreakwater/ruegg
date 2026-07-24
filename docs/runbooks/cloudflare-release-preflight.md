# Cloudflare release preflight (canonical)

**Purpose:** Repeatable human + agent routine for reviewing, building, and (only when authorized) deploying `peisbutikken-frontend` to Cloudflare Workers via OpenNext.

## Source control & deploy

- **No GitHub Actions / no GitHub-hosted CI/CD.** Do not add `.github/workflows`.
- **GitHub** is code storage / safety backup only.
- **Release gates are local:** `npm run release:check` and `npm run release:build:verify` (WSL).
- **Authoritative production deploy:** `bash scripts/deploy-linux-wsl.sh` (manual, authorized). Cloudflare Workers Builds may exist in the dashboard historically — it is **not** the ship path.

**Related**

- Deploy/env overview: [`CLOUDFLARE.md`](../../CLOUDFLARE.md)
- Product cache ops: [`docs/perf/cloudflare-product-cache-runbook.md`](../perf/cloudflare-product-cache-runbook.md)
- Domain cutover routes: [`docs/runbooks/domain-cutover-checklist.md`](domain-cutover-checklist.md)
- Launch checklist (dated): [`docs/release-review-pre-launch.md`](../release-review-pre-launch.md)
- Shop dataset invariant: [`.cursor/rules/shop-complete-archive-dataset.mdc`](../../.cursor/rules/shop-complete-archive-dataset.mdc)
- Agent skill: [`.cursor/skills/cloudflare-release-preflight/SKILL.md`](../../.cursor/skills/cloudflare-release-preflight/SKILL.md)

---

## Hard safety (non-negotiable)

Do **not** perform any of the following unless the user **explicitly authorizes that action in the same message**:

| Action | Examples |
| --- | --- |
| Production deploy | `npm run deploy`, `deploy:opennext`, `scripts/deploy-linux-wsl.sh`, bare `wrangler deploy` |
| Route / DNS / zone mutation | Workers Routes, catch-all, Redirect Rules |
| Cache mutation | `cache:prune-r2:execute`, Cache Purge API, Servebolt flush |
| Secret / var writes | `wrangler secret put`, dashboard Variables & Secrets edits |
| Production writes | revalidate webhooks that change live cache, contact/checkout side effects |

**Default mode is read-only / local gates.** Prefer:

- `npm run release:check` — local quick gates (no deploy)
- `npm run release:build:verify` — WSL/Linux OpenNext **build-only** + Wrangler **`--dry-run`** (no publish, no R2 populate)

Production deploy remains a **separate** explicit path (see § Scope: production deploy).

Never print Application Passwords, API tokens, or secret values in chat or logs.

---

## Scope modes

Pick one mode before starting. Do not escalate without authorization.

| Mode | Goal | Typical commands | Mutates prod? |
| --- | --- | --- | --- |
| **review-only** | Read docs/code/live config; synthesize findings | MCP Builds/Bindings/Observability (read), `wrangler` read-only | No |
| **quick gates** | Fast local correctness | `npm run release:check` | No |
| **clean WSL build-only** | Prove OpenNext packaging on Linux | `npm run release:build:verify` | No |
| **browser smoke** | UX/runtime smoke on local or `workers.dev` / apex | Playwright (Edge); **no** checkout/form submit | No (read browsing) |
| **production deploy** | Ship Worker + full R2 populate | `bash scripts/deploy-linux-wsl.sh` (authorized) | **Yes** |
| **post-deploy verification** | Confirm live health after an authorized deploy | Smoke + MCP metrics/logs + revalidate spot-check | Prefer read-only |

---

## Clean commit / SHA (why it matters)

A **clean reviewed commit/SHA** means:

1. One intentional git snapshot of source (no half-finished WIP mixed in).
2. Its SHA uniquely identifies what was built/deployed.
3. Gates (typecheck, lint, tests, build-verify) were run against that tree.
4. Rollback and incident debug are deterministic (“revert to SHA X”).

**Do not commit unless the user asks.** Report dirty tree status (`git status --porcelain`) and recommend commit before production deploy. Deploying an unclean working tree makes “what is live?” unknowable.

`scripts/deploy-linux-wsl.sh` **fails closed** on a dirty tree unless `ALLOW_DIRTY_DEPLOY=1`. After a successful ship it writes release-record files and a local `vX.Y.Z` tag (see § Release version, notes, SHA, and tag).

After any code change that lands after a successful build-verify, **re-run the clean WSL build** before treating the tree as release-ready.

---

## Required gates

### Quick gates — `npm run release:check`

Runs (fail-closed, local unless noted):

1. **npm ci consistency** — `npm ci --dry-run --ignore-scripts` (lockfile must install cleanly; no postinstall)
2. **typecheck** — `npm run typecheck`
3. **lint** — `npm run lint` (must be zero **errors**; warnings are reported)
4. **tests** — `npm test`
5. **git diff check** — `git diff --check` (+ report porcelain dirty state; dirty is a warning, not always a hard fail)
6. **shop cache size** — `npm run measure:shop-cache` (needs GraphQL; fails if over 2 MiB hard limit)

### Build verify — `npm run release:build:verify`

Linux/WSL only packaging proof. See § Build process. Never deploys.

### Before production deploy (authorized)

All of the above green, plus:

- Clean reviewed commit/SHA
- Deploy via WSL OpenNext (`scripts/deploy-linux-wsl.sh`) — not bare Wrangler, not GitHub Actions
- Secrets/bindings checklist reviewed (never print values)
- Browser smoke planned for post-deploy

---

## Complete `/shop` dataset invariant

**Invariant:** `/shop` and product archives ship a **complete compact product-card dataset** (SSR/ISR). Client filters/pagination must stay **instant** against that in-memory set (SWR / local set). Production OpenNext deploy must **fully populate** R2 incremental cache (`--cacheChunkSize=8`, `--rclone` when creds exist).

**Do not** (needs **explicit user approval** before any implementation):

- On-demand card chunking / lazy card-data fetch after filter
- Server-roundtrip filters that replace the local complete set
- Partial archive SSR
- Skip or weaken full R2 upload/populate
- Replace OpenNext deploy with bare `wrangler deploy`

**Allowed:** DOM page windowing, lazy images, slimmer card fields within size budget, better regeneration/SWR.

Measure: `npm run measure:shop-cache` (target ≤ ~1.8 MiB, hard fail > 2.0 MiB).

Rule file: `.cursor/rules/shop-complete-archive-dataset.mdc`.

---

## Build process (Linux / WSL only)

### Why WSL/Linux only

Windows OpenNext production deploys have uploaded successfully then served **SSR `ChunkLoadError`**. Production packaging must run on Linux (WSL / Linux shell) — not Windows, not GitHub Actions.

`npm run deploy` exits immediately on `win32` (`scripts/ensure-linux-deploy.mjs`).

### Build-only command (no deploy)

From Windows project root:

```bash
npm run release:build:verify
```

This Node wrapper invokes WSL and runs `scripts/build-verify-linux-wsl.sh`, which:

1. Labels **LOCAL → WSL** stages clearly
2. Copies source into a **known temp tree** `$HOME/pb-frontend-verify` (safe to replace; does **not** delete OneDrive project files)
3. Excludes `.git`, `.next`, `.open-next`, `node_modules`, `tmp`, `.cursor`, `.env.local`, `.dev.vars`
4. Pulls only selected public build env keys (GraphQL URL, etc.) — never dumps secrets
5. Runs `node scripts/run-opennext-loud.mjs build`
6. Runs `npx wrangler deploy --dry-run` (publish forbidden; script fails closed if `--dry-run` missing)
7. Prints Worker gzip / binding summary from dry-run output

**Help:** `npm run release:build:verify -- --help`

### Generated `.open-next/worker.js` import suppression

`cloudflare-worker.ts` imports `./.open-next/worker.js`, which exists only **after** OpenNext build. Clean trees lack that file during `tsc`.

Use `@ts-ignore` (not `@ts-expect-error`): local trees that already have a prior build would make `@ts-expect-error` an unused-directive failure. This is intentional.

### Expected DO local warning

During Next/OpenNext build, workerd may warn that Durable Object bindings are missing **locally**. That is an **expected warning**, not a production blocker. Live DOs are provisioned via `wrangler.jsonc` migrations (`DOQueueHandler`, `DOShardedTagCache`).

### OpenNext dry-run expectations

From dry-run / prior successful verifies:

| Check | Expectation |
| --- | --- |
| Worker gzip size | Historically ~4.4 MiB; must stay under Workers 10 MiB gzip limit |
| Bindings | `NEXT_INC_CACHE_R2_BUCKET`, `CONTACT_ATTACHMENTS_R2`, `CONTACT_SUBMISSIONS_DB`, `NEXT_CACHE_DO_QUEUE`, `NEXT_TAG_CACHE_DO_SHARDED`, `ASSETS`, `IMAGES`, `WORKER_SELF_REFERENCE` |
| Publish | **None** — dry-run only |
| R2 populate | **Not** run in build-verify (populate is deploy-only) |

### After code changes post-build

If source changes after a green `release:build:verify`, treat the prior artifact as stale and **re-run** build-verify before release.

---

## Browser smoke checklist

Use Playwright + MS Edge (`user-playwright` MCP). Prefer `workers.dev` or local preview when avoiding apex side effects.

**Cover (read-only interactions):**

- [ ] Home
- [ ] `/shop/` — full catalog loads; filters feel instant (no card refetch storm)
- [ ] PDP
- [ ] Header / nav
- [ ] Cart drawer open/close (do **not** complete checkout)
- [ ] Search open + results
- [ ] Theme toggle
- [ ] Contact page render (do **not** submit form / upload)
- [ ] Account pages render (do **not** mutate password/profile)
- [ ] Mobile viewport pass

**Avoid side effects:** no paid checkout, no contact submit, no password reset, no revalidate webhook storms, no cache prune.

---

## Cloudflare live read-only checks

Prefer MCP (discover schemas first):

| Server | Use |
| --- | --- |
| `plugin-cloudflare-cloudflare-builds` | Build/deploy command, recent build outcomes |
| `plugin-cloudflare-cloudflare-bindings` | DO/R2/service bindings |
| `plugin-cloudflare-cloudflare-observability` | Logs, CPU/memory, Error 1102 |

Wrangler read-only fallbacks (never print tokens):

```bash
npx wrangler deployments list --name peisbutikken-frontend
npx wrangler tail peisbutikken-frontend   # live stream only; optional
```

### Workers Builds (historical — not authoritative)

This project has **no GitHub Actions CI**. Production deploys are **manual WSL OpenNext** (`scripts/deploy-linux-wsl.sh`).

A Cloudflare **Workers Builds** dashboard entry may still exist. Do **not** treat it (or GitHub) as a release gate. If a dashboard build is ever triggered, Deploy command must be `npm run deploy:opennext` — never bare `npx wrangler deploy` (that skips R2 incremental-cache population). As of 2026-07-17 the live Deploy command was still bare Wrangler; leave it alone unless someone intentionally uses Workers Builds.

**In-repo hardening** (local / WSL path):

| Guard | What it does |
| --- | --- |
| `npm run deploy` / `deploy:opennext` → `scripts/deploy-opennext.mjs` | Canonical OpenNext path; refuses Windows; fails if `.open-next/worker.js` missing; sets `PB_OPENNEXT_DEPLOY=1`; conditional `--rclone` |
| `wrangler.jsonc` → `build.command` = `assert-safe-wrangler-deploy.mjs` | Blocks bare local `wrangler deploy` / `versions upload` unless OpenNext/dry-run env is set |

### Observability caveat

`wrangler.jsonc` enables Workers Observability (logs ~10%, traces ~5%). A recent read-only check found **no retained events** for the live Worker over ~7 days, so CPU / memory / 1102 cannot be proven from logs yet.

**After next authorized deploy:** verify Logs/metrics retain events; watch `exceededCpu`, `exceededMemory`, and client Error **1102**. Absence of retained events ≠ absence of errors.

---

## Secret rotation & environment / binding checklist

**Never print secret values.** Confirm presence/names only.

### Runtime / build (dashboard or Wrangler secrets)

- [ ] `NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL` (build + runtime)
- [ ] `NEXT_PUBLIC_SITE_URL=https://peisbutikken.no`
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (build-time) + `TURNSTILE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_GTM_*` (if analytics required — baked at build)
- [ ] `PRODUCT_REVALIDATE_SECRET` / `SEARCH_INDEX_REBUILD_SECRET`
- [ ] `AUTH_SESSION_SECRET`, `WORDPRESS_AUTH_SHARED_SECRET`
- [ ] Contact: `CONTACT_*`, D1 `CONTACT_SUBMISSIONS_DB`, `CONTACT_EMAIL_API_TOKEN` (prefer over overloading `CLOUDFLARE_API_TOKEN`)
- [ ] Shipping / side-cart secrets aligned with WP snippets
- [ ] Historical `.dev.vars` leakage → treat as compromised until rotated

### Bindings (`wrangler.jsonc`)

- [ ] R2 `NEXT_INC_CACHE_R2_BUCKET` → `peisbutikken-next-inc-cache-weur`
- [ ] R2 `CONTACT_ATTACHMENTS_R2` → `peisbutikken-contact-attachments`
- [ ] D1 `CONTACT_SUBMISSIONS_DB` → `peisbutikken-contact-submissions`
- [ ] DO `NEXT_CACHE_DO_QUEUE` → `DOQueueHandler` (migration `v1`)
- [ ] DO `NEXT_TAG_CACHE_DO_SHARDED` → `DOShardedTagCache` (migration `v2`)
- [ ] `ASSETS`, `IMAGES`, `WORKER_SELF_REFERENCE`
- [ ] `keep_vars: true` preserved

Workstation R2 populate creds (`.dev.vars`, never commit): `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `CF_ACCOUNT_ID` / `CLOUDFLARE_ACCOUNT_ID` — scoped to **inc-cache** bucket, not contact bucket.

---

## Release version, notes, SHA, and tag

Every production ship records **semver + git SHA + UTC time + notes**, then tags after smoke.

| Artifact | Role |
| --- | --- |
| `package.json` `version` | Semver for the commit being deployed (baseline `0.1.0`) |
| `CHANGELOG.md` | Keep a Changelog; `[Unreleased]` plus dated `## [X.Y.Z] - YYYY-MM-DD` |
| `docs/releases/REGISTRY.md` | Append-friendly human deploy log |
| `docs/releases/last-deploy.json` | Machine-readable last ship (`version`, `gitSha`, `gitShaShort`, `releasedAt`, `branch`, `notes`) |
| git tag `vX.Y.Z` | Annotated tag on the shipped SHA (created **only after** OpenNext deploy + smoke) |

**Operator flow (recommended):**

1. Bump version in the release commit (e.g. edit `package.json` or `RELEASE_BUMP=patch` once — see below), draft bullets under `CHANGELOG.md` `[Unreleased]` if useful, commit clean tree.
2. Run authorized deploy with notes:
   ```bash
   RELEASE_NOTES='Short summary; Another bullet' bash scripts/deploy-linux-wsl.sh
   ```
3. After smoke succeeds, the script writes registry / `last-deploy.json` / CHANGELOG section (if missing), copies JSON under `tmp/opennext-logs/`, and creates local annotated tag `vX.Y.Z`. It does **not** auto-push the tag — push when you want (`git push origin vX.Y.Z`).
4. Commit the updated `CHANGELOG.md` + `docs/releases/*` when ready.

**Env vars**

| Var | Meaning |
| --- | --- |
| `RELEASE_NOTES` | Required non-empty notes (`;` or newlines → bullets). Interactive TTY prompt if unset; non-interactive without it **fails**. |
| `RELEASE_BUMP=patch\|minor\|major` | Runs `npm version --no-git-tag-version`, updates CHANGELOG Unreleased→version, then **aborts** so you commit and re-run (SHA must match ship). |
| `ALLOW_DIRTY_DEPLOY=1` | Override clean-tree check (not recommended). |

Failed deploys / failed smoke **do not** create tags or finalize the registry timestamp.

## Production deploy (authorized only)

**Workstation path (required on Windows hosts):**

```bash
RELEASE_NOTES='…' bash scripts/deploy-linux-wsl.sh
```

That script: release preflight on Windows/git side (clean tree, version, notes, SHA) → Linux copy → OpenNext build → OpenNext deploy with `--cacheChunkSize=8` and `--rclone` when R2 API creds exist → smoke `*.workers.dev` → **apex PDP smoke (≥5 products)** → finalize registry/CHANGELOG/tag → prune stale R2 prefixes.

**Linux shell (already on Linux, authorized — same OpenNext path):**

```bash
npm run deploy:opennext
```

`deploy:opennext` also runs apex PDP smoke after publish. Preserve full R2 upload/population. Do **not** switch production to bare `wrangler deploy`. Do **not** add GitHub Actions to automate this.

### Post-deploy smoke

- [ ] `https://peisbutikken-frontend.<account>.workers.dev/` `/shop/` `/kontakt-oss/` → 200 + Next markers
- [ ] **Automated (deploy scripts):** `npm run smoke:pdps` — ≥5 curated PDPs on `https://peisbutikken.no` → HTTP 200 + Next markers + Product JSON-LD (exit non-zero fails the deploy)
- [ ] Apex (if routes live): home, shop filters, cart open, search
- [ ] Revalidate webhook returns ok **and** pages actually refresh
- [ ] Observability: confirm events appear; scan exceededCpu / exceededMemory / 1102
- [ ] Optional: `npm run warm` against production (authorized traffic)

### Rollback

| Layer | Action |
| --- | --- |
| Bad Worker version | Cloudflare deployments → rollback to previous Version ID / redeploy last known-good SHA via OpenNext |
| Bad routing | Delete catch-all Workers Route `peisbutikken.no/*` → WP serves site again (see domain-cutover checklist) |
| Bad cache | Prefer revalidate; prune only with `cache:prune-r2:execute` when authorized |

---

## Expected warnings vs blockers

| Signal | Class |
| --- | --- |
| DO missing / workerd warnings during **local** build | Expected warning |
| OpenNext / Next deprecation warnings in loud log | Usually warning (review; do not ignore unknown failures) |
| `ChunkLoadError` after Windows deploy | **Blocker** — redeploy from Linux |
| Bare `wrangler deploy` (any path) | **Blocker** for catalogue/ISR correctness — use WSL OpenNext / `deploy:opennext` only |
| Shop aggregate > 2 MiB | **Blocker** |
| Typecheck / lint errors / failing tests | **Blocker** |
| Lockfile `npm ci --dry-run` failure | **Blocker** |
| Zero observability retention | Caveat (cannot clear CPU/1102) — fix after deploy |
| OneDrive / `.next` growth / orphan workerd | Local ops (see below) — not necessarily ship blockers |

---

## Local dev instability notes

| Issue | Guidance |
| --- | --- |
| OneDrive locks | Prefer WSL mirror for OpenNext; avoid building `.open-next` on synced NTFS when possible |
| `.next` growth | Safe to delete local `.next` for recovery; do not delete unrelated user data |
| `generateStaticParams` / long static generation | Builds wait on WordPress GraphQL; expect multi-minute static page phases |
| workerd / miniflare warnings | Often local-only; confirm against live bindings |
| Orphan Node/workerd | After failed preview/deploy, check Task Manager / `Get-Process` for stuck `workerd`/`node` locking `.open-next` |
| PowerShell + Unix `head` | **Do not** use `head` in PowerShell; use Read tool or `Get-Content -TotalCount` (see `.cursor/rules/windows-no-head-terminals.mdc`) |

---

## Subagent delegation templates

Follow project rule: Task `model` must be `cursor-grok-4.5-high-fast` (do not restate conflicting model rules in skills).

**Avoid parallel edit conflicts:** give each subagent **non-overlapping file ownership**. Parent synthesizes.

### Template A — Quick gates (no edits)

```text
Mode: quick gates only. No deploy, no commit, no Cloudflare writes.
Run npm run release:check from repo root.
Return: pass/fail per gate, dirty git porcelain summary, shop MiB + product count.
Do not modify files.
```

### Template B — Build verify (no deploy)

```text
Mode: clean WSL build-only. No deploy/publish/R2 populate/cache prune.
Run npm run release:build:verify (or --help first).
Return: exit code, Worker gzip size, binding notes, expected vs unexpected warnings, log path under tmp/opennext-logs if present.
Do not modify application source.
```

### Template C — Live Cloudflare read-only

```text
Mode: review-only. MCP Builds + Bindings + Observability. No mutations.
Confirm deploy command, DO/R2 bindings, observability retention, any exceededCpu/Memory/1102 evidence.
Never print secrets.
```

### Template D — Browser smoke

```text
Mode: browser smoke. Playwright MS Edge. Read-only: no checkout, no form submit.
Checklist: home, shop+filters, PDP, header, cart open, search, theme, contact render, account render, mobile.
Return pass/fail per item + screenshots only if useful.
```

### Ownership boundaries (when code fixes are authorized)

| Agent | Owns (example) | Must not touch |
| --- | --- | --- |
| Archive/shop | `app/shop/**`, `components/product-archive/**`, `lib/graphql/server-products.ts` | `wrangler.jsonc`, deploy scripts |
| Deploy/tooling | `scripts/*deploy*`, `scripts/release-*`, `package.json` scripts, `CLOUDFLARE.md` | Product UI components |
| Cloudflare worker entry | `cloudflare-worker.ts`, `open-next.config.ts`, `wrangler.jsonc` | Shop filter UI |
| Docs/skills | `docs/runbooks/**`, `.cursor/skills/**` | Runtime app code |

Parent merges results and produces final synthesis with evidence (commands, exit codes, sizes, MCP findings).

---

## Commands cheat sheet

| Intent | Command |
| --- | --- |
| Quick gates | `npm run release:check` |
| Quick gates help | `npm run release:check -- --help` |
| Build-only + dry-run | `npm run release:build:verify` |
| Build-verify help | `npm run release:build:verify -- --help` |
| Shop size only | `npm run measure:shop-cache` |
| Local OpenNext build (Windows ok for non-prod) | `npm run build:cloudflare` |
| Production deploy (authorized, WSL) | `RELEASE_NOTES='…' bash scripts/deploy-linux-wsl.sh` |
| Production deploy (authorized, Linux) | `npm run deploy` / `npm run deploy:opennext` |
| R2 prune dry-run | `npm run cache:prune-r2` |
| R2 prune execute (authorized) | `npm run cache:prune-r2:execute` |

---

## Final synthesis template (agents)

```markdown
## Mode
[review-only | quick gates | build-only | browser smoke | deploy | post-deploy]

## Evidence
- Gates (local release:check / release:build:verify): …
- Build/dry-run: gzip … bindings …
- Live CF: DO/R2 … observability … (Workers Builds only if reviewing historical dashboard)
- Browser: …

## Verdict
GO / NO-GO for [commit | deploy | cutover]

## Blockers / caveats
- …

## Explicit authorizations still required
- …
```
