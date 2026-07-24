#!/usr/bin/env node
/**
 * Canonical production deploy: OpenNext build + OpenNext deploy (R2 populate).
 *
 * Never use bare `npx wrangler deploy` for production — it skips cache populate.
 *
 * - Refuses win32 (ChunkLoadError risk) → use scripts/deploy-linux-wsl.sh
 * - Fail-fast if `.open-next/worker.js` is missing after build
 * - Sets PB_OPENNEXT_DEPLOY=1 so wrangler.jsonc build gate allows publish
 * - Uses --cacheChunkSize=8; --rclone only when rclone.js + R2 API creds exist
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

if (process.platform === "win32") {
  console.error(
    [
      "ERROR: Production deploy from Windows is prohibited.",
      "OpenNext SSR on Windows has caused ChunkLoadError in production.",
      "Use WSL instead:",
      "  bash scripts/deploy-linux-wsl.sh",
      "",
      "That path runs opennextjs-cloudflare build + deploy (populates R2 cache).",
      "Do not use bare `npx wrangler deploy` — it skips OpenNext cache population.",
      "",
      "Workers Builds Deploy command must be: npm run deploy:opennext",
    ].join("\n"),
  );
  process.exit(1);
}

function runLoud(args) {
  const result = spawnSync(
    process.execPath,
    ["scripts/run-opennext-loud.mjs", ...args],
    {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    },
  );
  return result.status ?? 1;
}

function assertOpenNextArtifact() {
  const workerJs = path.join(root, ".open-next", "worker.js");
  if (!existsSync(workerJs)) {
    console.error(
      [
        "ERROR: OpenNext output missing after build.",
        `Expected: ${workerJs}`,
        "Refusing to publish — run OpenNext build first, not bare wrangler.",
      ].join("\n"),
    );
    process.exit(1);
  }
}

function canUseRclone() {
  try {
    require.resolve("rclone.js");
  } catch {
    return false;
  }
  const account =
    process.env.CF_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || "";
  return Boolean(
    process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      account,
  );
}

console.log(
  "[deploy:opennext] Canonical OpenNext production deploy (not bare wrangler)",
);

const buildStatus = runLoud(["build"]);
if (buildStatus !== 0) {
  process.exit(buildStatus);
}

assertOpenNextArtifact();

process.env.PB_OPENNEXT_DEPLOY = "1";

const deployArgs = ["deploy", "--cacheChunkSize=8"];
if (canUseRclone()) {
  deployArgs.push("--rclone");
  console.log(
    "[deploy:opennext] Using --rclone for R2 populate (creds + rclone.js present)",
  );
} else {
  console.log(
    "[deploy:opennext] --rclone skipped (missing rclone.js or R2 API creds) — HTTP populate cacheChunkSize=8",
  );
}

const deployStatus = runLoud(deployArgs);
if (deployStatus !== 0) {
  process.exit(deployStatus);
}

// Post-deploy: verify ≥5 real PDPs on the Norway apex (fail closed).
// WSL production path also runs this via scripts/deploy-linux-wsl.sh.
const smokeBase =
  process.env.SMOKE_BASE_URL?.trim().replace(/\/+$/, "") ||
  "https://peisbutikken.no";
console.log(`[deploy:opennext] Apex PDP smoke → ${smokeBase}`);
const smoke = spawnSync(
  process.execPath,
  ["scripts/verify-pdp-smoke.mjs", smokeBase],
  {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  },
);
const smokeStatus = smoke.status ?? 1;
if (smokeStatus !== 0) {
  console.error(
    "[deploy:opennext] ERROR: Apex PDP smoke failed — deploy published but verification failed",
  );
  process.exit(smokeStatus);
}

console.log("[deploy:opennext] SUCCESS: OpenNext deploy + apex PDP smoke passed");
process.exit(0);
