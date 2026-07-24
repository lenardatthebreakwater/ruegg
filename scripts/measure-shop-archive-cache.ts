/**
 * Measure the serialized size of the /shop archive aggregate (same payload
 * written to Next.js unstable_cache). Faster than a full `next build`.
 *
 * Usage:
 *   npx tsx --require ./scripts/stub-server-only.cjs scripts/measure-shop-archive-cache.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getArchiveProductsPage } from "@/lib/graphql/server-products";
import { toArchiveCardProduct } from "@/lib/products/archive-card";
import type { Product } from "@/lib/types/product";

const INITIAL_PAGE_SIZE = 24;
const PAGINATION_PAGE_SIZE = 100;
const MAX_PAGES = 100;
const LIMIT_BYTES = 2 * 1024 * 1024;
const TARGET_BYTES = 1.8 * 1024 * 1024;

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] == null) process.env[key] = value;
    }
  } catch {
    // rely on process env
  }
}

function dedupeProducts(products: Product[]): Product[] {
  const byKey = new Map<string, Product>();
  for (const product of products) {
    const key =
      (typeof product.slug === "string" && product.slug.length > 0
        ? `slug:${product.slug}`
        : null) ??
      (typeof product.id === "string" && product.id.length > 0
        ? `id:${product.id}`
        : null);
    if (!key || byKey.has(key)) continue;
    byKey.set(key, product);
  }
  return [...byKey.values()];
}

/** Same fetch + slim path as /shop unstable_cache, without Next cache context. */
async function loadShopAggregate(): Promise<Product[]> {
  const firstPage = await getArchiveProductsPage({
    first: INITIAL_PAGE_SIZE,
    after: null,
  });

  let products = [...firstPage.products];
  let cursor = firstPage.pageInfo.hasNextPage
    ? firstPage.pageInfo.endCursor
    : null;
  let pagesFetched = 1;

  while (cursor && pagesFetched < MAX_PAGES) {
    const page = await getArchiveProductsPage({
      first: PAGINATION_PAGE_SIZE,
      after: cursor,
    });
    products = dedupeProducts([...products, ...page.products]);
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
    pagesFetched += 1;
    process.stdout.write(`\rpages fetched: ${pagesFetched} (products: ${products.length})`);
  }
  process.stdout.write("\n");

  return dedupeProducts(products).map((product) =>
    toArchiveCardProduct(product, { keepAttributeTermSlugs: false })
  );
}

async function main() {
  loadEnvLocal();
  console.log("Fetching /shop aggregate (all:all:all:no-term-slugs)...");
  const started = Date.now();
  const products = await loadShopAggregate();
  const json = JSON.stringify(products);
  const bytes = Buffer.byteLength(json, "utf8");
  const elapsedMs = Date.now() - started;

  console.log(`products: ${products.length}`);
  console.log(`bytes: ${bytes} (${(bytes / (1024 * 1024)).toFixed(3)} MiB)`);
  console.log(
    `avg bytes/product: ${products.length ? Math.round(bytes / products.length) : 0}`
  );
  console.log(`under 2.0 MiB limit: ${bytes <= LIMIT_BYTES}`);
  console.log(`under 1.8 MiB target: ${bytes <= TARGET_BYTES}`);
  console.log(`elapsed: ${(elapsedMs / 1000).toFixed(1)}s`);

  if (bytes > LIMIT_BYTES) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
