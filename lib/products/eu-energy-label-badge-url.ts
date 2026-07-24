import { getWordpressSiteUrl } from "@/lib/wordpress-urls";

/**
 * When Woo has no `energy-rating` URL, we mirror **JetEngine > Glossaries > Energy rating**:
 * generic EU badge SVGs under `wp-content/uploads/…` on the WordPress host.
 *
 * @see Peisbutikken JetEngine glossary "Energy rating" (manual label → SVG URL map)
 */
const EU_LABEL_UPLOAD_DEFAULT = "/wp-content/uploads/2025/05/eu-energy-label-";

/**
 * Slugs whose SVG path differs from `{default}{slug}.svg` (per glossary / media library).
 * Keys are the same slugs as {@link energyClassToEuBadgeSlug}.
 */
const EU_LABEL_BADGE_RELATIVE_PATH_BY_SLUG: Record<string, string> = {
  // Glossary uses 2026/01 for C; A–B stay under 2025/05.
  c: "/wp-content/uploads/2026/01/eu-energy-label-c.svg",
};

/** Normalise meta / glossary text to a compact class token (e.g. `Rating: A++` → `A++`). */
function normalizeEnergyClassInput(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  return trimmed.replace(/^rating:\s*/i, "").replace(/\s+/g, "").toUpperCase();
}

/**
 * Maps energiklasse text (as in Woo meta or Jet glossary labels) to the SVG filename slug
 * (without path), e.g. `A++` → `a-plus-plus`, `A+` → `a-plus`, `B` → `b`.
 */
export function energyClassToEuBadgeSlug(
  energyLabel: string | null | undefined
): string | null {
  if (!energyLabel?.trim()) return null;
  const compact = normalizeEnergyClassInput(energyLabel);

  let m = /^([A-G])\+\+$/.exec(compact);
  if (m) return `${m[1].toLowerCase()}-plus-plus`;

  m = /^([A-G])\+$/.exec(compact);
  if (m) return `${m[1].toLowerCase()}-plus`;

  m = /^([A-G])$/.exec(compact);
  if (m) return m[1].toLowerCase();

  return null;
}

/**
 * Absolute URL to the small EU energimerke badge SVG on the WordPress site, or null if
 * the label is not a recognised class or `NEXT_PUBLIC_WORDPRESS_SITE_URL` is unset.
 */
export function resolveEuEnergyLabelBadgeUrlFromLetter(
  energyLabel: string | null | undefined
): string | null {
  const slug = energyClassToEuBadgeSlug(energyLabel);
  if (!slug) return null;
  const base = getWordpressSiteUrl();
  if (!base) return null;

  const relative =
    EU_LABEL_BADGE_RELATIVE_PATH_BY_SLUG[slug] ??
    `${EU_LABEL_UPLOAD_DEFAULT}${slug}.svg`;
  return `${base}${relative}`;
}
