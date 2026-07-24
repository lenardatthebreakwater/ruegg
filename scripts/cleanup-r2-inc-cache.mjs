/**
 * Delete stale OpenNext R2 incremental-cache build prefixes.
 *
 * Keys look like:
 *   incremental-cache/<buildId>/<hash>.cache
 *   incremental-cache/<buildId>/<hash>.fetch
 *
 * After a successful deploy, keep the current BUILD_ID prefix (and optionally
 * N previous ones) and delete everything else under incremental-cache/.
 *
 * Usage:
 *   node scripts/cleanup-r2-inc-cache.mjs              # dry-run
 *   node scripts/cleanup-r2-inc-cache.mjs --execute    # actually delete
 *   KEEP_BUILD_IDS=2 node scripts/cleanup-r2-inc-cache.mjs --execute
 *
 * Env (from .dev.vars or process.env):
 *   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, CF_ACCOUNT_ID
 * Optional:
 *   R2_INC_CACHE_BUCKET (default peisbutikken-next-inc-cache-weur)
 *   KEEP_BUILD_IDS (default 1 = current only; 2 keeps current + one previous)
 *   CURRENT_BUILD_ID (if unset, read from .open-next/assets/BUILD_ID or .next/BUILD_ID)
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const ROOT = resolve(import.meta.dirname, "..");
const DEFAULT_BUCKET = "peisbutikken-next-inc-cache-weur";
const CACHE_ROOT = "incremental-cache/";
const execute = process.argv.includes("--execute");

function loadDevVars(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function readBuildId() {
  if (process.env.CURRENT_BUILD_ID?.trim()) {
    return process.env.CURRENT_BUILD_ID.trim();
  }
  for (const rel of [
    ".open-next/assets/BUILD_ID",
    ".next/BUILD_ID",
    "BUILD_ID",
  ]) {
    const p = resolve(ROOT, rel);
    if (existsSync(p)) {
      const id = readFileSync(p, "utf8").trim();
      if (id) return id;
    }
  }
  return null;
}

const fileEnv = loadDevVars(resolve(ROOT, ".dev.vars"));
const accessKeyId =
  process.env.R2_ACCESS_KEY_ID || fileEnv.R2_ACCESS_KEY_ID || "";
const secretAccessKey =
  process.env.R2_SECRET_ACCESS_KEY || fileEnv.R2_SECRET_ACCESS_KEY || "";
const accountId =
  process.env.CF_ACCOUNT_ID ||
  process.env.CLOUDFLARE_ACCOUNT_ID ||
  fileEnv.CF_ACCOUNT_ID ||
  fileEnv.CLOUDFLARE_ACCOUNT_ID ||
  "";
const bucket =
  process.env.R2_INC_CACHE_BUCKET ||
  fileEnv.R2_INC_CACHE_BUCKET ||
  DEFAULT_BUCKET;
const keepCount = Math.max(
  1,
  Number.parseInt(process.env.KEEP_BUILD_IDS || "1", 10) || 1
);

if (!accessKeyId || !secretAccessKey || !accountId) {
  console.error(
    "FAIL: need R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, CF_ACCOUNT_ID"
  );
  process.exit(1);
}

const currentBuildId = readBuildId();
if (!currentBuildId) {
  console.error(
    "FAIL: could not determine CURRENT_BUILD_ID (.open-next/assets/BUILD_ID missing). Run after OpenNext build/deploy."
  );
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

/** @returns {Promise<string[]>} buildId prefixes under incremental-cache/ */
async function listBuildIds() {
  const ids = new Set();
  let token;
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: CACHE_ROOT,
        Delimiter: "/",
        ContinuationToken: token,
      })
    );
    for (const p of res.CommonPrefixes || []) {
      // incremental-cache/<buildId>/
      const full = p.Prefix || "";
      const rest = full.slice(CACHE_ROOT.length).replace(/\/$/, "");
      if (rest && !rest.includes("/")) ids.add(rest);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return [...ids].sort();
}

async function listKeysUnderPrefix(prefix) {
  const keys = [];
  let token;
  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: token,
        MaxKeys: 1000,
      })
    );
    for (const obj of res.Contents || []) {
      if (obj.Key) keys.push(obj.Key);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

async function deleteKeys(keys) {
  let deleted = 0;
  for (let i = 0; i < keys.length; i += 1000) {
    const chunk = keys.slice(i, i + 1000);
    const res = await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: chunk.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    );
    deleted += chunk.length - (res.Errors?.length || 0);
    if (res.Errors?.length) {
      console.warn(
        `Delete errors: ${res.Errors.length} (first: ${res.Errors[0].Key} ${res.Errors[0].Message})`
      );
    }
  }
  return deleted;
}

const buildIds = await listBuildIds();
console.log(`Bucket: ${bucket}`);
console.log(`Mode: ${execute ? "EXECUTE" : "DRY-RUN"}`);
console.log(`Current BUILD_ID: ${currentBuildId}`);
console.log(`Found ${buildIds.length} cache build prefix(es):`);
for (const id of buildIds) {
  console.log(`  - ${id}${id === currentBuildId ? "  (current)" : ""}`);
}

if (!buildIds.includes(currentBuildId)) {
  console.warn(
    "WARN: current BUILD_ID not found in R2 yet (populate may not have finished). Aborting cleanup."
  );
  process.exit(2);
}

// Keep current + (keepCount-1) other most recently seen by lexicographic order is weak;
// Prefer: always keep current; among the rest keep newest LastModified of any object.
async function rankBuildIds(ids) {
  const ranked = [];
  for (const id of ids) {
    const prefix = `${CACHE_ROOT}${id}/`;
    let newest = 0;
    let count = 0;
    let token;
    do {
      const res = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: token,
          MaxKeys: 1000,
        })
      );
      for (const obj of res.Contents || []) {
        count++;
        const t = obj.LastModified ? obj.LastModified.getTime() : 0;
        if (t > newest) newest = t;
      }
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (token);
    ranked.push({ id, newest, count });
  }
  ranked.sort((a, b) => b.newest - a.newest);
  return ranked;
}

const ranked = await rankBuildIds(buildIds);
const keep = new Set([currentBuildId]);
for (const row of ranked) {
  if (keep.size >= keepCount) break;
  keep.add(row.id);
}

console.log(`Keeping ${keep.size} build id(s): ${[...keep].join(", ")}`);
const toDelete = ranked.filter((r) => !keep.has(r.id));
if (toDelete.length === 0) {
  console.log("Nothing to delete.");
  process.exit(0);
}

let totalKeys = 0;
for (const row of toDelete) {
  const prefix = `${CACHE_ROOT}${row.id}/`;
  const keys = await listKeysUnderPrefix(prefix);
  totalKeys += keys.length;
  console.log(
    `Stale ${row.id}: ${keys.length} objects, newest=${new Date(row.newest).toISOString()}`
  );
  if (execute && keys.length > 0) {
    const n = await deleteKeys(keys);
    console.log(`  deleted ${n}`);
  }
}

if (!execute) {
  console.log(
    `DRY-RUN: would delete ~${totalKeys} objects under ${toDelete.length} prefix(es). Re-run with --execute.`
  );
} else {
  console.log(`Done. Deleted stale prefixes; ~${totalKeys} objects targeted.`);
}
