#!/usr/bin/env node
/**
 * Release discipline helpers for peisbutikken-frontend.
 *
 * Usage:
 *   node scripts/release-record.mjs bump-changelog <version>
 *     Move ## [Unreleased] body under ## [version] - YYYY-MM-DD; leave empty Unreleased.
 *
 *   node scripts/release-record.mjs finalize \
 *     --version X.Y.Z --git-sha FULL --git-sha-short SHORT \
 *     --branch NAME --released-at ISO --notes "…"
 *     Write CHANGELOG (if missing), REGISTRY.md, last-deploy.json (+ tmp copy).
 *
 * Does not create git tags (caller / deploy script does that after success).
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const CHANGELOG_PATH = path.join(root, "CHANGELOG.md");
const REGISTRY_PATH = path.join(root, "docs", "releases", "REGISTRY.md");
const LAST_DEPLOY_PATH = path.join(root, "docs", "releases", "last-deploy.json");
const TMP_LOG_DIR = path.join(root, "tmp", "opennext-logs");

function die(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function readText(filePath) {
  if (!existsSync(filePath)) die(`missing file: ${filePath}`);
  return readFileSync(filePath, "utf8");
}

function notesToBullets(notes) {
  const raw = String(notes ?? "").trim();
  if (!raw) return ["- (no notes)"];
  const parts = raw
    .split(/\r?\n|;/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.map((line) =>
    line.startsWith("- ") || line.startsWith("* ") ? line.replace(/^\*\s/, "- ") : `- ${line}`,
  );
}

function dateFromIso(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) die(`invalid --released-at: ${iso}`);
  return d.toISOString().slice(0, 10);
}

/** Move Unreleased body under a new version heading (Keep a Changelog). */
function bumpChangelog(version) {
  if (!/^\d+\.\d+\.\d+/.test(version)) {
    die(`version must look like X.Y.Z (got: ${version})`);
  }
  const today = new Date().toISOString().slice(0, 10);
  let text = readText(CHANGELOG_PATH);

  if (new RegExp(`^## \\[${escapeRegExp(version)}\\]`, "m").test(text)) {
    console.log(`CHANGELOG already has ## [${version}] — leaving as-is`);
    return;
  }

  const unreleasedRe = /^## \[Unreleased\]\s*\n([\s\S]*?)(?=^## \[|$)/m;
  const match = text.match(unreleasedRe);
  if (!match) die("CHANGELOG.md missing ## [Unreleased] section");

  let body = (match[1] || "").trim();
  if (!body) {
    body = "- (see RELEASE_NOTES at deploy time)";
  }

  const replacement =
    `## [Unreleased]\n\n` +
    `## [${version}] - ${today}\n\n` +
    `${body}\n\n`;

  text = text.replace(unreleasedRe, replacement);
  writeFileSync(CHANGELOG_PATH, text, "utf8");
  console.log(`Updated CHANGELOG.md: Unreleased → [${version}] - ${today}`);
}

function ensureChangelogVersion(version, releasedAt, notes) {
  let text = readText(CHANGELOG_PATH);
  const headingRe = new RegExp(
    `^## \\[${escapeRegExp(version)}\\](?:\\s*-\\s*\\d{4}-\\d{2}-\\d{2})?\\s*$`,
    "m",
  );
  if (headingRe.test(text)) {
    console.log(`CHANGELOG already has ## [${version}] — not duplicating`);
    return;
  }

  const date = dateFromIso(releasedAt);
  const bullets = notesToBullets(notes).join("\n");
  const block = `## [${version}] - ${date}\n\n${bullets}\n\n`;

  // Keep [Unreleased] first; insert the new dated section after its body.
  const unreleasedRe = /^## \[Unreleased\]\s*\n([\s\S]*?)(?=^## \[|$)/m;
  if (!unreleasedRe.test(text)) {
    die("CHANGELOG.md missing ## [Unreleased] section");
  }

  text = text.replace(unreleasedRe, (full) => `${full.replace(/\s*$/, "\n\n")}${block}`);
  writeFileSync(CHANGELOG_PATH, text.replace(/\n{3,}/g, "\n\n"), "utf8");
  console.log(`Inserted CHANGELOG.md section ## [${version}] - ${date}`);
}

function appendRegistry(record) {
  mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true });
  let text = existsSync(REGISTRY_PATH)
    ? readFileSync(REGISTRY_PATH, "utf8")
    : "# Deploy registry\n\n## Entries\n\n";

  text = text.replace(
    /\n_No production ships recorded yet\._\s*/m,
    "\n",
  );

  const entry =
    `\n## ${record.version} — ${record.releasedAt}\n\n` +
    `- **gitSha:** \`${record.gitSha}\`\n` +
    `- **gitShaShort:** \`${record.gitShaShort}\`\n` +
    `- **branch:** \`${record.branch}\`\n` +
    `- **notes:** ${record.notes.trim().replace(/\r?\n/g, " ")}\n`;

  if (!/^## Entries\b/m.test(text)) {
    text = text.trimEnd() + "\n\n## Entries\n";
  }

  // Newest first under ## Entries
  text = text.replace(/^(## Entries\s*\n)/m, `$1${entry}`);
  writeFileSync(REGISTRY_PATH, text.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n", "utf8");
  console.log(`Appended docs/releases/REGISTRY.md for ${record.version}`);
}

function writeLastDeploy(record) {
  mkdirSync(path.dirname(LAST_DEPLOY_PATH), { recursive: true });
  const payload = {
    version: record.version,
    gitSha: record.gitSha,
    gitShaShort: record.gitShaShort,
    releasedAt: record.releasedAt,
    branch: record.branch,
    notes: record.notes.trim(),
  };
  writeFileSync(LAST_DEPLOY_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote docs/releases/last-deploy.json`);

  mkdirSync(TMP_LOG_DIR, { recursive: true });
  const tmpCopy = path.join(TMP_LOG_DIR, "last-deploy.json");
  copyFileSync(LAST_DEPLOY_PATH, tmpCopy);
  const stamped = path.join(
    TMP_LOG_DIR,
    `last-deploy-${record.version}-${record.gitShaShort}.json`,
  );
  copyFileSync(LAST_DEPLOY_PATH, stamped);
  console.log(`Copied last-deploy.json → tmp/opennext-logs/`);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseFinalizeArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const val = argv[i + 1];
    if (!val || val.startsWith("--")) die(`missing value for --${key}`);
    out[key] = val;
    i++;
  }
  for (const req of [
    "version",
    "git-sha",
    "git-sha-short",
    "branch",
    "released-at",
    "notes",
  ]) {
    if (!out[req]) die(`finalize requires --${req}`);
  }
  return {
    version: out.version,
    gitSha: out["git-sha"],
    gitShaShort: out["git-sha-short"],
    branch: out.branch,
    releasedAt: out["released-at"],
    notes: out.notes,
  };
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "bump-changelog") {
    const version = rest[0];
    if (!version) die("usage: bump-changelog <version>");
    bumpChangelog(version);
    return;
  }
  if (cmd === "finalize") {
    const record = parseFinalizeArgs(rest);
    ensureChangelogVersion(record.version, record.releasedAt, record.notes);
    appendRegistry(record);
    writeLastDeploy(record);
    console.log("Release record files updated (commit when ready).");
    return;
  }
  die(
    "usage: node scripts/release-record.mjs <bump-changelog|finalize> …",
  );
}

main();
