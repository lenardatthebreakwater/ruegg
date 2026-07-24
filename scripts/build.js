#!/usr/bin/env node
/**
 * Build script: in CI (e.g. Cloudflare) run full OpenNext build so deploy finds .open-next/.
 * Locally, run plain next build for faster iteration.
 */
// Intentional CommonJS for `node scripts/build.js` without ESM package context.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Node CJS entry
const { execSync } = require("child_process");

const isCI = process.env.CI === "true" || process.env.WORKERS_CI === "1";
const cmd = isCI ? "npx opennextjs-cloudflare build" : "next build";

execSync(cmd, { stdio: "inherit" });
