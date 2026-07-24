#!/usr/bin/env node
/**
 * Non-destructive release quick gates.
 *
 *   node scripts/release-check.mjs
 *   node scripts/release-check.mjs --help
 *   node scripts/release-check.mjs --skip-shop-cache
 *
 * Never deploys. Never prints secrets. Fail-closed on gate failures.
 */

import { spawnSync } from "node:child_process";
import process from "node:process";

const HELP = `
release:check — local quick gates (no deploy, no Cloudflare writes)

Steps:
  1. npm ci --dry-run --ignore-scripts  (lockfile consistency)
  2. npm run typecheck
  3. npm run lint
  4. npm test
  5. git diff --check          (+ dirty tree report; dirty is WARN)
  6. npm run measure:shop-cache (needs GraphQL; omit with --skip-shop-cache)

Options:
  --help, -h           Show this help
  --skip-shop-cache    Skip shop archive size measurement
  --dry-run            Print planned steps only (do not execute)

Exit codes:
  0  all required gates passed
  1  a required gate failed
  2  usage / unexpected error
`.trim();

function parseArgs(argv) {
  const opts = {
    help: false,
    skipShopCache: false,
    dryRun: false,
  };
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") opts.help = true;
    else if (arg === "--skip-shop-cache") opts.skipShopCache = true;
    else if (arg === "--dry-run") opts.dryRun = true;
    else {
      console.error(`Unknown option: ${arg}\n\n${HELP}`);
      process.exit(2);
    }
  }
  return opts;
}

/** Windows npm/git are often `.cmd` shims; shell is required to resolve PATH. */
const USE_SHELL = process.platform === "win32";

function run(label, command, args, { optional = false } = {}) {
  console.log(`\n==> [LOCAL] ${label}`);
  console.log(`    $ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    shell: USE_SHELL,
  });
  const status = result.status ?? 1;
  if (result.error) {
    console.error(`[release:check] failed to spawn ${command}: ${result.error.message}`);
    return { ok: false, status: 1 };
  }
  if (status !== 0) {
    if (optional) {
      console.warn(`[release:check] WARN: ${label} exited ${status} (non-blocking)`);
      return { ok: true, status, warn: true };
    }
    console.error(`[release:check] FAIL: ${label} exited ${status}`);
    return { ok: false, status };
  }
  console.log(`[release:check] PASS: ${label}`);
  return { ok: true, status: 0 };
}

function reportGitDirtiness() {
  console.log(`\n==> [LOCAL] git working tree status (informational)`);
  const porcelain = spawnSync("git", ["status", "--porcelain"], {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: USE_SHELL,
  });
  if (porcelain.error || porcelain.status !== 0) {
    console.warn("[release:check] WARN: could not read git status --porcelain");
    return;
  }
  const text = (porcelain.stdout || "").trim();
  if (!text) {
    console.log("[release:check] working tree clean");
    return;
  }
  const lines = text.split(/\r?\n/);
  console.warn(
    `[release:check] WARN: dirty working tree (${lines.length} path(s)) — prefer a clean reviewed commit/SHA before production deploy`,
  );
  for (const line of lines.slice(0, 40)) {
    console.warn(`    ${line}`);
  }
  if (lines.length > 40) {
    console.warn(`    … ${lines.length - 40} more`);
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(HELP);
    process.exit(0);
  }

  console.log("[release:check] Non-destructive quick gates");
  console.log("[release:check] Stage: LOCAL (Windows or Linux host)");
  console.log("[release:check] Will NOT deploy, publish, prune R2, or mutate Cloudflare");

  const steps = [
    {
      label: "npm ci consistency (dry-run)",
      command: "npm",
      args: ["ci", "--dry-run", "--ignore-scripts"],
    },
    { label: "typecheck", command: "npm", args: ["run", "typecheck"] },
    { label: "lint", command: "npm", args: ["run", "lint"] },
    { label: "tests", command: "npm", args: ["test"] },
    { label: "git diff --check", command: "git", args: ["diff", "--check"] },
  ];

  if (!opts.skipShopCache) {
    steps.push({
      label: "shop archive cache measure",
      command: "npm",
      args: ["run", "measure:shop-cache"],
    });
  } else {
    console.log("[release:check] skipping shop cache measure (--skip-shop-cache)");
  }

  if (opts.dryRun) {
    console.log("\n[release:check] --dry-run: planned steps only\n");
    for (const step of steps) {
      console.log(`  - ${step.label}: ${step.command} ${step.args.join(" ")}`);
    }
    console.log("  - git status --porcelain (informational)");
    process.exit(0);
  }

  for (const step of steps) {
    const result = run(step.label, step.command, step.args);
    if (!result.ok) process.exit(result.status || 1);
  }

  reportGitDirtiness();

  console.log("\n[release:check] ALL REQUIRED GATES PASSED");
  console.log("[release:check] Next (optional): npm run release:build:verify");
  console.log("[release:check] Production deploy still requires explicit authorization.");
  process.exit(0);
}

main();
