/**
 * Curated SERP metadata for product brand archives (`/brand/{slug}/`).
 * Overrides WordPress brand description when present — WP text stays useful as
 * on-page intro unless `intro` is set.
 *
 * Keep meta descriptions ~150–160 characters for Google snippets.
 */

import { truncateMetaDescription } from "@/lib/seo/meta-description";

export type BrandArchiveSeoOverride = {
  /** Document title before the site template suffix (`| Peisbutikken`). */
  title: string;
  /** Meta / Open Graph / CollectionPage description. */
  metaDescription: string;
  /**
   * Optional on-page intro under the H1. Omit to keep the WordPress
   * brand description on the page.
   */
  intro?: string;
};

const BRAND_ARCHIVE_SEO: Record<string, BrandArchiveSeoOverride> = {
  aduro: {
    title: "Aduro – kjøp online peisovn og vedovn",
    metaDescription:
      "Kjøp Aduro hos Peisbutikken. Danske peisovner og vedovner med effektiv forbrenning. Filtrer modeller online. Showroom i Bærum og proff montering.",
    intro:
      "Finn Aduro peisovn og vedovn som passer stuen – filtrer på effekt, design og type, eller besøk showroom i Bærum for veiledning før kjøp.",
  },
  "christiania-kakkelovner": {
    title: "Christiania Kakkelovner – kjøp online kakkelovn",
    metaDescription:
      "Kjøp Christiania Kakkelovner hos Peisbutikken. Tradisjonelle kakkelovner og peisinnsatser. Se utvalget og bestill online. Showroom i Bærum og proff montering.",
    intro:
      "Utforsk Christiania Kakkelovner – tradisjonelle kakkelovner og peisinnsatser tilpasset norske hjem. Filtrer modeller og bestill online, eller få hjelp i showroom.",
  },
  dovre: {
    title: "Dovre – kjøp online vedovn og innsats",
    metaDescription:
      "Kjøp Dovre hos Peisbutikken. Belgiske vedovner og peisinnsatser med solid kvalitet. Filtrer modeller online. Showroom i Bærum og proff montering.",
    intro:
      "Se Dovre vedovner og peisinnsatser for stabil varme gjennom vinteren. Filtrer utvalget etter størrelse og effekt, eller kom innom showroom for råd.",
  },
  firefly: {
    title: "Firefly – kjøp online gasspeis og tilbehør",
    metaDescription:
      "Kjøp Firefly hos Peisbutikken. Gasspeiser med levende flamme og enkel betjening. Se modeller og bestill online. Showroom i Bærum og proff montering.",
    intro:
      "Finn Firefly gasspeis med ekte flamme uten ved – enkel drift og moderne design. Se modeller, sammenlign priser og bestill trygt online.",
  },
  element4: {
    title: "Element4 – kjøp online gasspeis og tilbehør",
    metaDescription:
      "Kjøp Element4 hos Peisbutikken. Gasspeiser med moderne design og levende flamme. Utforsk utvalget og bestill online. Showroom i Bærum og proff montering.",
    intro:
      "Utforsk Element4 gasspeiser med stilig design og levende flamme. Filtrer modeller etter størrelse og utforming, eller besøk showroom i Bærum.",
  },
  exodraft: {
    title: "Exodraft – kjøp online røyksuger og pipeteknikk",
    metaDescription:
      "Kjøp Exodraft hos Peisbutikken. Røyksugere og pipeteknikk for bedre trekk, mindre røyk og mer komfort. Se utvalget og bestill online. Showroom i Bærum.",
    intro:
      "Finn Exodraft røyksuger og pipeteknikk som gir bedre trekk og renere fyring. Se kompatible modeller og bestill online med rask levering.",
  },
  hajduk: {
    title: "Hajduk – kjøp online peisinnsats og ildsted",
    metaDescription:
      "Kjøp Hajduk hos Peisbutikken. Peisinnsatser og ildsteder med høy effektivitet. Filtrer modeller og finn riktig størrelse. Showroom i Bærum og proff montering.",
    intro:
      "Se Hajduk peisinnsatser og ildsteder for høy virkningsgrad og langvarig varme. Filtrer på effekt og størrelse, eller få monteringshjelp i showroom.",
  },
  heatro: {
    title: "Heatro – kjøp online peistilbehør og pipedeler",
    metaDescription:
      "Kjøp Heatro hos Peisbutikken. Peistilbehør og pipedeler for trygg og effektiv drift. Se utvalget og bestill enkelt online. Showroom i Bærum. Rask levering.",
    intro:
      "Utforsk Heatro peistilbehør og pipedeler for trygg og effektiv peisdrift. Finn riktige deler til din løsning og bestill enkelt online.",
  },
  jydepejsen: {
    title: "Jydepejsen – kjøp online peisovn og vedovn",
    metaDescription:
      "Kjøp Jydepejsen hos Peisbutikken. Dansk peisovn og vedovn i kleberstein og sandstein – stort utvalg og rask levering. Showroom i Bærum og proff montering.",
    intro:
      "Utforsk Jydepejsen peisovner og vedovner i nettbutikken – filtrer på modell, overflate og effekt. Besøk showroom i Bærum for å se utvalgte modeller og få hjelp til valg og montering.",
  },
  justus: {
    title: "Justus – kjøp online peisovn og vedovn",
    metaDescription:
      "Kjøp Justus hos Peisbutikken. Tyske peisovner og vedovner med høy virkningsgrad og tidløst design – se utvalget online. Showroom i Bærum og proff montering.",
    intro:
      "Finn Justus peisovn og vedovn som passer stuen – fra kompakte modeller til større glassfront. Filtrer utvalget online eller få veiledning i showroom i Bærum.",
  },
  nordpeis: {
    title: "Nordpeis – kjøp online peis og peisovn",
    metaDescription:
      "Kjøp Nordpeis hos Peisbutikken. Peisovn, vedovn, peisinnsats og utepeis – se hele sortimentet samlet online. Showroom i Bærum og proff montering.",
    intro:
      "Se hele Nordpeis-sortimentet hos Peisbutikken – peisovn, vedovn, innsats og utepeis. Filtrer på type og effekt, eller besøk showroom i Bærum for personlig veiledning.",
  },
  oranier: {
    title: "Oranier – kjøp online peisovn og vedovn",
    metaDescription:
      "Kjøp Oranier hos Peisbutikken. Tyske peisovner og vedovner med moderne design og høy virkningsgrad – stort utvalg online. Showroom i Bærum og proff montering.",
    intro:
      "Utforsk Oranier peisovner og vedovner i nettbutikken – filtrer på størrelse, effekt og uttrykk. Vi hjelper deg med valg og montering i showroom i Bærum.",
  },
  "ruegg-cheminee": {
    title: "Rüegg Cheminèe – kjøp online peissystemer",
    metaDescription:
      "Kjøp Rüegg Cheminèe hos Peisbutikken. Sveitsiske peissystemer, piper og tilbehør – profesjonell veiledning og montering. Showroom i Bærum og proff montering.",
    intro:
      "Finn Rüegg Cheminèe piper, peissystemer og tilbehør hos Peisbutikken. Se utvalget online eller få hjelp til riktig løsning og montering i showroom i Bærum.",
  },
  skantherm: {
    title: "Skantherm – kjøp online peisinnsats og ovn",
    metaDescription:
      "Kjøp Skantherm hos Peisbutikken. Tyske peisinnsatser og peisovner med rent design og høy virkningsgrad online. Showroom i Bærum og proff montering.",
    intro:
      "Se Skantherm peisinnsatser og peisovner hos Peisbutikken – filtrer på størrelse, glass og effekt. Besøk showroom i Bærum for veiledning før kjøp og montering.",
  },
  spartherm: {
    title: "Spartherm – kjøp online peisinnsats og ovn",
    metaDescription:
      "Kjøp Spartherm hos Peisbutikken. Premium peisinnsatser og peisovner med stort glassareal og høy effekt online. Showroom i Bærum og proff montering.",
    intro:
      "Utforsk Spartherm peisinnsatser og peisovner – fra kompakte modeller til brede glassfront. Filtrer utvalget online eller se modeller og få råd i showroom i Bærum.",
  },
  dru: {
    title: "Dru – kjøp online gasspeis og peis",
    metaDescription:
      "Kjøp Dru hos Peisbutikken. Gasspeiser og peisløsninger med moderne design. Se modeller og bestill online. Showroom i Bærum og proff montering.",
  },
  "trimline-fires": {
    title: "Trimline Fires – kjøp online gasspeis",
    metaDescription:
      "Kjøp Trimline Fires hos Peisbutikken. Moderne gasspeiser med rent design og enkel betjening. Utforsk utvalget online. Showroom i Bærum.",
  },
  peisbutikkenas: {
    title: "Peisbutikken – egne produkter og tilbehør",
    metaDescription:
      "Se produkter fra Peisbutikken AS. Tilbehør, reservedeler og utstyr til peis og ovn – bestill online. Showroom i Bærum og rask levering.",
  },
  schiedel: {
    title: "Schiedel – kjøp online pipe og skorstein",
    metaDescription:
      "Kjøp Schiedel hos Peisbutikken. Pipe- og skorsteinssystemer for trygg røykavtrekk. Se utvalget og få råd om montering. Showroom i Bærum.",
  },
  "la-nordica": {
    title: "La Nordica – kjøp online peisovn og vedovn",
    metaDescription:
      "Kjøp La Nordica hos Peisbutikken. Italienske peisovner og vedovner med solid kvalitet. Filtrer modeller online. Showroom i Bærum og proff montering.",
  },
  spahuset: {
    title: "Spahuset – kjøp online peis og tilbehør",
    metaDescription:
      "Kjøp Spahuset hos Peisbutikken. Peis og tilbehør til hjem og hytte. Se utvalget og bestill online. Showroom i Bærum.",
  },
  rb73: {
    title: "RB73 – kjøp online peisovn og ildsted",
    metaDescription:
      "Kjøp RB73 hos Peisbutikken. Peisovner og ildsteder med tydelig design. Utforsk modellene online. Showroom i Bærum og proff montering.",
  },
  skamotec: {
    title: "Skamotec – kjøp online brannmur og byggesystem",
    metaDescription:
      "Kjøp Skamotec hos Peisbutikken. Brannmur og byggesystem rundt peis og ovn. Se plater og løsninger online. Showroom i Bærum.",
  },
  heta: {
    title: "Heta – kjøp online peisovn og vedovn",
    metaDescription:
      "Kjøp Heta hos Peisbutikken. Danske peisovner og vedovner med effektiv forbrenning. Filtrer modeller online. Showroom i Bærum.",
  },
  kratki: {
    title: "Kratki – kjøp online peisinnsats og ovn",
    metaDescription:
      "Kjøp Kratki hos Peisbutikken. Peisinnsatser og ovner i moderne design. Se utvalget og bestill online. Showroom i Bærum.",
  },
  girse: {
    title: "GIRSE – kjøp online peistilbehør",
    metaDescription:
      "Kjøp GIRSE hos Peisbutikken. Peistilbehør og utstyr til peis og ovn. Bestill enkelt online. Showroom i Bærum.",
  },
  schmid: {
    title: "Schmid – kjøp online peisinnsats og ovn",
    metaDescription:
      "Kjøp Schmid hos Peisbutikken. Peisinnsatser og ovner med høy kvalitet. Filtrer modeller online. Showroom i Bærum og proff montering.",
  },
};

