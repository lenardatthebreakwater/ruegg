/**
 * Generate lib/redirects/legacy-rankmath-redirects.ts from a RankMath
 * Redirections CSV export (RankMath → Redirections → Export CSV).
 *
 * Usage:
 *   node scripts/generate-legacy-redirects.mjs <path-to-csv>
 *
 * What it does / skips (see docs/runbooks/domain-cutover-checklist.md §3b):
 * - Skips rows covered by the generic pattern rules in next.config.ts
 *   (Shopify /products/<slug> → /produkt/<slug> 1:1, collections product
 *   URLs, /brands/* → /brand/*, brand pagination, /en + /pl prefixes,
 *   /collections/peiser prefix).
 * - Skips /wp-content/* rows — that path stays excluded to WordPress, so
 *   RankMath keeps serving those redirects.
 * - Skips rows whose source/destination contain "…" (U+2026): the RankMath
 *   export truncates long slugs. Re-export those from the DB
 *   (wp_rank_math_redirections) and re-run.
 * - Skips /cart — the cutover plan locks /cart → / in next.config.ts.
 * - On duplicate sources with different destinations, the row with the
 *   highest id (newest) wins.
 *
 * Sources are emitted WITH a trailing slash: with `trailingSlash: true`
 * Next.js 301s slash-less non-file requests to the slashed URL before custom
 * redirects run, so only the slashed form ever reaches these rules.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/generate-legacy-redirects.mjs <path-to-csv>");
  process.exit(1);
}
const outPath = resolve(repoRoot, "lib/redirects/legacy-rankmath-redirects.ts");

/** Minimal CSV parser (quoted fields, embedded commas). */
function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  return rows;
}

const [header, ...rows] = parseCsv(readFileSync(resolve(repoRoot, csvPath), "utf8"));
const col = Object.fromEntries(header.map((name, i) => [name, i]));

const SITE = "https://peisbutikken.no";
const ELLIPSIS = "\u2026";

function isFileLike(path) {
  const last = path.replace(/\/+$/, "").split("/").pop() ?? "";
  return last.includes(".");
}

/** "/foo/bar" → "/foo/bar/" (non-file paths only), preserving #fragment. */
function ensureTrailingSlash(path) {
  const [base, fragment] = path.split("#");
  if (isFileLike(base) || base.endsWith("/")) return path;
  return `${base}/${fragment !== undefined ? `#${fragment}` : ""}`;
}

function normalizeSource(raw) {
  let path = raw.trim();
  let query = "";
  const qIndex = path.indexOf("?");
  if (qIndex !== -1) {
    query = path.slice(qIndex + 1);
    path = path.slice(0, qIndex);
  }
  path = `/${path.replace(/^\/+/, "")}`;
  return { path: ensureTrailingSlash(path), query };
}

function normalizeDestination(raw) {
  let dest = raw.trim();
  if (dest.startsWith(SITE)) dest = dest.slice(SITE.length);
  if (dest === "" || dest === "/") return "/";
  return ensureTrailingSlash(dest);
}

/** Rows made redundant by the generic pattern rules in next.config.ts. */
function coveredByGenerics(sourcePath, dest) {
  let m;
  if ((m = sourcePath.match(/^\/products\/([^/]+)\/$/))) return dest === `/produkt/${m[1]}/`;
  if ((m = sourcePath.match(/^\/product\/([^/]+)\/$/))) return dest === `/produkt/${m[1]}/`;
  if ((m = sourcePath.match(/^\/collections\/[^/]+\/products\/([^/]+)\/$/)))
    return dest === `/produkt/${m[1]}/`;
  if ((m = sourcePath.match(/^\/brands\/([^/]+)\/$/))) return dest === `/brand/${m[1]}/`;
  if ((m = sourcePath.match(/^\/brand\/([^/]+)\/page\/\d+\/$/))) return dest === `/brand/${m[1]}/`;
  if (/^\/(en|pl)(\/|$)/.test(sourcePath)) return true; // hardcoded prefix rules
  if (/^\/collections\/peiser(\/|$)/.test(sourcePath)) return true; // hardcoded prefix rules
  return false;
}

