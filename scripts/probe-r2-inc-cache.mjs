/**
 * One-off probe: verify R2_ACCESS_KEY_* can list/put/delete on the WEUR inc-cache bucket.
 * Loads keys from .dev.vars — does not print secrets.
 *
 *   node scripts/probe-r2-inc-cache.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const BUCKET = "peisbutikken-next-inc-cache-weur";
const ROOT = resolve(import.meta.dirname, "..");

function loadDevVars(path) {
  const out = {};
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    throw new Error(`Missing ${path}`);
  }
  for (const raw of text.split(/\r?\n/)) {
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

const env = loadDevVars(resolve(ROOT, ".dev.vars"));
const accessKeyId = env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = env.R2_SECRET_ACCESS_KEY || "";
const accountId = env.CF_ACCOUNT_ID || env.CLOUDFLARE_ACCOUNT_ID || "";

if (!accessKeyId || !secretAccessKey || !accountId) {
  console.error("FAIL: need R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, CF_ACCOUNT_ID in .dev.vars");
  process.exit(1);
}

console.log(
  `OK: vars present (key_id_len=${accessKeyId.length} secret_len=${secretAccessKey.length} account=${accountId})`
);

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

try {
  const listed = await client.send(
    new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 5 })
  );
  console.log(
    "LIST OK:",
    JSON.stringify({
      bucket: BUCKET,
      keyCount: listed.KeyCount ?? 0,
      isTruncated: listed.IsTruncated ?? false,
      sampleKeys: (listed.Contents || []).map((o) => o.Key).slice(0, 5),
    })
  );
} catch (e) {
  console.error("LIST FAIL:", e.name || "Error", e.message || String(e));
  process.exit(2);
}

const testKey = `rclone-token-probe/${Date.now()}.txt`;
try {
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: testKey,
      Body: Buffer.from("ok"),
      ContentType: "text/plain",
    })
  );
  console.log("PUT OK:", testKey);
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: testKey }));
  console.log("DELETE OK:", testKey);
  console.log(`RESULT: token works for ${BUCKET} (list+put+delete)`);
} catch (e) {
  console.error("WRITE FAIL:", e.name || "Error", e.message || String(e));
  process.exit(3);
}
