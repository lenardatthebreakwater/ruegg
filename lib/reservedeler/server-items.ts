import "server-only";

import { normalizeReservedelerItemTitle } from "@/lib/reservedeler/normalize-item-title";
import { getReservedelerSectionBrand } from "@/lib/reservedeler/section-brand";
import type {
  ReservedelerItemCard,
  ReservedelerItemsApiResponse,
  ReservedelerItemSourceRecord,
} from "@/lib/reservedeler/types";
import { getWordpressReservedelerItemsUrl } from "@/lib/wordpress-urls";

const RESERVED_ITEMS_REVALIDATE_SECONDS = 60 * 10;

function normalizeSlug(value: string | null | undefined): string | null {
  const trimmed = value?.trim().toLocaleLowerCase("nb-NO");
  return trimmed ? trimmed : null;
}

function normalizeTitle(record: ReservedelerItemSourceRecord): string | null {
  const raw = record.name?.trim() || record.title?.trim() || "";
  return raw.length > 0 ? raw : null;
}

function normalizeImageUrl(record: ReservedelerItemSourceRecord): string | null {
  const value =
    record.imageUrl?.trim() || record.reservedelerCardImage?.trim() || null;
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return null;
}

function mapRecordToCard(
  record: ReservedelerItemSourceRecord
): ReservedelerItemCard | null {
  const brandSlug = normalizeSlug(record.brandSlug);
  const itemSlug = normalizeSlug(record.itemSlug ?? record.itemTermSlug);
  const rawTitle = normalizeTitle(record);
  const imageUrl = normalizeImageUrl(record);
  if (!brandSlug || !itemSlug || !rawTitle) return null;

  return {
    brandSlug,
    itemSlug,
    rawTitle,
    displayTitle: normalizeReservedelerItemTitle(rawTitle),
    imageUrl,
    imageAlt:
      record.imageAlt?.trim() ||
      record.reservedelerCardImageAlt?.trim() ||
      normalizeReservedelerItemTitle(rawTitle),
    reservedelerTaxonomy: record.reservedelerTaxonomy ?? null,
  };
}

function dedupeByRoute(items: ReservedelerItemCard[]): ReservedelerItemCard[] {
  const byKey = new Map<string, ReservedelerItemCard>();
  for (const item of items) {
    const key = `${item.brandSlug}:${item.itemSlug}`;
    if (byKey.has(key)) continue;
    byKey.set(key, item);
  }
  return [...byKey.values()];
}

export async function getReservedelerItems(): Promise<ReservedelerItemCard[]> {
  const endpointUrl = getWordpressReservedelerItemsUrl();
  if (!endpointUrl) return [];
  const isDev = process.env.NODE_ENV === "development";

  try {
    const response = await fetch(endpointUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: isDev ? "no-store" : "force-cache",
      ...(isDev
        ? {}
        : {
            next: {
              revalidate: RESERVED_ITEMS_REVALIDATE_SECONDS,
              tags: ["reservedeler:items"],
            },
          }),
    });
    if (!response.ok) return [];

    const json = (await response.json()) as
      | ReservedelerItemsApiResponse
      | ReservedelerItemSourceRecord[];
    const records = Array.isArray(json)
      ? json
      : Array.isArray(json.items)
        ? json.items
        : [];

    const mapped = dedupeByRoute(
      records
        .map(mapRecordToCard)
        .filter((item): item is ReservedelerItemCard => item != null)
    );

    return mapped.sort((a, b) =>
      a.displayTitle.localeCompare(b.displayTitle, "nb-NO")
    );
  } catch {
    return [];
  }
}

export async function getReservedelerItemByRoute(
  brandSlug: string,
  itemSlug: string
): Promise<ReservedelerItemCard | null> {
  const items = await getReservedelerItems();
  const normalizedBrand = normalizeSlug(brandSlug);
  const normalizedItem = normalizeSlug(itemSlug);
  if (!normalizedBrand || !normalizedItem) return null;

  return (
    items.find((item) => {
      if (item.itemSlug !== normalizedItem) return false;
      if (item.brandSlug === normalizedBrand) return true;
      return getReservedelerSectionBrand(item) === normalizedBrand;
    }) ?? null
  );
}