const stats = {
  total: 0,
  emitted: 0,
  generic: 0,
  wpContent: 0,
  corrupted: [],
  cart: 0,
  duplicates: 0,
  conflicts: [],
};

/** keyed by source path (+ query marker) — later ids overwrite earlier ones */
const bySource = new Map();

for (const row of rows) {
  const id = Number(row[col.id]);
  const rawSource = row[col.source];
  const rawDest = row[col.destination];
  stats.total++;

  if (rawSource.includes(ELLIPSIS) || rawDest.includes(ELLIPSIS)) {
    stats.corrupted.push(id);
    continue;
  }
  if (/^\/?wp-content\//.test(rawSource)) {
    stats.wpContent++;
    continue;
  }

  const { path: sourcePath, query } = normalizeSource(rawSource);
  const dest = normalizeDestination(rawDest);

  if (sourcePath === "/cart/") {
    stats.cart++;
    continue;
  }
  if (coveredByGenerics(sourcePath, dest)) {
    stats.generic++;
    continue;
  }
  if (sourcePath === dest) continue; // self-redirect, drop

  const entry = { source: sourcePath, destination: dest, permanent: true };
  if (query) {
    // Only exact single-param queries are supported (RankMath matched full URLs).
    const params = new URLSearchParams(query);
    const pairs = [...params.entries()];
    // Ignore Shopify tracking params (_pos/_fid/_ss) — path-only match is correct.
    const meaningful = pairs.filter(([k]) => !k.startsWith("_"));
    if (meaningful.length > 0) {
      entry.has = meaningful.map(([key, value]) => ({ type: "query", key, value }));
    } else if (coveredByGenerics(sourcePath, dest)) {
      stats.generic++;
      continue;
    }
  }

  const key = `${sourcePath}${entry.has ? `?${JSON.stringify(entry.has)}` : ""}`;
  const existing = bySource.get(key);
  if (existing) {
    stats.duplicates++;
    if (existing.entry.destination !== dest) {
      stats.conflicts.push(
        `${sourcePath}: id ${existing.id} → ${existing.entry.destination}  REPLACED BY  id ${id} → ${dest}`
      );
    }
    if (id < existing.id) continue; // keep newest
  }
  bySource.set(key, { id, entry });
}

const entries = [...bySource.values()]
  .sort((a, b) => a.entry.source.localeCompare(b.entry.source))
  .map(({ entry }) => entry);
stats.emitted = entries.length;

const banner = `// GENERATED FILE — do not edit by hand.
// Source: RankMath Redirections CSV export, regenerated via:
//   node scripts/generate-legacy-redirects.mjs <csv>
// Generated: ${new Date().toISOString().slice(0, 10)} — ${stats.emitted} entries
// (${stats.generic} rows are covered by generic pattern rules in next.config.ts,
// ${stats.wpContent} wp-content rows stay on WordPress, ${stats.corrupted.length} rows
// were skipped as corrupted/truncated in the export.)

import type { Redirect } from "next/dist/lib/load-custom-routes";

export const legacyRankMathRedirects: Redirect[] = ${JSON.stringify(entries, null, 2)};
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, banner);

console.log(`Wrote ${stats.emitted} redirects to lib/redirects/legacy-rankmath-redirects.ts`);
console.log(`  total rows:            ${stats.total}`);
console.log(`  covered by generics:   ${stats.generic}`);
console.log(`  wp-content (stay WP):  ${stats.wpContent}`);
console.log(`  /cart (locked → /):    ${stats.cart}`);
console.log(`  duplicate sources:     ${stats.duplicates}`);
if (stats.conflicts.length) {
  console.log(`  conflicting duplicates resolved (newest id wins):`);
  for (const c of stats.conflicts) console.log(`    - ${c}`);
}
if (stats.corrupted.length) {
  console.log(
    `  CORRUPTED rows skipped (truncated "…" in export) — re-export these from the DB:`
  );
  console.log(`    ids: ${stats.corrupted.join(", ")}`);
}
