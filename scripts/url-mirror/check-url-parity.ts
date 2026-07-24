import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_LIVE_FAMILIES = [
  "/produkt/",
  "/brand/",
  "/produktkategori/",
  "/aduro-deler/",
  "/dovre-deler/",
  "/nordpeis-deler/",
  "/shop/",
] as const;

const LINK_SOURCE_FILES = [
  "components/navbar/nav-menu-data.ts",
  "components/footer/site-footer.tsx",
  "lib/data/homepage.ts",
];

function isDynamicSegment(segment: string): boolean {
  return segment.includes("[") && segment.includes("]");
}

async function listPageRoutes(appDir: string): Promise<string[]> {
  const routes = new Set<string>();

  async function walk(dir: string, segments: string[] = []): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const nextPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(nextPath, [...segments, entry.name]);
        continue;
      }

      if (!entry.isFile() || entry.name !== "page.tsx") continue;
      const routeSegments = segments.filter((segment) => !isDynamicSegment(segment));
      const route = `/${routeSegments.join("/")}`.replace(/\/+/g, "/");
      routes.add(route === "/" ? "/" : `${route}/`);
    }
  }

  await walk(appDir);
  return [...routes].sort((a, b) => a.localeCompare(b, "nb-NO"));
}

function collectPathLiterals(content: string): string[] {
  const regex = /["'`]((?:\/)[^"'`\\s]*)["'`]/g;
  const paths = new Set<string>();
  let match: RegExpExecArray | null = null;

  while (true) {
    match = regex.exec(content);
    if (!match) break;
    const path = match[1];
    if (path.startsWith("/images/") || path.startsWith("/api/")) continue;
    paths.add(path.split("?")[0]);
  }

  return [...paths];
}

async function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = resolve(scriptDir, "..", "..");
  const appDir = resolve(projectRoot, "app");
  const livePathsPath = resolve(projectRoot, "data", "live-sitemap-paths.json");

  const livePaths = new Set<string>(JSON.parse(await readFile(livePathsPath, "utf8")) as string[]);
  const pageRoutes = await listPageRoutes(appDir);

  const missingFamilies = REQUIRED_LIVE_FAMILIES.filter((prefix) =>
    !pageRoutes.some((route) => route.startsWith(prefix))
  );

  const linkPaths = new Set<string>();
  for (const relativePath of LINK_SOURCE_FILES) {
    const source = await readFile(resolve(projectRoot, relativePath), "utf8");
    for (const path of collectPathLiterals(source)) {
      linkPaths.add(path.endsWith("/") || path === "/" ? path : `${path}/`);
    }
  }

  const missingLinkedPaths = [...linkPaths].filter(
    (path) => !path.startsWith("/#") && !livePaths.has(path)
  );

  console.log(`Live paths: ${livePaths.size}`);
  console.log(`Static app page routes: ${pageRoutes.length}`);
  console.log(`Collected nav/footer/homepage link paths: ${linkPaths.size}`);

  if (missingFamilies.length > 0) {
    console.error("Missing required live route families:");
    for (const family of missingFamilies) {
      console.error(`  - ${family}`);
    }
  }

  if (missingLinkedPaths.length > 0) {
    console.error("Linked paths not found in live sitemap snapshot:");
    for (const path of missingLinkedPaths.slice(0, 40)) {
      console.error(`  - ${path}`);
    }
  }

  if (missingFamilies.length > 0 || missingLinkedPaths.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("URL parity checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
