import type { ReservedelerItemCard } from "@/lib/reservedeler/types";

function textMentionsAsgard(text: string): boolean {
  return /\b(asgård|asgard|asgaard)\b/i.test(text);
}

/**
 * Detects Asgård-line products when WordPress sends them as brandSlug `aduro`.
 * Uses taxonomy, slug, then title (in that order) to reduce false positives.
 */
function itemIndicatesAsgard(item: ReservedelerItemCard): boolean {
  const tax = item.reservedelerTaxonomy?.trim() ?? "";
  if (tax) {
    const t = tax.toLowerCase();
    if (
      t.includes("asgard") ||
      t.includes("asgård") ||
      t.includes("asgaard")
    ) {
      return true;
    }
  }

  const slug = item.itemSlug.toLowerCase();
  if (
    slug.startsWith("asgard") ||
    slug.startsWith("asgaard") ||
    slug.includes("-asgard-") ||
    slug.includes("-asgaard-")
  ) {
    return true;
  }

  if (
    textMentionsAsgard(item.rawTitle) ||
    textMentionsAsgard(item.displayTitle)
  ) {
    return true;
  }

  return false;
}

/**
 * Brand used for sections, filters, and item links. Splits Asgård from Aduro
 * when the API only provides `aduro` for both lines.
 */
export function getReservedelerSectionBrand(item: ReservedelerItemCard): string {
  if (
    item.brandSlug === "dovre" ||
    item.brandSlug === "nordpeis" ||
    item.brandSlug === "jydepejsen"
  ) {
    return item.brandSlug;
  }
  if (item.brandSlug === "asgard") {
    return "asgard";
  }
  if (item.brandSlug !== "aduro") {
    return item.brandSlug;
  }
  if (itemIndicatesAsgard(item)) {
    return "asgard";
  }
  return "aduro";
}
