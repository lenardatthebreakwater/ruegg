import { hasFlag } from "country-flag-icons";
// Direct country module — avoids importing the full string/3x2 namespace.
import NO from "country-flag-icons/string/3x2/NO";

/** Sync cache — NO is always available for Norwegian store fallback. */
const flagSvgCache = new Map<string, string>([["NO", NO]]);

const flagLoadPromises = new Map<string, Promise<string | null>>();

export function getCachedFlagSvg(countryCode: string): string | null {
  return flagSvgCache.get(countryCode) ?? null;
}

/**
 * Load a 3x2 flag SVG string without importing the full country-flag-icons
 * string namespace. NO is preloaded; other codes are dynamic chunks.
 */
export function loadFlagSvg(countryCode: string): Promise<string | null> {
  if (!hasFlag(countryCode)) return Promise.resolve(null);

  const cached = flagSvgCache.get(countryCode);
  if (cached) return Promise.resolve(cached);

  const inflight = flagLoadPromises.get(countryCode);
  if (inflight) return inflight;

  const promise = import(
    /* webpackChunkName: "flag-svg-[request]" */
    `country-flag-icons/string/3x2/${countryCode}`
  )
    .then((mod) => {
      const svg = (mod as { default?: string }).default;
      if (typeof svg !== "string" || svg.length === 0) return null;
      flagSvgCache.set(countryCode, svg);
      return svg;
    })
    .catch(() => null)
    .finally(() => {
      flagLoadPromises.delete(countryCode);
    });

  flagLoadPromises.set(countryCode, promise);
  return promise;
}

export function flagSvgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
