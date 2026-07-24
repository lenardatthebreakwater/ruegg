/**
 * Parse Jet Engine / WooCommerce meta values that may store an image as
 * a direct URL, JSON object/array, or (handled elsewhere) a numeric attachment ID.
 */
export function parseMetaImageValue(rawValue: string | null): string | null {
  if (!rawValue) return null;
  const trimmed = rawValue.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  try {
    const parsed = JSON.parse(trimmed) as
      | { url?: string; sourceUrl?: string; src?: string }
      | Array<{ url?: string; sourceUrl?: string; src?: string }>;

    if (Array.isArray(parsed)) {
      const first = parsed[0];
      const fromArray = first?.url ?? first?.sourceUrl ?? first?.src ?? null;
      return typeof fromArray === "string" && /^https?:\/\//i.test(fromArray)
        ? fromArray
        : null;
    }

    const fromObject = parsed?.url ?? parsed?.sourceUrl ?? parsed?.src ?? null;
    return typeof fromObject === "string" && /^https?:\/\//i.test(fromObject)
      ? fromObject
      : null;
  } catch {
    return null;
  }
}
