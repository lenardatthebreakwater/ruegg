#!/usr/bin/env node
/**
 * Post-deploy PDP smoke: hit ≥5 real product pages on the Norway apex and
 * fail closed if any look broken (HTTP/error shell/missing product signals).
 *
 *   npm run smoke:pdps
 *   npm run smoke:pdps -- https://peisbutikken.no
 *   SMOKE_BASE_URL=https://peisbutikken.no npm run smoke:pdps
 *
 * Deploy hooks:
 *   - scripts/deploy-linux-wsl.sh (after workers.dev smoke)
 *   - scripts/deploy-opennext.mjs (after OpenNext deploy)
 *
 * Concurrency stays low so WordPress is not hammered on cold ISR.
 */

const DEFAULT_BASE_URL = "https://peisbutikken.no";
const DEFAULT_CONCURRENCY = 1;
const REQUEST_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5_000;
const MIN_BODY_BYTES = 8_000;

/**
 * Curated stable bestsellers from live `/api/products/popular-fireplaces`
 * (Aduro / Nordpeis / Dovre). Prefer full stove PDPs over spare-part SKUs.
 * Override with SMOKE_PDP_SLUGS=slug-a,slug-b,...
 */
const DEFAULT_PDP_SLUGS = [
  "aduro-9-5-lux-bestselger",
  "nordpeis-duo-6",
  "dovre-sense-103-sort-lakk",
  "aduro-1-1sk",
  "nordpeis-me-wall-m-sideglass",
];

const HELP = `
smoke:pdps — post-deploy product detail page verification

Usage:
  node scripts/verify-pdp-smoke.mjs [baseUrl]
  npm run smoke:pdps
  npm run smoke:pdps -- https://peisbutikken.no

Env:
  SMOKE_BASE_URL       Base URL (default: https://peisbutikken.no)
  SMOKE_PDP_SLUGS      Comma-separated slugs (default: curated bestsellers)
  SMOKE_CONCURRENCY    Parallel requests 1–3 (default: 1)

Exit codes:
  0  all PDPs passed
  1  one or more PDPs failed
  2  usage / unexpected error
`.trim();

function clampInt(raw, fallback, min, max) {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function parseSlugs(raw) {
  if (!raw || !String(raw).trim()) return [...DEFAULT_PDP_SLUGS];
  const slugs = String(raw)
    .split(",")
    .map((s) => s.trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);
  return slugs.length > 0 ? slugs : [...DEFAULT_PDP_SLUGS];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, init) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * @param {string} html
 * @param {string} slug
 */
function evaluateBody(html, slug) {
  const reasons = [];
  const bytes = Buffer.byteLength(html, "utf8");

  if (bytes < MIN_BODY_BYTES) {
    reasons.push(`body too small (${bytes} < ${MIN_BODY_BYTES})`);
  }

  const nextish =
    html.includes("__NEXT_DATA__") ||
    html.includes("Peisbutikken") ||
    /\/_next\//i.test(html);
  if (!nextish) {
    reasons.push("missing Next / Peisbutikken markers");
  }

  // Real PDPs emit schema.org Product JSON-LD; not-found shells do not
  // (and may still return HTTP 200 with Next chrome).
  const hasProductLd =
    /"@type"\s*:\s*"Product"/i.test(html) ||
    /"@type"\s*:\s*\[\s*"Product"/i.test(html);
  if (!hasProductLd) {
    reasons.push("missing Product JSON-LD");
  }

  const errorish =
    /Internal Server Error/i.test(html) ||
    /Application error/i.test(html) ||
    /ChunkLoadError/i.test(html) ||
    /Something went wrong/i.test(html);
  if (errorish) {
    reasons.push("error shell markers in body");
  }

  // Soft signal: slug usually appears in canonical / JSON-LD url.
  if (!html.includes(slug)) {
    reasons.push(`slug "${slug}" not found in body`);
  }

  return { ok: reasons.length === 0, bytes, reasons };
}

/**
 * @param {string} baseUrl
 * @param {string} slug
 */
async function checkPdp(baseUrl, slug) {
  const path = `/produkt/${slug}/`;
  const url = `${baseUrl}${path}`;
  let last = {
    slug,
    path,
    url,
    status: 0,
    ok: false,
    bytes: 0,
    attempts: 0,
    reasons: ["no response"],
  };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    last.attempts = attempt;
    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          "user-agent": "pb-pdp-smoke/1.0 (+https://peisbutikken.no)",
          accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });
      const html = await response.text();
      const body = evaluateBody(html, slug);
      last = {
        ...last,
        status: response.status,
        bytes: body.bytes,
        reasons: body.reasons,
        ok: response.status === 200 && body.ok,
      };

      if (response.status !== 200) {
        last.reasons = [`HTTP ${response.status}`, ...body.reasons];
        last.ok = false;
      }

      console.log(
        `PDP ${path} attempt=${attempt} HTTP=${last.status} bytes=${last.bytes} ok=${last.ok}`,
      );

      if (last.ok) return last;
      if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      last = {
        ...last,
        status: 0,
        ok: false,
        reasons: [`network: ${message}`],
      };
      console.log(
        `PDP ${path} attempt=${attempt} HTTP=0 network-error ok=false`,
      );
      if (attempt < MAX_ATTEMPTS) await sleep(RETRY_DELAY_MS);
    }
  }

  return last;
}

async function runPool(items, concurrency, worker) {
  const results = new Array(items.length);
  let index = 0;

  async function run() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current], current);
    }
  }

  const n = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: n }, () => run()));
  return results;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(HELP);
    process.exit(0);
  }

  const baseArg = argv.find((a) => !a.startsWith("-"));
  const baseUrl = (baseArg || process.env.SMOKE_BASE_URL || DEFAULT_BASE_URL)
    .trim()
    .replace(/\/+$/, "");

  if (!/^https?:\/\//i.test(baseUrl)) {
    console.error(`ERROR: invalid base URL: ${baseUrl}`);
    process.exit(2);
  }

  const slugs = parseSlugs(process.env.SMOKE_PDP_SLUGS);
  if (slugs.length < 5) {
    console.error(
      `ERROR: need at least 5 PDP slugs (got ${slugs.length}). Set SMOKE_PDP_SLUGS or use defaults.`,
    );
    process.exit(2);
  }

  const concurrency = clampInt(
    process.env.SMOKE_CONCURRENCY,
    DEFAULT_CONCURRENCY,
    1,
    3,
  );

  console.log(
    `==> PDP smoke: ${slugs.length} products on ${baseUrl} (concurrency ${concurrency})`,
  );
  for (const slug of slugs) {
    console.log(`    /produkt/${slug}/`);
  }

  const results = await runPool(slugs, concurrency, (slug) =>
    checkPdp(baseUrl, slug),
  );

  const failures = results.filter((r) => !r.ok);
  console.log(
    `==> PDP smoke: ${results.length - failures.length}/${results.length} passed`,
  );

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(
        `PDP FAILED ${failure.path} HTTP=${failure.status} — ${failure.reasons.join("; ")}`,
      );
    }
    console.error(
      "ERROR: Post-deploy PDP verification failed — refusing to declare deploy success",
    );
    process.exit(1);
  }

  console.log("==> PDP smoke: all product pages look healthy");
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
