#!/usr/bin/env node
/**
 * Run OpenNext Cloudflare CLI with teed logs + a loud end summary of
 * Warn / Error / DEP* lines (so they are not lost in Cursor shell scrollback).
 *
 * Usage:
 *   node scripts/run-opennext-loud.mjs build
 *   node scripts/run-opennext-loud.mjs deploy --cacheChunkSize=8 --rclone
 *   node scripts/run-opennext-loud.mjs preview
 *
 * Does not fail on warnings. Exit code matches the child process.
 */

import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const FLAG_RE =
  /\b(DEP\d+)\b|\b(error|err!|failed|failure|fatal)\b|\b(warn(?:ing)?)\b|✘|✗/i;

function resolveOpenNextCli() {
  const cli = path.join(
    root,
    "node_modules",
    "@opennextjs",
    "cloudflare",
    "dist",
    "cli",
    "index.js",
  );
  if (!existsSync(cli)) {
    throw new Error(
      `Missing OpenNext CLI at ${cli}. Run npm install first.`,
    );
  }
  return cli;
}

function classifyLine(line) {
  const m = line.match(FLAG_RE);
  if (!m) return null;
  if (m[1] || (m[2] && /error|err!|failed|failure|fatal/i.test(m[2]))) {
    return "error";
  }
  return "warn";
}

function paint(kind, line) {
  if (!process.stderr.isTTY) return line;
  if (kind === "warn") return `\x1b[33m${line}\x1b[0m`;
  if (kind === "error") return `\x1b[31m${line}\x1b[0m`;
  return line;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error(
      "Usage: node scripts/run-opennext-loud.mjs <build|preview|deploy|…> [args…]",
    );
    process.exit(2);
  }

  const cli = resolveOpenNextCli();
  const label = ["opennextjs-cloudflare", ...argv].join(" ");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logDir = path.join(root, "tmp", "opennext-logs");
  mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, `${stamp}.log`);
  const logStream = createWriteStream(logPath, { flags: "w" });

  const flagged = [];
  const onLine = (line) => {
    const kind = classifyLine(line);
    if (kind) flagged.push({ kind, line });
  };

  let stdoutBuf = "";
  let stderrBuf = "";
  const onStdout = (chunk) => {
    stdoutBuf += chunk.toString("utf8");
    let idx;
    while ((idx = stdoutBuf.indexOf("\n")) !== -1) {
      const line = stdoutBuf.slice(0, idx + 1);
      stdoutBuf = stdoutBuf.slice(idx + 1);
      process.stdout.write(line);
      logStream.write(line);
      onLine(line.replace(/\r?\n$/, ""));
    }
  };
  const onStderr = (chunk) => {
    stderrBuf += chunk.toString("utf8");
    let idx;
    while ((idx = stderrBuf.indexOf("\n")) !== -1) {
      const line = stderrBuf.slice(0, idx + 1);
      stderrBuf = stderrBuf.slice(idx + 1);
      const plain = line.replace(/\r?\n$/, "");
      const kind = classifyLine(plain);
      process.stderr.write(kind ? paint(kind, line) : line);
      logStream.write(line);
      if (kind) flagged.push({ kind, line: plain });
    }
  };

  // Spawn Node + CLI with shell:false (same hardening as the runWrangler patch).
  const child = spawn(process.execPath, [cli, ...argv], {
    cwd: root,
    env: process.env,
    shell: false,
    stdio: ["inherit", "pipe", "pipe"],
  });

  child.stdout.on("data", onStdout);
  child.stderr.on("data", onStderr);

  const status = await new Promise((resolve) => {
    child.on("error", (err) => {
      console.error(`[run-opennext-loud] failed to spawn: ${err.message}`);
      resolve(1);
    });
    child.on("close", (code, signal) => {
      if (stdoutBuf) {
        process.stdout.write(stdoutBuf);
        logStream.write(stdoutBuf);
        onLine(stdoutBuf.replace(/\r?\n$/, ""));
        stdoutBuf = "";
      }
      if (stderrBuf) {
        const kind = classifyLine(stderrBuf);
        process.stderr.write(kind ? paint(kind, stderrBuf) : stderrBuf);
        logStream.write(stderrBuf);
        if (kind) flagged.push({ kind, line: stderrBuf.replace(/\r?\n$/, "") });
        stderrBuf = "";
      }
      if (signal) {
        console.error(`[run-opennext-loud] killed by signal ${signal}`);
        resolve(1);
        return;
      }
      resolve(code ?? 1);
    });
  });

  await new Promise((r) => logStream.end(r));

  const warns = flagged.filter((f) => f.kind === "warn");
  const errors = flagged.filter((f) => f.kind === "error");
  const bar = "=".repeat(72);
  console.error(`\n${bar}`);
  console.error(`[run-opennext-loud] ${label}`);
  console.error(`[run-opennext-loud] exit=${status}  log=${logPath}`);
  console.error(
    `[run-opennext-loud] flagged: ${errors.length} error-ish, ${warns.length} warn-ish`,
  );
  const show = [...errors, ...warns].slice(0, 40);
  for (const f of show) {
    console.error(paint(f.kind, `  [${f.kind}] ${f.line}`));
  }
  if (errors.length + warns.length > show.length) {
    console.error(
      `  … ${errors.length + warns.length - show.length} more (see log file)`,
    );
  }
  console.error(`${bar}\n`);

  process.exit(status);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
