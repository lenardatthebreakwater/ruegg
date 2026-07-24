/** Soft length target for auto-truncated WP descriptions used as meta. */
export const META_DESCRIPTION_MAX = 158;

/**
 * Truncate long WP/archive body copy so SERP snippets stay readable.
 * Prefers a word boundary when the source exceeds `max`.
 */
export function truncateMetaDescription(
  text: string | null | undefined,
  max = META_DESCRIPTION_MAX
): string {
  if (!text?.trim()) return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;

  const slice = cleaned.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const cut =
    lastSpace > Math.floor(max * 0.6) ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[.,;:!?–—-]*$/, "").trimEnd()}…`;
}
