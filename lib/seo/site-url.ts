function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function coerceAbsoluteBaseUrl(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!isAbsoluteHttpUrl(trimmed)) return null;
  return normalizeBaseUrl(trimmed);
}

export function getSiteBaseUrl(): string {
  const explicitSiteUrl = coerceAbsoluteBaseUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (explicitSiteUrl) return explicitSiteUrl;

  // Deliberately NOT derived from the WordPress URL: the frontend owns the
  // apex domain regardless of where WordPress endpoints live. Canonicals,
  // sitemap and schema @ids must always use the public domain.
  return "https://ruegg.no";
}

export function toAbsoluteUrl(path: string): string {
  const base = getSiteBaseUrl();
  if (!path || path === "/") return `${base}/`;
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
