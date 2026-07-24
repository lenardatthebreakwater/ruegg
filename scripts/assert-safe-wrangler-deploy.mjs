#!/usr/bin/env node
/**
 * Wrangler custom-build gate: block bare `wrangler deploy` that skips OpenNext
 * R2 incremental-cache population.
 *
 * Allowed when:
 * - WRANGLER_COMMAND is not a publish path (dev / types)
 * - PB_OPENNEXT_DEPLOY=1 (set by scripts/deploy-opennext.mjs / WSL deploy)
 * - PB_WRANGLER_DRY_RUN=1 (set by release:build:verify)
 *
 * Note: Workers Builds does not honor wrangler.jsonc `build.command`. Dashboard
 * Deploy command must still be `npm run deploy:opennext` — this gate hardens
 * local / CLI accidents.
 */

import process from "node:process";

const cmd = (process.env.WRANGLER_COMMAND || "").trim().toLowerCase();
const openNextDeploy = process.env.PB_OPENNEXT_DEPLOY === "1";
const dryRun = process.env.PB_WRANGLER_DRY_RUN === "1";

// Non-publish Wrangler entrypoints
if (!cmd || cmd === "dev" || cmd === "types") {
  process.exit(0);
}

if (openNextDeploy || dryRun) {
  process.exit(0);
}

console.error(
  [
    "ERROR: Bare Wrangler publish is blocked for peisbutikken-frontend.",
    "It skips OpenNext R2 incremental-cache population (catalogue/ISR risk).",
    "",
    "Use the OpenNext path instead:",
    "  npm run deploy:opennext          (Linux / Workers Builds)",
    "  bash scripts/deploy-linux-wsl.sh (Windows workstation)",
    "",
    "Workers Builds (dashboard — required one-time fix):",
    "  Cloudflare → Workers & Pages → peisbutikken-frontend → Settings → Builds",
    "  Deploy command = npm run deploy:opennext",
    "  (not: npx wrangler deploy)",
    "",
    "Dry-run only: PB_WRANGLER_DRY_RUN=1 npx wrangler deploy --dry-run",
  ].join("\n"),
);
process.exit(1);
