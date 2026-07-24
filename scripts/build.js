#!/usr/bin/env node
/**
 * Build script:
 * - Cloudflare Workers CI → OpenNext build (deploy expects `.open-next/`)
 * - Vercel / local → plain `next build`
 *
 * Important: do NOT key off generic `CI=true` — Vercel also sets that and must
 * not run the OpenNext Cloudflare builder.
 */
// Intentional CommonJS for `node scripts/build.js` without ESM package context.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Node CJS entry
const { execSync } = require("child_process");

const isVercel = process.env.VERCEL === "1";
const useOpenNext =
  !isVercel &&
  (process.env.WORKERS_CI === "1" ||
    process.env.OPENNEXT_BUILD === "1" ||
    process.env.CF_PAGES === "1");

const cmd = useOpenNext ? "npx opennextjs-cloudflare build" : "next build";

execSync(cmd, { stdio: "inherit" });
