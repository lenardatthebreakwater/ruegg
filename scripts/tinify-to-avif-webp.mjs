/**
 * Local-only: compress every public/ raster via Tinify → AVIF + WebP pairs.
 *
 * Usage:
 *   node --env-file=.env.local scripts/tinify-to-avif-webp.mjs
 *   node --env-file=.env.local scripts/tinify-to-avif-webp.mjs --dry-run
 *   node --env-file=.env.local scripts/tinify-to-avif-webp.mjs --limit=3
 *
 * Phases: (1) convert unique hashes (2) copy aliases to required paths
 * (3) delete unreferenced leftovers.
 */

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");
const MAP_PATH = join(__dirname, "tinify-image-map.json");
const RASTER_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const DELETE_WITHOUT_CONVERT = new Set([
  "images/homepage/feature-strip-01-sesongstilbud-contura.png",
  "images/homepage/feature-strip-01-sesongstilbud-wide.png",
  "images/homepage/feature-strip-01-sesongstilbud.jpg",
  "images/homepage/feature-strip-01-sesongstilbud.png",
  "images/homepage/offers/spring-campaign.webp",
  "images/hub-pages/peisovn/hero.webp",
  "images/services/montering/gallery-03.webp",
  "images/site/google-g-colored.png",
  "images/site/google-mark-3d.png",
  "images/site/google-mark.png",
]);

const RENAME_BASE = {
  "images/homepage/hero": "images/homepage/hero-day",
  "images/homepage/location/showroom-bg":
    "images/homepage/location/showroom-baerum",
  "images/homepage/offers/pipe-rehabilitation":
    "images/homepage/offers/chimney-rehabilitation",
  "images/homepage/products/elementpeis":
    "images/homepage/products/element-fireplace",
  "images/homepage/products/gasspeis": "images/homepage/products/gas-fireplace",
  "images/homepage/products/peisinnsats":
    "images/homepage/products/fireplace-insert",
  "images/homepage/products/peisovn": "images/homepage/products/wood-stove",
  "images/homepage/products/peistilbehor":
    "images/homepage/products/fireplace-accessories",
  "images/homepage/products/utepeis":
    "images/homepage/products/outdoor-fireplace",
  "images/homepage/feature-strip-01-sesongstilbud-utepeis":
    "images/homepage/feature-strip-seasonal-outdoor-fireplace",
  "images/homepage/feature-strip-02-peisovn":
    "images/homepage/feature-strip-wood-stove",
  "images/homepage/feature-strip-02-peisovn-wide":
    "images/homepage/feature-strip-wood-stove-wide",
  "images/homepage/feature-strip-03-montering":
    "images/homepage/feature-strip-installation",
  "images/homepage/feature-strip-04-3d-visualisering":
    "images/homepage/feature-strip-3d-visualization",
  "images/products/spar-flame-icon": "images/products/sale-flame-icon",
  "images/resurs-bank/hero": "images/resurs-bank/financing-hero",
};

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const keepSources = args.has("--keep-sources");
const limitArg = [...args].find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number.parseInt(limitArg.split("=")[1], 10) : Infinity;

const apiKey = process.env.TINIFY_API_KEY?.trim();
if (!apiKey && !dryRun) {
  console.error("TINIFY_API_KEY missing. Use: node --env-file=.env.local ...");
  process.exit(1);
}

const authHeader = `Basic ${Buffer.from(`${apiKey ?? ""}:`).toString("base64")}`;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (RASTER_EXT.has(extname(name).toLowerCase())) out.push(full);
  }
  return out;
}

function toPosix(rel) {
  return rel.split(sep).join("/");
}

function stripExt(posixPath) {
  const i = posixPath.lastIndexOf(".");
  return i > 0 ? posixPath.slice(0, i) : posixPath;
}

function resolveOutBase(relPosix) {
  const withoutExt = stripExt(relPosix);
  return RENAME_BASE[withoutExt] ?? withoutExt;
}

function publicJoin(posixBase, ext) {
  return join(PUBLIC, `${posixBase}${ext}`.replaceAll("/", sep));
}

async function shrink(buffer) {
  const res = await fetch("https://api.tinify.com/shrink", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/octet-stream",
    },
    body: buffer,
  });
  if (!res.ok) throw new Error(`shrink ${res.status}: ${await res.text()}`);
  const location = res.headers.get("location");
  if (!location) throw new Error("shrink missing Location header");
  return location;
}

