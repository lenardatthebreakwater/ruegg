/**
 * Pure decision logic for path-scoped on-demand revalidation.
 * Kept free of Next.js APIs so Vitest can cover it without route mocks.
 */

import { LAGERSALG_CATEGORY_SLUG } from "@/lib/data/hub-pages/lagersalg";
import { OMBYGGINGSSALG_CATEGORY_SLUG } from "@/lib/data/hub-pages/ombyggingssalg";

const MAX_PATH_LENGTH = 200;
const ARCHIVE_TAG_PREFIX = "products:archive:";
const SHOP_ARCHIVE_TAG = `${ARCHIVE_TAG_PREFIX}shop`;

/** Known hub routes → category/shop archive data tags (no shared `products:archive`). */
const HUB_PATH_ARCHIVE_TAGS: Record<string, string> = {
  "/lagersalg": `${ARCHIVE_TAG_PREFIX}${LAGERSALG_CATEGORY_SLUG}`,
  "/ombyggingssalg": `${ARCHIVE_TAG_PREFIX}${OMBYGGINGSSALG_CATEGORY_SLUG}`,
  "/shop": SHOP_ARCHIVE_TAG,
};

export type PathRevalidatePayload = {
  path?: string;
  paths?: string[];
};

export type PathRevalidateDecision =
  | {
      ok: false;
      status: 400;
      error: string;
    }
  | {
      ok: true;
      /** Canonical paths with leading `/` and no trailing slash (except `/`). */
      paths: string[];
      /** Path-specific archive tags only — never shared `products` / `products:archive`. */
      tags: string[];
    };

/**
 * Normalize to a leading-slash path without trailing slash (except root).
 * Returns null when the value is not a safe relative app path.
 */
export function normalizeRevalidatePath(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_PATH_LENGTH) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;
  if (trimmed.includes("://") || trimmed.includes("\\")) return null;
  if (trimmed.includes("..")) return null;
  if (trimmed.includes("?") || trimmed.includes("#")) return null;

  let path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  // Collapse accidental duplicate slashes (except keep single leading).
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  if (!path.startsWith("/")) return null;
  if (path.includes("..")) return null;
  if (path.length > MAX_PATH_LENGTH) return null;

  return path;
}

function archiveTagsForPath(path: string): string[] {
  const hubTag = HUB_PATH_ARCHIVE_TAGS[path];
  if (hubTag) return [hubTag];

  const categoryMatch = path.match(/^\/produktkategori\/([^/]+)(?:\/merke\/[^/]+)?$/);
  if (categoryMatch?.[1]) {
    return [`${ARCHIVE_TAG_PREFIX}${categoryMatch[1]}`];
  }

  return [];
}

/**
 * Paths to pass to `revalidatePath`. App uses `trailingSlash: true`, so both
 * slash and slashless forms are returned when they differ.
 */
export function revalidatePathVariants(path: string): string[] {
  if (path === "/") return ["/"];
  return [path, `${path}/`];
}

export function decidePathRevalidate(
  payload: PathRevalidatePayload
): PathRevalidateDecision {
  const rawValues = [
    payload.path,
    ...(Array.isArray(payload.paths) ? payload.paths : []),
  ];

  const normalized: string[] = [];
  const invalid: string[] = [];

  for (const value of rawValues) {
    if (typeof value !== "string") continue;
    const path = normalizeRevalidatePath(value);
    if (!path) {
      if (value.trim()) invalid.push(value.trim());
      continue;
    }
    normalized.push(path);
  }

  const paths = [...new Set(normalized)];

  if (paths.length === 0) {
    return {
      ok: false,
      status: 400,
      error:
        invalid.length > 0
          ? "Invalid path(s). Use relative app paths like /lagersalg (no URLs, .., or query strings)."
          : 'Missing paths. Pass { "path": "/lagersalg" } or { "paths": ["/lagersalg"] }.',
    };
  }

  const tags = [
    ...new Set(paths.flatMap((path) => archiveTagsForPath(path))),
  ];

  return { ok: true, paths, tags };
}
