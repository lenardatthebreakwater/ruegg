#!/usr/bin/env node
/**
 * OpenNext build-only + Wrangler dry-run. NEVER deploys / publishes / populates R2.
 *
 * Windows: invokes WSL bash scripts/build-verify-linux-wsl.sh
 * Linux:   runs that script directly
 *
 *   node scripts/release-build-verify.mjs
 *   node scripts/release-build-verify.mjs --help
 *   node scripts/release-build-verify.mjs --dry-run
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const bashScriptRel = "scripts/build-verify-linux-wsl.sh";

const HELP = `
release:build:verify — Linux/WSL OpenNext build + wrangler deploy --dry-run

Safety:
  - NEVER runs a real publish (wrangler deploy without --dry-run is forbidden)
  - NEVER runs OpenNext deploy / R2 populate / cache prune
  - Sets PB_WRANGLER_DRY_RUN=1 so wrangler.jsonc bare-publish gate allows dry-run
  - Temp copy only under WSL $HOME/pb-frontend-verify (known path; safe to replace)
  - Does not delete OneDrive project files or Windows node_modules

Stages:
  LOCAL  — this Node wrapper (Windows or Linux)
  WSL    — bash ${bashScriptRel} (Linux build tree)

Options:
  --help, -h   Show this help
  --dry-run    Print how WSL would be invoked; do not start the build

Production deploy remains separate:
  bash scripts/deploy-linux-wsl.sh   (explicit authorization required)
`.trim();

function parseArgs(argv) {
  const opts = { help: false, dryRun: false };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") opts.help = true;
    else if (arg === "--dry-run") opts.dryRun = true;
    else {
      console.error(`Unknown option: ${arg}\n\n${HELP}`);
      process.exit(2);
    }
  }
  return opts;
}

function assertNoDeployArgs(argv) {
  const banned = argv.some(
    (a) =>
      a === "deploy" ||
      a === "--deploy" ||
      a === "--publish" ||
      a === "--execute",
  );
  if (banned) {
    console.error(
      "[release:build:verify] Refusing arguments that look like deploy/publish. This command is build-only.",
    );
    process.exit(2);
  }
}

function main() {
  assertNoDeployArgs(process.argv.slice(2));
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(HELP);
    process.exit(0);
  }

  console.log("[release:build:verify] BUILD-ONLY + DRY-RUN (no production mutation)");
  console.log(`[release:build:verify] Stage LOCAL: platform=${process.platform}`);

  if (process.platform === "win32") {
    const wslArgs = ["bash", bashScriptRel];
    console.log(
      `[release:build:verify] Stage WSL: wsl ${wslArgs.join(" ")} (cwd → project via WSL path)`,
    );
    if (opts.dryRun) {
      console.log("[release:build:verify] --dry-run: would invoke WSL as above; exiting 0");
      process.exit(0);
    }
    const result = spawnSync("wsl", wslArgs, {
      cwd: root,
      env: process.env,
      stdio: "inherit",
      shell: false,
    });
    if (result.error) {
      console.error(
        `[release:build:verify] Failed to spawn wsl: ${result.error.message}\n` +
          "Install/enable WSL, or run from Linux: bash scripts/build-verify-linux-wsl.sh",
      );
      process.exit(1);
    }
    process.exit(result.status ?? 1);
  }

  // Linux / other Unix: run bash script in-repo
  console.log(`[release:build:verify] Stage LINUX: bash ${bashScriptRel}`);
  if (opts.dryRun) {
    console.log("[release:build:verify] --dry-run: would run bash script; exiting 0");
    process.exit(0);
  }
  const result = spawnSync("bash", [bashScriptRel], {
    cwd: root,
    env: process.env,
    stdio: "inherit",
    shell: false,
  });
  if (result.error) {
    console.error(`[release:build:verify] Failed to spawn bash: ${result.error.message}`);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}

main();