async function convert(outputUrl, mime) {
  const res = await fetch(outputUrl, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ convert: { type: mime } }),
  });
  if (!res.ok) throw new Error(`convert ${mime} ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

function contentHash(buf) {
  return createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

function isRasterMagic(buf) {
  if (!buf || buf.length < 12) return false;
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) return true;
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return true;
  // WebP (RIFF....WEBP)
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  )
    return true;
  // AVIF / HEIF (ftyp....)
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70)
    return true;
  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return true;
  return false;
}

const allFiles = walk(PUBLIC).sort();
const map = existsSync(MAP_PATH)
  ? JSON.parse(readFileSync(MAP_PATH, "utf8"))
  : { generatedAt: null, images: {}, deletedWithoutConvert: [], stats: {} };

const hashToPrimary = new Map();
const convertJobs = [];
const aliasJobs = [];
const deleteJobs = [];

for (const full of allFiles) {
  const rel = toPosix(relative(PUBLIC, full));
  if (DELETE_WITHOUT_CONVERT.has(rel)) {
    deleteJobs.push({ full, rel });
    continue;
  }
  const buf = readFileSync(full);
  if (!isRasterMagic(buf)) {
    console.warn(`SKIP non-image bytes (will delete): ${rel}`);
    deleteJobs.push({ full, rel, reason: "invalid-magic" });
    continue;
  }
  const hash = contentHash(buf);
  if (!hashToPrimary.has(hash)) {
    hashToPrimary.set(hash, { full, rel, buf, hash });
    convertJobs.push({ full, rel, buf, hash });
  } else {
    aliasJobs.push({
      full,
      rel,
      primaryRel: hashToPrimary.get(hash).rel,
      hash,
    });
  }
}

console.log(
  `Found ${allFiles.length} rasters → ${convertJobs.length} Tinify, ${aliasJobs.length} aliases, ${deleteJobs.length} leftovers`
);

let converted = 0;
let skipped = 0;
let copied = 0;
let deleted = 0;

for (const job of convertJobs) {
  if (converted >= limit) {
    skipped++;
    continue;
  }

  const outBase = resolveOutBase(job.rel);
  const outAvif = publicJoin(outBase, ".avif");
  const outWebp = publicJoin(outBase, ".webp");

  if (existsSync(outAvif) && existsSync(outWebp)) {
    console.log(`SKIP existing ${outBase}.{avif,webp}`);
    map.images[`/${job.rel}`] = {
      base: `/${outBase}`,
      avif: `/${outBase}.avif`,
      webp: `/${outBase}.webp`,
      hash: job.hash,
    };
    if (!dryRun && !keepSources && job.full !== outAvif && job.full !== outWebp) {
      if (existsSync(job.full)) unlinkSync(job.full);
    }
    converted++;
    continue;
  }

  // Tiny / broken placeholders (e.g. 38-byte navbar fallback) — keep source, skip Tinify
  if (job.buf.length < 200) {
    console.warn(`SKIP tiny/undecodable candidate ${job.rel} (${job.buf.length} B)`);
    map.failed = map.failed ?? [];
    map.failed.push({ rel: job.rel, error: "too-small-for-tinify" });
    skipped++;
    continue;
  }

  console.log(`CONVERT ${job.rel} → ${outBase}.{avif,webp}`);
  if (dryRun) {
    converted++;
    continue;
  }

  try {
    const outputUrl = await shrink(job.buf);
    const [avifBuf, webpBuf] = await Promise.all([
      convert(outputUrl, "image/avif"),
      convert(outputUrl, "image/webp"),
    ]);
    mkdirSync(dirname(outAvif), { recursive: true });
    writeFileSync(outAvif, avifBuf);
    writeFileSync(outWebp, webpBuf);
    map.images[`/${job.rel}`] = {
      base: `/${outBase}`,
      avif: `/${outBase}.avif`,
      webp: `/${outBase}.webp`,
      hash: job.hash,
      bytesIn: job.buf.length,
      bytesAvif: avifBuf.length,
      bytesWebp: webpBuf.length,
    };
    writeFileSync(MAP_PATH, JSON.stringify(map, null, 2));
    if (!keepSources && job.full !== outAvif && job.full !== outWebp && existsSync(job.full)) {
      unlinkSync(job.full);
    }
    converted++;
    console.log(
      `  OK in=${job.buf.length} avif=${avifBuf.length} webp=${webpBuf.length}`
    );
  } catch (error) {
    console.error(`  FAIL ${job.rel} (continuing)`, error?.message ?? error);
    map.failed = map.failed ?? [];
    map.failed.push({ rel: job.rel, error: String(error?.message ?? error) });
    writeFileSync(MAP_PATH, JSON.stringify(map, null, 2));
    skipped++;
  }
}

// Aliases/leftovers can run even if some converts were skipped/failed.
for (const job of aliasJobs) {
  const primaryBase = resolveOutBase(job.primaryRel);
  const thisBase = resolveOutBase(job.rel);
  const primaryAvif = publicJoin(primaryBase, ".avif");
  const primaryWebp = publicJoin(primaryBase, ".webp");
  const outAvif = publicJoin(thisBase, ".avif");
  const outWebp = publicJoin(thisBase, ".webp");

  console.log(`ALIAS ${job.rel} ← ${primaryBase}`);
  map.images[`/${job.rel}`] = {
    base: `/${thisBase}`,
    avif: `/${thisBase}.avif`,
    webp: `/${thisBase}.webp`,
    aliasOf: `/${job.primaryRel}`,
    hash: job.hash,
  };

  if (dryRun) {
    copied++;
    continue;
  }

  if (!existsSync(primaryAvif) || !existsSync(primaryWebp)) {
    console.error(`  missing primary outputs for ${job.primaryRel}`);
    process.exitCode = 1;
    continue;
  }

  mkdirSync(dirname(outAvif), { recursive: true });
  if (primaryAvif !== outAvif) copyFileSync(primaryAvif, outAvif);
  if (primaryWebp !== outWebp) copyFileSync(primaryWebp, outWebp);
  if (existsSync(job.full) && job.full !== outAvif && job.full !== outWebp) {
    unlinkSync(job.full);
  }
  copied++;
}

for (const job of deleteJobs) {
  if (!existsSync(job.full)) continue;
  console.log(`DELETE leftover ${job.rel}`);
  if (!dryRun) {
    unlinkSync(job.full);
    if (!map.deletedWithoutConvert.includes(job.rel)) {
      map.deletedWithoutConvert.push(job.rel);
    }
  }
  deleted++;
}

map.generatedAt = new Date().toISOString();
map.stats = { converted, skipped, copied, deleted, dryRun };
if (!dryRun) writeFileSync(MAP_PATH, JSON.stringify(map, null, 2));
console.log("Done.", map.stats);
