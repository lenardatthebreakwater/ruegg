import liveSitemapPaths from "@/data/live-sitemap-paths.json";

const LIVE_PATH_SET = new Set<string>(liveSitemapPaths);

export function isLiveSitemapPath(path: string): boolean {
  return LIVE_PATH_SET.has(path);
}

export function getLiveSitemapPaths(): string[] {
  return [...LIVE_PATH_SET];
}
