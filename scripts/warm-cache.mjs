/**
 * Post-deploy cache warmer.
 *
 * Reads the site's own sitemap index, collects every URL, and requests each
 * one at limited concurrency so the on-demand ISR cache (R2 on Cloudflare) is
 * populated before real visitors or crawlers hit cold pages. Deploys reset
 * the cache (it is keyed by build ID), so run this after every deploy:
 *
 *   npm run warm                                  # defaults to https://peisbutikken.no
 *   npm run warm -- https://preview.example.dev   # any other base URL
 *   WARM_CONCURRENCY=4 npm run warm               # be gentler on WordPress
 *
 * Concurrency is deliberately low: cold pages trigger GraphQL requests to
 * WordPress, and this script must never hammer the live store.
 */

const DEFAULT_BASE_URL = "https://peisbutikken.no";
const DEFAULT_CONCURRENCY = 6;
const REQUEST_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;

const baseUrl = (process.argv[2] ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
const concurrency = clampInt(process.env.WARM_CONCURRENCY, DEFAULT_CONCURRENCY, 1, 20);

function clampInt(raw, fallback, min, max) {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function extractTagValues(xml, tag) {
  const pattern = new RegExp(`<${tag}>([^<]+)</${tag}>`, "g");
  return [...xml.matchAll(pattern)].map((match) => match[1].trim());
}

/** Rewrites sitemap-declared URLs onto the target base (lets you warm previews). */
function toTargetUrl(url) {
  const parsed = new URL(url);
  return `${baseUrl}${parsed.pathname}${parsed.search}`;
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

async function collectUrls() {
  const indexResponse = await fetchWithTimeout(`${baseUrl}/sitemap.xml`);
  if (!indexResponse.ok) {
    throw new Error(`Failed to fetch sitemap index: ${indexResponse.status}`);
  }
  const indexXml = await indexResponse.text();
  const childSitemaps = extractTagValues(indexXml, "loc").map(toTargetUrl);

  const urls = new Set();
  for (const sitemapUrl of childSitemaps) {
    const response = await fetchWithTimeout(sitemapUrl);
    if (!response.ok) {
      console.warn(`! Skipping ${sitemapUrl} (${response.status})`);
      continue;
    }
    const xml = await response.text();
    for (const loc of extractTagValues(xml, "loc")) {
      urls.add(toTargetUrl(loc));
    }
  }
  return [...urls];
}

async function warmUrl(url) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        headers: { "user-agent": "pb-cache-warmer/1.0" },
        redirect: "manual",
      });
      // Drain the body so the connection can be reused.
      await response.arrayBuffer();
      if (response.status < 500) {
        return { url, status: response.status };
      }
      if (attempt === MAX_RETRIES) {
        return { url, status: response.status };
      }
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        return { url, status: 0, error: error instanceof Error ? error.message : String(error) };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
  }
  return { url, status: 0 };
}

async function main() {
  console.log(`Warming ${baseUrl} (concurrency ${concurrency})`);
  const startedAt = Date.now();
  const urls = await collectUrls();
  console.log(`Found ${urls.length} URLs in sitemap`);

  let completed = 0;
  const failures = [];
  const queue = [...urls];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;
      const result = await warmUrl(url);
      completed++;
      if (result.status >= 400 || result.status === 0) {
        failures.push(result);
      }
      if (completed % 100 === 0 || completed === urls.length) {
        console.log(`  ${completed}/${urls.length} warmed (${failures.length} failures)`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
  console.log(`Done in ${elapsedSeconds}s: ${urls.length - failures.length} ok, ${failures.length} failed`);
  for (const failure of failures.slice(0, 20)) {
    console.log(`  FAILED ${failure.status || "network"} ${failure.url}${failure.error ? ` (${failure.error})` : ""}`);
  }
  if (failures.length > 20) {
    console.log(`  ...and ${failures.length - 20} more`);
  }
  process.exitCode = failures.length > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
