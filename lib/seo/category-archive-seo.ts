/**
 * Curated SERP metadata for product category archives
 * (`/produktkategori/{slug}/`). Overrides WordPress category description when
 * present — WP text stays useful as long on-page intro unless `intro` is set.
 *
 * Keep meta descriptions ~150–160 characters for Google snippets.
 */

import { truncateMetaDescription } from "@/lib/seo/meta-description";

export type CategoryArchiveSeoOverride = {
  /** Document title before the site template suffix (`| Peisbutikken`). */
  title: string;
  /** Meta / Open Graph / CollectionPage description. */
  metaDescription: string;
  /**
   * Optional on-page intro under the H1. Omit to keep the WordPress
   * category description on the page.
   */
  intro?: string;
};

const CATEGORY_ARCHIVE_SEO: Record<string, CategoryArchiveSeoOverride> = {
  peisovn: {
    title: "Peisovn – kjøp online fra ledende merker",
    metaDescription:
      "Kjøp peisovn hos Peisbutikken. Stort utvalg fra Aduro, Nordpeis, Spartherm m.fl. Filtrer på effekt og design. Showroom i Bærum og proff montering.",
    intro:
      "Finn peisovn som passer stuen din – fra kompakte modeller til bredt glassareal. Vi fører Aduro, Nordpeis, Spartherm og flere merker. Filtrer på effekt, type og design, eller besøk showroom i Bærum for veiledning før kjøp.",
  },
  vedovn: {
    title: "Vedovn – kjøp online fra ledende merker",
    metaDescription:
      "Kjøp vedovn hos Peisbutikken. Stort utvalg fra Aduro, Dovre og Nordpeis m.fl. Filtrer på effekt og størrelse. Showroom i Bærum og proff montering.",
    intro:
      "Finn vedovn til stue eller hytte – kompakte modeller med høy virkningsgrad og effektiv vedfyring. Filtrer på effekt, plassering og merke, eller se utvalget i showroom i Bærum.",
  },
  elementpeis: {
    title: "Elementpeis – kjøp online fra ledende merker",
    metaDescription:
      "Kjøp elementpeis hos Peisbutikken. Varmelagrende peiser fra Nordpeis og Spartherm m.fl. Filtrer på effekt og utforming. Showroom i Bærum og proff montering.",
    intro:
      "Velg varmelagrende elementpeis som gir jevn varme over tid og tidløst uttrykk. Filtrer på effekt, utforming og merke, eller få veiledning i showroom i Bærum.",
  },
  peisinnsats: {
    title: "Peisinnsats – kjøp online fra ledende merker",
    metaDescription:
      "Kjøp peisinnsats hos Peisbutikken. Innsatser fra Dovre, Nordpeis og Spartherm m.fl. Filtrer på størrelse og effekt. Showroom i Bærum og proff montering.",
    intro:
      "Oppgrader peisbygget med peisinnsats som passer pipen og rommet. Filtrer på mål, effekt og merke, eller besøk showroom i Bærum for å sammenligne modeller.",
  },
  gasspeis: {
    title: "Gasspeis – kjøp online fra ledende merker",
    metaDescription:
      "Kjøp gasspeis hos Peisbutikken. Stort utvalg fra Element4 og flere merker. Filtrer på type, bredde og montering. Showroom i Bærum og proff montering.",
    intro:
      "Finn gasspeis med enkel tenning og realistisk flamme – fra innsatt til frittstående. Filtrer på type, bredde og merke, eller se modeller i showroom i Bærum.",
  },
  kakkelovn: {
    title: "Kakkelovn – kjøp online fra ledende merker",
    metaDescription:
      "Kjøp kakkelovn hos Peisbutikken. Varmelagrende ovner med tidløst kakkeldesign. Filtrer på størrelse og uttrykk. Showroom i Bærum og proff montering.",
    intro:
      "Se kakkelovner som gir langvarig varme og klassisk uttrykk i stuen. Filtrer på størrelse og design, eller besøk showroom i Bærum for å se utvalget.",
  },
  utepeis: {
    title: "Utepeis – kjøp online fra ledende merker",
    metaDescription:
      "Kjøp utepeis hos Peisbutikken. Modeller til hage og terrasse fra Nordpeis m.fl. Filtrer på type og størrelse. Showroom i Bærum og proff montering.",
    intro:
      "Finn utepeis til hage, terrasse eller uteplass – fra kompakte modeller til større løsninger. Filtrer på type og størrelse, eller få råd i showroom i Bærum.",
  },
  brannmur: {
    title: "Brannmur – kjøp online til peis og ovn",
    metaDescription:
      "Kjøp brannmur hos Peisbutikken. Trygg avskjerming som holder varmen på plass ved peis og ovn. Se utvalg i ulike størrelser og finish. Showroom i Bærum.",
    intro:
      "Finn brannmur som passer peisen eller ovnen din – trygg avskjerming som holder varmen på plass. Se modeller i ulike størrelser og finish, og bestill enkelt online.",
  },
  gulvplate: {
    title: "Gulvplate – kjøp online til peis og ovn",
    metaDescription:
      "Kjøp gulvplate hos Peisbutikken. Beskytt gulvet under peis og ovn med plater i riktig størrelse og finish. Bestill enkelt online med rask levering.",
    intro:
      "Beskytt gulvet under peis og ovn med gulvplate i riktig mål og utseende. Filtrer utvalget og bestill det du trenger – vi sender raskt.",
  },
  opptenning: {
    title: "Opptenning – kjøp online til peis og vedovn",
    metaDescription:
      "Kjøp opptenning hos Peisbutikken. Få ilden raskt i gang med opptenningsblokker, tennbriketter og tilbehør til peis og vedovn. Bestill online. Rask levering.",
    intro:
      "Ten peisen enklere med opptenningsblokker, tennbriketter og praktisk tilbehør. Se utvalget og få rask levering hjem.",
  },
  peistilbehor: {
    title: "Tilbehør – kjøp online til peis og ovn",
    metaDescription:
      "Kjøp tilbehør hos Peisbutikken. Alt du trenger rundt peis og ovn – rør, ventiler, rengjøring og sikkerhetsutstyr i ett stort utvalg. Showroom i Bærum.",
    intro:
      "Alt til peis og ovn samlet – fra små detaljer til praktisk utstyr du bruker ofte. Bla i kategorien og finn det du mangler.",
  },
  rengjoring: {
    title: "Rengjøring – kjøp online til peis og ovn",
    metaDescription:
      "Kjøp rengjøring hos Peisbutikken. Hold peis, glass og ovn i stand med riktige rengjøringsmidler og verktøy. Bestill enkelt online. Rask levering.",
    intro:
      "Hold peis, glass og ovn penere med riktige rengjøringsmidler og verktøy. Bestill det du trenger online – raskt levert hjem.",
  },
  ventiler: {
    title: "Ventiler – kjøp online til vedovn og peis",
    metaDescription:
      "Kjøp ventiler hos Peisbutikken. Styr lufttilførsel til vedovn og peis med ventiler og tilbehør som gir bedre forbrenning og effekt. Showroom i Bærum.",
    intro:
      "Styr lufttilførselen til vedovn og peis med ventiler som gir bedre forbrenning. Se modeller og tilbehør, og bestill det som passer installasjonen din.",
  },
  royksuger: {
    title: "Røyksuger – kjøp online til peis og pipe",
    metaDescription:
      "Kjøp røyksuger hos Peisbutikken. Få røyken ut av stua raskt når du tenner peisen. Se modeller og tilbehør for tryggere opptenning. Rask levering.",
    intro:
      "Slipp røykskyer i stua ved opptenning – se røyksugere og tilbehør som gjør tenning tryggere og mer komfortabel. Bestill online med rask levering.",
  },
  stalpipe: {
    title: "Stålpipe – kjøp online til peis og røykløp",
    metaDescription:
      "Kjøp stålpipe hos Peisbutikken. Komplett utvalg av stålpipe, bend, stuss og tilkoblinger til peis og ildsted. Få hjelp til riktig løsning. Rask levering.",
    intro:
      "Bygg eller oppgrader røykløpet med stålpipe, bend, stuss og tilkoblinger i riktig mål. Se utvalget og få hjelp til å finne komplette løsninger.",
  },
  "ror-og-tilkoblingsstuss": {
    title: "Rør og tilkobling – kjøp online til pipe",
    metaDescription:
      "Kjøp rør og tilkobling hos Peisbutikken. Finn stuss, bend og tilkoblinger til pipe og peis i riktig mål og kvalitet for trygg installasjon. Showroom i Bærum.",
    intro:
      "Finn rør, stuss og tilkoblinger til pipe og peis i riktig dimensjon og kvalitet. Bestill delene du trenger – eller besøk showroom i Bærum for veiledning.",
  },
  reservedeler: {
    title: "Reservedeler – kjøp online til peis og ovn",
    metaDescription:
      "Kjøp reservedeler hos Peisbutikken. Finn deler til peisovn og vedovn fra Aduro, Nordpeis, Dovre m.fl. Bestill riktig del online. Showroom i Bærum.",
    intro:
      "Finn reservedeler til peisovn og vedovn – fra glass og pakninger til rister og håndtak. Velg merke og modell, eller få hjelp i showroom i Bærum.",
  },
  pipe: {
    title: "Pipe – kjøp online til peis og ildsted",
    metaDescription:
      "Kjøp pipe og pipetilbehør hos Peisbutikken. Stålpipe, bend og tilkoblinger for trygg røykavtrekk til peis og ovn. Showroom i Bærum og proff montering.",
    intro:
      "Utforsk pipe og pipetilbehør til peis og ildsted. Vi hjelper deg å finne riktig dimensjon og løsning – online eller i showroom i Bærum.",
  },
  peisoutlet: {
    title: "Peisoutlet – tilbud på peis og ovn",
    metaDescription:
      "Handle peisoutlet hos Peisbutikken. Finn peisovn, vedovn og tilbehør til nedsatt pris. Begrenset antall – se utvalget online. Showroom i Bærum.",
    intro:
      "Se peiser og ovner på outlet-pris – gode merker til nedsatt pris mens lageret varer. Filtrer utvalget online eller spør oss i showroom.",
  },
  lagersalg: {
    title: "Lagersalg – tilbud på peis og tilbehør",
    metaDescription:
      "Handle lagersalg hos Peisbutikken. Peis, ovn og tilbehør til redusert pris fra lageret. Se aktuelle tilbud online. Showroom i Bærum.",
    intro:
      "Utforsk lagersalg på peis, ovn og tilbehør. Prisene gjelder så lenge lageret rekker – bestill online eller kom innom showroom i Bærum.",
  },
  montering: {
    title: "Montering – peismontering og befaring",
    metaDescription:
      "Bestill montering hos Peisbutikken. Proff peismontering, befaring og råd om pipe og ildsted. Ta kontakt for uforpliktende tilbud. Showroom i Bærum.",
    intro:
      "Vi monterer peis og ovn trygt og forskriftsmessig. Be om befaring eller tilbud – vi hjelper deg fra valg av modell til ferdig installasjon.",
  },
  "varmelagrende-peis": {
    title: "Varmelagrende peis – kjøp online",
    metaDescription:
      "Kjøp varmelagrende peis hos Peisbutikken. Elementpeis og ovner som lagrer varme over tid. Filtrer modeller online. Showroom i Bærum og proff montering.",
    intro:
      "Velg varmelagrende peis for jevn varme lenge etter fyring. Se elementpeiser og tilpassede løsninger, eller få veiledning i showroom i Bærum.",
  },
  peisbord: {
    title: "Peisbord – kjøp online til peisovn",
    metaDescription:
      "Kjøp peisbord hos Peisbutikken. Praktiske peisbord og understell som gir trygg plassering og pen finish rundt peisovnen. Bestill online. Rask levering.",
  },
  "tilbehor-utepeis": {
    title: "Tilbehør utepeis – kjøp online",
    metaDescription:
      "Kjøp tilbehør til utepeis hos Peisbutikken. Finn deler og ekstrautstyr til utepeis og utemiljø. Bestill enkelt online. Showroom i Bærum.",
  },
  tilbehorpeis: {
    title: "Peissett og tilbehør – kjøp online",
    metaDescription:
      "Kjøp peissett og tilbehør hos Peisbutikken. Alt rundt peis og ovn – fra praktiske sett til smådeler. Stort utvalg online. Showroom i Bærum.",
  },
  "utstilt-i-butikken": {
    title: "Utstilt i butikken – se peis i showroom",
    metaDescription:
      "Se peiser utstilt i butikken hos Peisbutikken. Utforsk modeller i showroom i Bærum før du kjøper. Bestill online eller få råd på stedet.",
  },
};

