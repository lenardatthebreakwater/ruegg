/**
 * Curated SERP metadata for reservedeler model pages
 * (`/{family}-deler/{itemSlug}/`). Overrides thin/empty WordPress term
 * descriptions when present — WP text stays useful as on-page intro unless
 * `intro` is set.
 *
 * Keep meta descriptions ~150–160 characters for Google snippets.
 */

import { truncateMetaDescription } from "@/lib/seo/meta-description";

export type ReservedelerItemSeoOverride = {
  /** Document title before the site template suffix (`| Peisbutikken`). */
  title: string;
  /** Meta / Open Graph / CollectionPage description. */
  metaDescription: string;
  /**
   * Optional on-page intro under the H1. Omit to keep the WordPress
   * term description on the page.
   */
  intro?: string;
};

/** Prefer WP term copy when it is long enough to be useful in SERPs. */
const MIN_USEFUL_META_DESCRIPTION = 60;

const RESERVEDELER_ITEM_SEO: Record<string, ReservedelerItemSeoOverride> = {
  "aduro-9-deler": {
    title: "Aduro 9 – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Aduro 9 hos Peisbutikken. Glass, pakninger, brennere og tilbehør som passer modellen. Bestill online. Rask levering.",
  },
  "aduro-9-air": {
    title: "Aduro 9 Air – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Aduro 9 Air hos Peisbutikken. Kompatible deler til peisovnen din – bestill online med rask levering fra Bærum.",
  },
  "aduro-14-deler": {
    title: "Aduro 14 – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Aduro 14 hos Peisbutikken. Se kompatible deler til peisovnen og bestill enkelt online. Rask levering.",
  },
  "aduro-15-deler": {
    title: "Aduro 15 – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Aduro 15 hos Peisbutikken. Glass, pakninger og andre deler som passer modellen. Bestill online. Rask levering.",
  },
  "aduro-15-lux-deler": {
    title: "Aduro 15 Lux – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Aduro 15 Lux hos Peisbutikken. Kompatible deler til peisovnen – bestill online med rask levering.",
  },
  "aduro-1-1sk-deler": {
    title: "Aduro 1.1SK – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Aduro 1.1SK hos Peisbutikken. Glass, pakninger og deler som passer peisovnen. Bestill online. Rask levering.",
  },
  "aduro-h1-deler": {
    title: "Aduro H1 – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Aduro H1 hybridovn hos Peisbutikken. Se kompatible deler og bestill online. Rask levering fra showroom i Bærum.",
  },
  "aduro-h2-deler": {
    title: "Aduro H2 – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Aduro H2 hybridovn hos Peisbutikken. Kompatible deler til ovnen din – bestill online med rask levering.",
  },
  "aduro-h3-lux-deler": {
    title: "Aduro H3 Lux – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Aduro H3 Lux hos Peisbutikken. Se deler som passer hybridovnen og bestill enkelt online. Rask levering.",
  },
  "dovre-sense-100-deler": {
    title: "Dovre Sense 100 – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Dovre Sense 100 hos Peisbutikken. Kompatible deler til peisovnen – bestill online. Rask levering.",
  },
  "dovre-sense-200-deler": {
    title: "Dovre Sense 200 – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Dovre Sense 200 hos Peisbutikken. Se glass, pakninger og tilbehør som passer. Bestill online. Rask levering.",
  },
  "dovre-sense-300-deler": {
    title: "Dovre Sense 300 – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Dovre Sense 300 hos Peisbutikken. Kompatible deler til peisovnen – bestill online med rask levering.",
  },
  "dovre-vintage-30-deler": {
    title: "Dovre Vintage 30 – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Dovre Vintage 30 hos Peisbutikken. Se kompatible deler og bestill online. Rask levering fra Bærum.",
  },
  "dovre-vintage-35-deler": {
    title: "Dovre Vintage 35 – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Dovre Vintage 35 hos Peisbutikken. Kompatible deler til peisovnen – bestill online. Rask levering.",
  },
  "dovre-astroline-astro1-deler": {
    title: "Dovre Astroline – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Dovre Astroline / Astro1 hos Peisbutikken. Se kompatible deler og bestill online. Rask levering.",
  },
  "nordpeis-me-reservedeler": {
    title: "Nordpeis Me – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Nordpeis Me hos Peisbutikken. Kompatible deler til peisen – bestill online med rask levering.",
  },
  "nordpeis-monaco-reservedeler": {
    title: "Nordpeis Monaco – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Nordpeis Monaco hos Peisbutikken. Se deler som passer modellen og bestill online. Rask levering.",
  },
  "nordpeis-salzburg-m-reservedeler": {
    title: "Nordpeis Salzburg M – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Nordpeis Salzburg M hos Peisbutikken. Kompatible deler til elementpeisen – bestill online. Rask levering.",
  },
  "nordpeis-duo-reservedeler": {
    title: "Nordpeis Duo – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Nordpeis Duo hos Peisbutikken. Se kompatible deler og bestill enkelt online. Rask levering.",
  },
  "nordpeis-bergen-reservedeler": {
    title: "Nordpeis Bergen – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Nordpeis Bergen hos Peisbutikken. Kompatible deler til peisen – bestill online. Rask levering.",
  },
  "jydepejsen-country-reservedeler": {
    title: "Jydepejsen Country – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Jydepejsen Country hos Peisbutikken. Se kompatible deler og bestill online. Rask levering.",
  },
  "jydepejsen-cosmo-reservedeler": {
    title: "Jydepejsen Cosmo – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Jydepejsen Cosmo hos Peisbutikken. Kompatible deler til peisovnen – bestill online. Rask levering.",
  },
  "jydepejsen-sigma-reservedeler": {
    title: "Jydepejsen Sigma – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Jydepejsen Sigma hos Peisbutikken. Se deler som passer modellen og bestill online. Rask levering.",
  },
  "jydepejsen-sigma-duplex-reservedeler": {
    title: "Jydepejsen Sigma Duplex – kjøp reservedeler online",
    metaDescription:
      "Finn reservedeler til Jydepejsen Sigma Duplex hos Peisbutikken. Kompatible deler – bestill online med rask levering.",
  },
};

