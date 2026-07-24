/**
 * Converts all raster images under public/images/ to AVIF via the TinyPNG
 * (Tinify) API and writes them alongside the originals (same name, .avif).
 *
 * Intentionally NOT converted (compatibility):
 *  - public/opengraph-image.png  (social scrapers don't support AVIF)
 *  - public/logo.png             (JSON-LD logo for Google)
 *  - app/icon.png, app/apple-icon.png (favicons must be PNG)
 *
 * Usage:  TINIFY_API_KEY=<key> node scripts/convert-to-avif.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const KEY = process.env.TINIFY_API_KEY;
if (!KEY) {
  console.error("Set TINIFY_API_KEY environment variable first.");
  process.exit(1);
}
const AUTH = "Basic " + Buffer.from(`api:${KEY}`).toString("base64");

const ROOT = process.cwd();
const IMAGE_DIR = path.join(ROOT, "public", "images");
const RASTER = /\.(png|jpe?g|webp)$/i;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? walk(p) : RASTER.test(e.name) ? [p] : [];
    }),
  );
  return files.flat();
}

async function convertOne(file) {
  const input = await readFile(file);

  const shrink = await fetch("https://api.tinify.com/shrink", {
    method: "POST",
    headers: { Authorization: AUTH },
    body: input,
  });
  if (shrink.status !== 201) {
    throw new Error(`shrink ${shrink.status}: ${await shrink.text()}`);
  }
  const outputUrl = shrink.headers.get("location");

  const conv = await fetch(outputUrl, {
    method: "POST",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({ convert: { type: "image/avif" } }),
  });
  if (!conv.ok) {
    throw new Error(`convert ${conv.status}: ${await conv.text()}`);
  }
  const avif = Buffer.from(await conv.arrayBuffer());

  const outFile = file.replace(RASTER, ".avif");
  await writeFile(outFile, avif);
  return {
    file: path.relative(ROOT, file),
    before: input.length,
    after: avif.length,
    count: conv.headers.get("compression-count"),
  };
}

const files = await walk(IMAGE_DIR);
console.log(`Converting ${files.length} images to AVIF...\n`);

let beforeTotal = 0;
let afterTotal = 0;
let failed = 0;
let lastCount = "?";

// Modest concurrency to be kind to the API.
const CONCURRENCY = 4;
const queue = [...files];
async function worker() {
  while (queue.length > 0) {
    const file = queue.shift();
    try {
      const r = await convertOne(file);
      beforeTotal += r.before;
      afterTotal += r.after;
      lastCount = r.count ?? lastCount;
      const pct = ((1 - r.after / r.before) * 100).toFixed(0);
      console.log(
        `ok   ${r.file}  ${(r.before / 1024).toFixed(0)} KB -> ${(r.after / 1024).toFixed(0)} KB  (-${pct}%)`,
      );
    } catch (err) {
      failed++;
      console.error(`FAIL ${path.relative(ROOT, file)}: ${err.message}`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

console.log(
  `\nDone. ${files.length - failed}/${files.length} converted, ` +
    `${(beforeTotal / 1024 / 1024).toFixed(1)} MB -> ${(afterTotal / 1024 / 1024).toFixed(1)} MB. ` +
    `API compression count this month: ${lastCount}`,
);
if (failed > 0) process.exit(1);