export function getBrandArchiveSeo(
  brandSlug: string
): BrandArchiveSeoOverride | null {
  const slug = brandSlug.trim().toLocaleLowerCase("nb-NO");
  if (!slug) return null;
  return BRAND_ARCHIVE_SEO[slug] ?? null;
}

function isThinBrandMetaDescription(text: string): boolean {
  if (text.length < 80) return true;
  return /^Produkter fra /i.test(text);
}

function defaultBrandMetaDescription(brandName: string): string {
  const name = brandName.trim() || "merkevare";
  return truncateMetaDescription(
    `Kjøp ${name} hos Peisbutikken. Se modeller og tilbehør online, filtrer utvalget og få hjelp i showroom i Bærum – også med montering.`
  );
}

/**
 * Prefer curated meta; otherwise truncate WP body. Thin nav templates get a
 * stronger Norwegian default (~150 chars) with showroom cues.
 */
export function resolveBrandArchiveMetaDescription(
  brandSlug: string,
  sourceDescription: string | null | undefined,
  brandName?: string | null
): string {
  const curated = getBrandArchiveSeo(brandSlug)?.metaDescription;
  if (curated) return curated;
  const truncated = truncateMetaDescription(sourceDescription);
  if (truncated && !isThinBrandMetaDescription(truncated)) return truncated;
  const fromNav = truncated.match(/^Produkter fra (.+)$/i)?.[1];
  return defaultBrandMetaDescription(brandName?.trim() || fromNav || "merkevare");
}

export function resolveBrandArchiveDocumentTitle(
  brandSlug: string,
  heroTitle: string
): string {
  const curated = getBrandArchiveSeo(brandSlug)?.title;
  if (curated) return curated;
  const name = heroTitle.trim();
  if (!name) return "Merke";
  if (/kjøp online|hos Peisbutikken| – /.test(name)) return name;
  return `${name} – kjøp online hos Peisbutikken`;
}

export function resolveBrandArchiveIntro(
  brandSlug: string,
  wpOrFallbackIntro: string | null | undefined
): string | undefined {
  const curated = getBrandArchiveSeo(brandSlug)?.intro;
  if (curated) return curated;
  return wpOrFallbackIntro?.trim() || undefined;
}