function isUsefulMetaDescription(text: string): boolean {
  return text.trim().length >= MIN_USEFUL_META_DESCRIPTION;
}

export function getReservedelerItemSeo(
  itemSlug: string
): ReservedelerItemSeoOverride | null {
  const slug = itemSlug.trim().toLocaleLowerCase("nb-NO");
  if (!slug) return null;
  return RESERVEDELER_ITEM_SEO[slug] ?? null;
}

/**
 * Prefer curated title; otherwise a unique Norwegian pattern with model intent
 * (site template adds `| Peisbutikken`).
 */
export function resolveReservedelerItemDocumentTitle(
  itemSlug: string,
  itemName: string
): string {
  return (
    getReservedelerItemSeo(itemSlug)?.title ??
    `${itemName} – kjøp reservedeler`
  );
}

/**
 * Prefer curated meta; else truncate a useful WP term description; else
 * auto-fallback with brand + model intent.
 */
export function resolveReservedelerItemMetaDescription(
  itemSlug: string,
  sourceDescription: string | null | undefined,
  itemName: string,
  brandName: string
): string {
  const curated = getReservedelerItemSeo(itemSlug)?.metaDescription;
  if (curated) return curated;

  const truncated = truncateMetaDescription(sourceDescription);
  if (isUsefulMetaDescription(truncated)) return truncated;

  return `Finn kompatible reservedeler til ${itemName} fra ${brandName} hos Peisbutikken. Bestill deler online med rask levering.`;
}

export function resolveReservedelerItemIntro(
  itemSlug: string,
  wpOrFallbackIntro: string | null | undefined
): string | undefined {
  const curated = getReservedelerItemSeo(itemSlug)?.intro;
  if (curated) return curated;
  return wpOrFallbackIntro?.trim() || undefined;
}
