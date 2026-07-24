/**
 * Detect CTAs that should open the in-page contact / expert dialog
 * instead of navigating away (archive bottoms, WP JetEngine slots, etc.).
 */

const CONTACT_LABEL_EXACT = new Set([
  "kontakt oss",
  "kontakt",
  "spør en ekspert",
  "ta kontakt",
]);

function normalizeLabel(label: string): string {
  return label
    .trim()
    .toLocaleLowerCase("nb-NO")
    .replace(/\s+/g, " ");
}

function pathnameFromHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) return "";

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      return new URL(trimmed).pathname;
    }
  } catch {
    // fall through
  }

  const pathOnly = trimmed.split(/[?#]/, 1)[0] ?? trimmed;
  return pathOnly.startsWith("/") ? pathOnly : `/${pathOnly.replace(/^\/+/, "")}`;
}

function isContactPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "").toLowerCase();
  return (
    normalized === "/kontakt" ||
    normalized === "/kontakt-oss" ||
    normalized.endsWith("/kontakt") ||
    normalized.endsWith("/kontakt-oss")
  );
}

export function isContactIntentCta(
  linkUrl: string | null | undefined,
  linkText: string | null | undefined
): boolean {
  const label = normalizeLabel(linkText ?? "");
  if (label) {
    if (CONTACT_LABEL_EXACT.has(label)) return true;
    if (label.startsWith("kontakt oss")) return true;
    if (label.includes("spør en ekspert")) return true;
  }

  const raw = linkUrl?.trim();
  if (!raw) return false;

  return isContactPath(pathnameFromHref(raw));
}