/** Internal / non-customer category hubs — noindex in metadata + sitemap. */
const CATEGORY_ARCHIVE_NOINDEX = new Set([
  "visning",
  "ukategorisert",
  "uncategorized",
  "uncategorized-no",
]);

export function shouldNoindexCategoryArchive(categorySlug: string): boolean {
  const slug = categorySlug.trim().toLocaleLowerCase("nb-NO");
  if (!slug) return false;
  if (CATEGORY_ARCHIVE_NOINDEX.has(slug)) return true;
  // Brand “utvalgte” slices and CMS hub prefixes are not primary SERP landings.
  if (slug.endsWith("-utvalgte")) return true;
  if (slug.startsWith("peis-") && slug !== "peisinnsats" && slug !== "peistilbehor") {
    return true;
  }
  return false;
}

export function getCategoryArchiveSeo(
  categorySlug: string
): CategoryArchiveSeoOverride | null {
  const slug = categorySlug.trim().toLocaleLowerCase("nb-NO");
  if (!slug) return null;
  return CATEGORY_ARCHIVE_SEO[slug] ?? null;
}

function isThinCategoryMetaDescription(text: string): boolean {
  if (text.length < 80) return true;
  return /^Utforsk vårt utvalg av /i.test(text);
}

function defaultCategoryMetaDescription(categoryName: string): string {
  const name = categoryName.trim() || "kategorien";
  return truncateMetaDescription(
    `Utforsk ${name.toLocaleLowerCase("nb-NO")} hos Peisbutikken. Stort utvalg online med filtrering, showroom i Bærum og hjelp til valg og montering.`
  );
}

