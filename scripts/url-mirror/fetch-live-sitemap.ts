import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITEMAP_INDEX_URL = "https://peisbutikken.no/sitemap_index.xml";
const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

function collectTagValues(xmlText: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}>([^<]+)</${tagName}>`, "g");
  const values: string[] = [];
  let match: RegExpExecArray | null = null;

  while (true) {
    match = regex.exec(xmlText);
    if (!match) break;
    const value = match[1]?.trim();
    if (value) values.push(value);
  }

  return values;
}

function normalizePath(urlValue: string): string {
  const parsed = new URL(urlValue);
  let path = parsed.pathname || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  return path;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8" },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

async function main() {
  const indexXml = await fetchText(SITEMAP_INDEX_URL);
  const childSitemapUrls = collectTagValues(indexXml, "loc");

  const allPaths = new Set<string>();
  const stats = {
    namespace: SITEMAP_NS,
    indexUrl: SITEMAP_INDEX_URL,
    generatedAt: new Date().toISOString(),
    childSitemapCount: childSitemapUrls.length,
    childSitemaps: [] as Array<{ url: string; entryCount: number }>,
  };

  for (const sitemapUrl of childSitemapUrls) {
    const sitemapXml = await fetchText(sitemapUrl);
    const locs = collectTagValues(sitemapXml, "loc");
    const urlLocs = locs.filter((value) => value.startsWith("http"));
    for (const urlValue of urlLocs) {
      allPaths.add(normalizePath(urlValue));
    }
    stats.childSitemaps.push({ url: sitemapUrl, entryCount: urlLocs.length });
  }

  const paths = [...allPaths].sort((a, b) => a.localeCompare(b, "nb-NO"));
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const rootDir = resolve(scriptDir, "..", "..");
  const dataDir = resolve(rootDir, "data");
  await mkdir(dataDir, { recursive: true });

  const outputPath = resolve(dataDir, "live-sitemap-paths.json");
  const statsPath = resolve(dataDir, "live-sitemap-stats.json");

  await writeFile(outputPath, `${JSON.stringify(paths, null, 2)}\n`, "utf8");
  await writeFile(
    statsPath,
    `${JSON.stringify({ ...stats, uniquePathCount: paths.length }, null, 2)}\n`,
    "utf8"
  );

  console.log(`Saved ${paths.length} unique live sitemap paths to ${outputPath}`);
  console.log(`Saved sitemap stats to ${statsPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
