/**
 * Curated SERP metadata for reservedeler family hubs
 * (`/aduro-deler/`, `/dovre-deler/`, `/nordpeis-deler/`).
 *
 * Keep meta descriptions ~150–160 characters for Google snippets.
 */

export type ReservedelerFamilySeoOverride = {
  /** Document title before the site template suffix (`| Peisbutikken`). */
  title: string;
  /** Meta / Open Graph / CollectionPage description. */
  metaDescription: string;
};

const RESERVEDELER_FAMILY_SEO: Record<string, ReservedelerFamilySeoOverride> = {
  "aduro-deler": {
    title: "Aduro reservedeler – finn deler til din modell",
    metaDescription:
      "Finn reservedeler til Aduro, Asgård og Jydepejsen. Velg modell og se kompatible deler. Bestill online hos Peisbutikken. Rask levering.",
  },
  "dovre-deler": {
    title: "Dovre reservedeler – finn deler til din modell",
    metaDescription:
      "Finn reservedeler til Dovre peisovner og innsatser. Velg modell og se kompatible deler. Bestill online hos Peisbutikken. Rask levering.",
  },
  "nordpeis-deler": {
    title: "Nordpeis reservedeler – finn deler til din modell",
    metaDescription:
      "Finn reservedeler til Nordpeis peiser og ovner. Velg modell og se kompatible deler. Bestill online hos Peisbutikken. Rask levering.",
  },
};

export function getReservedelerFamilySeo(
  familySlug: string
): ReservedelerFamilySeoOverride | null {
  const slug = familySlug.trim().toLocaleLowerCase("nb-NO");
  if (!slug) return null;
  return RESERVEDELER_FAMILY_SEO[slug] ?? null;
}

export function resolveReservedelerFamilyDocumentTitle(
  familySlug: string,
  fallbackTitle: string
): string {
  return getReservedelerFamilySeo(familySlug)?.title ?? fallbackTitle;
}

export function resolveReservedelerFamilyMetaDescription(
  familySlug: string,
  fallbackDescription: string
): string {
  return (
    getReservedelerFamilySeo(familySlug)?.metaDescription ?? fallbackDescription
  );
}