/**
 * Prefer curated meta; otherwise truncate WP body. Thin nav templates get a
 * stronger Norwegian default with showroom/montering cues.
 */
export function resolveCategoryArchiveMetaDescription(
  categorySlug: string,
  sourceDescription: string | null | undefined,
  categoryName?: string | null
): string {
  const curated = getCategoryArchiveSeo(categorySlug)?.metaDescription;
  if (curated) return curated;
  const truncated = truncateMetaDescription(sourceDescription);
  if (truncated && !isThinCategoryMetaDescription(truncated)) return truncated;
  return defaultCategoryMetaDescription(
    categoryName?.trim() || truncated.replace(/^Utforsk vårt utvalg av /i, "") || "produkter"
  );
}

export function resolveCategoryArchiveDocumentTitle(
  categorySlug: string,
  heroTitle: string
): string {
  const curated = getCategoryArchiveSeo(categorySlug)?.title;
  if (curated) return curated;
  const name = heroTitle.trim();
  if (!name) return "Produkter";
  if (/kjøp online|hos Peisbutikken| – /.test(name)) return name;
  return `${name} – kjøp online hos Peisbutikken`;
}

export function resolveCategoryArchiveIntro(
  categorySlug: string,
  wpOrFallbackIntro: string | null | undefined
): string | undefined {
  const curated = getCategoryArchiveSeo(categorySlug)?.intro;
  if (curated) return curated;
  return wpOrFallbackIntro?.trim() || undefined;
}
