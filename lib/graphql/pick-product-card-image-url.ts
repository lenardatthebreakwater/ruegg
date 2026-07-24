/**
 * Choose a WordPress-generated product image URL suitable for archive/search cards.
 * Only returns URLs present in the GraphQL payload (never invents `-300x300` paths).
 */

export type WooImageSizeNode = {
  name?: string | null;
  sourceUrl?: string | null;
  width?: number | string | null;
  height?: number | string | null;
};

export type WooImageWithSizes = {
  sourceUrl?: string | null;
  mediaDetails?: {
    width?: number | null;
    height?: number | null;
    sizes?: WooImageSizeNode[] | null;
  } | null;
};

/** Preferred WP/Woo size names for catalog cards (~300px). */
const PREFERRED_CARD_SIZE_NAMES = [
  "woocommerce_thumbnail",
  "shop_catalog",
  "medium",
  "woocommerce_single",
  "shop_single",
  "medium_large",
] as const;

/** Ideal width for card display (~280 CSS px @1–2x DPR). */
const CARD_TARGET_WIDTH = 400;
const CARD_MIN_USEFUL_WIDTH = 240;
const CARD_MAX_USEFUL_WIDTH = 900;

function trimUrl(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** WPGraphQL often returns size width/height as strings. */
function toPositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

/**
 * Pick the best card image URL from full `sourceUrl` + `mediaDetails.sizes`.
 * Falls back to full `sourceUrl` when no intermediate sizes exist (e.g. some AVIFs).
 */
export function pickProductCardImageUrl(
  image: WooImageWithSizes | null | undefined
): string | null {
  const full = trimUrl(image?.sourceUrl);
  if (!full) return null;

  const sizes = (image?.mediaDetails?.sizes ?? [])
    .map((size) => {
      const sourceUrl = trimUrl(size.sourceUrl);
      const width = toPositiveInt(size.width);
      const name =
        typeof size.name === "string" && size.name.trim().length > 0
          ? size.name.trim().toLowerCase()
          : null;
      return sourceUrl
        ? {
            sourceUrl,
            width,
            name,
          }
        : null;
    })
    .filter((size): size is NonNullable<typeof size> => size != null);

  if (sizes.length === 0) return full;

  for (const preferred of PREFERRED_CARD_SIZE_NAMES) {
    const hit = sizes.find((size) => size.name === preferred);
    if (!hit) continue;
    // Skip "sizes" that are just the full file under another name.
    if (hit.sourceUrl === full && (hit.width == null || hit.width >= 1000)) {
      continue;
    }
    if (hit.width != null && hit.width < CARD_MIN_USEFUL_WIDTH) continue;
    if (hit.width != null && hit.width > CARD_MAX_USEFUL_WIDTH) continue;
    return hit.sourceUrl;
  }

  const inBand = sizes.filter(
    (size) =>
      size.width != null &&
      size.width >= CARD_MIN_USEFUL_WIDTH &&
      size.width <= CARD_MAX_USEFUL_WIDTH &&
      size.sourceUrl !== full
  );
  if (inBand.length > 0) {
    inBand.sort(
      (a, b) =>
        Math.abs((a.width ?? 0) - CARD_TARGET_WIDTH) -
        Math.abs((b.width ?? 0) - CARD_TARGET_WIDTH)
    );
    return inBand[0]!.sourceUrl;
  }

  return full;
}
