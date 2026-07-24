---
name: cloudflare-release-preflight
description: >-
  Runs Peisbutikken Cloudflare/OpenNext release review and preflight gates:
  read-only Cloudflare checks, quick local gates, WSL build-only verification,
  browser smoke, and authorized deploy preparation. Use when the user asks for
  release review, production readiness, Cloudflare preflight, build verification,
  deploy preparation, or OpenNext dry-run validation. No GitHub Actions CI —
  gates are local (release:check / release:build:verify); deploy is manual WSL.
---

# Cloudflare release preflight

Canonical detail: [`docs/runbooks/cloudflare-release-preflight.md`](../../../docs/runbooks/cloudflare-release-preflight.md).

Read that runbook at the start of any release/preflight task. This skill is the short enforcement layer.

## Source control & deploy

- **No GitHub Actions / no GitHub-hosted CI/CD.** Do not recreate `.github/workflows`.
- **GitHub** = code backup only. Release gates = local `npm run release:check` / `npm run release:build:verify`.
- **Authoritative deploy** = manual WSL OpenNext (`bash scripts/deploy-linux-wsl.sh`). Workers Builds dashboard is historical / non-authoritative.

## Hard rules

1. **Read-only first.** Default to review + local gates. No deploy, route/DNS edits, cache purge/prune execute, secret writes, or production mutations unless the user **explicitly authorizes that action in the same message**.
2. **Subagent model** comes from the project Cursor rule (`cursor-grok-4.5-high-fast`). Do **not** add a conflicting model-selection rule here.
3. **Staged subagents** with **non-overlapping file ownership** (see runbook templates). Parent synthesizes; avoid parallel edits to the same files.
4. **No deployment without explicit authorization.** Prefer `npm run release:check` and `npm run release:build:verify`. Never treat bare `wrangler deploy` as the production path. Never require GitHub Actions.
5. **Full catalogue UX invariant** (`/shop` complete compact dataset, instant client filters, full R2 populate on real deploy). Any chunking/partial-SSR proposal needs explicit user approval.
6. **Final synthesis + evidence** required: commands, exit codes, sizes, MCP findings, GO/NO-GO, remaining authorizations.

Never print secrets, Application Passwords, or API tokens.

## Scope modes

| Mode | Do |
| --- | --- |
| review-only | MCP Builds/Bindings/Observability + docs; no writes |
| quick gates | `npm run release:check` |
| clean WSL build-only | `npm run release:build:verify` |
| browser smoke | Playwright Edge; no checkout/form side effects |
| production deploy | Only if authorized → `RELEASE_NOTES='…' bash scripts/deploy-linux-wsl.sh` |
| post-deploy verification | Smoke (incl. apex `npm run smoke:pdps`) + bindings + observability retention |

## Commands

```bash
npm run release:check
npm run release:check -- --help
npm run release:build:verify
npm run release:build:verify -- --help
# Authorized production only (notes required):
RELEASE_NOTES='Short summary' bash scripts/deploy-linux-wsl.sh
```

`release:build:verify` must remain build + `wrangler deploy --dry-run` only (no publish, no OpenNext deploy, no R2 populate).

## Release notes + version + SHA + tag

Before authorized WSL deploy: require a **clean** commit whose `package.json` version is the semver you intend to ship, plus non-empty `RELEASE_NOTES` (or TTY prompt). Optional `RELEASE_BUMP=patch|minor|major` bumps version + CHANGELOG then **stops** for commit/re-run so the shipped SHA matches. After OpenNext deploy **and** smoke succeed, `deploy-linux-wsl.sh` writes `docs/releases/REGISTRY.md` + `last-deploy.json` (and a `tmp/opennext-logs/` copy), inserts a dated `CHANGELOG.md` section if missing, and creates a local annotated git tag `vX.Y.Z` (no auto-push). Failed smoke never tags. See runbook § “Release version, notes, SHA, and tag”.

## Live Cloudflare caveats (verify each time)

- **Authoritative ship path** is local WSL OpenNext — not GitHub Actions, not Workers Builds. If reviewing historical Workers Builds config, Deploy command must be OpenNext (`npm run deploy:opennext`), never bare `npx wrangler deploy`.
- Observability may show **no retained events** until after a good authorized deploy — do not claim “zero CPU errors” without data.
- Confirm DO/R2 bindings match `wrangler.jsonc`.

## Evidence checklist

- [ ] Mode stated; safety constraints respected
- [ ] Gate results (typecheck/lint/tests/lockfile/diff/shop size) via **local** `release:check` / `release:build:verify`
- [ ] Build-verify gzip + dry-run notes (if in scope)
- [ ] Live bindings + observability (if in scope); Workers Builds only if explicitly reviewing dashboard history
- [ ] Browser smoke items (if in scope)
- [ ] Clean commit/SHA status (dirty tree called out)
- [ ] For deploy prep: intended semver + RELEASE_NOTES plan + post-ship tag `vX.Y.Z` reminder
- [ ] GO/NO-GO + what still needs human authorization for WSL deploy

## Related

- [`CLOUDFLARE.md`](../../../CLOUDFLARE.md)
- [`.cursor/rules/shop-complete-archive-dataset.mdc`](../../rules/shop-complete-archive-dataset.mdc)
- [`docs/perf/cloudflare-product-cache-runbook.md`](../../../docs/perf/cloudflare-product-cache-runbook.md)
