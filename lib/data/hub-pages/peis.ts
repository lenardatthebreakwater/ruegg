import { buildCategoryHref } from "@/lib/routing/live-url-registry";

import { parseHubFeatureProse } from "./parse-hub-feature-prose";
import type { HubLandingPageContent } from "./types";

const IMG = "/images/hub-pages/peis";

/** WooCommerce product category slugs for carousels on `/peis/` (child categories under Peis). */
export type PeisHubCategoryCarousel = {
  slug: string;
  title: string;
  description?: string;
};

export const peisHubCategoryCarousels: readonly PeisHubCategoryCarousel[] = [
  {
    slug: "peis-peisovner",
    title: "Et utvalg av våre mest populære peisovner",
  },
  {
    slug: "peis-gasspeiser",
    title: "Et utvalg av våre mest populære gasspeiser",
  },
  {
    slug: "peis-peisinnsatser",
    title: "Et utvalg av våre mest populære peisinnsatser",
  },
  {
    slug: "peis-elementpeiser",
    title: "Et utvalg av våre mest populære elementpeiser",
  },
];

const PEIS_FEATURE_PROSE = `
Usikker på hvilken peis som passer boligen din? Start med rommet, driftsform og om du vil ha frittstående ovn, gasspeis eller innsats i eksisterende peis.

# Slik velger du riktig peis
Tenk på romstørrelse og effektbehov – en for liten peis varmer dårlig, mens en for stor kan bli ubehagelig. Vurder også brensel (ved, gass eller bioetanol), ventilasjon og om du trenger ny pipe eller kan bruke eksisterende opplegg.

# Peisovn, gasspeis eller peisinnsats?
Peisovner er populære som hovedvarme i stue og hytte og krever ofte lite arbeid ved installasjon. Gasspeiser gir ekte flammer uten vedfyring og passer godt der du vil ha enkel drift. Peisinnsatser er løsningen når du bygger peis selv eller skal oppgradere gammel murstein.

# Få hjelp til valg og montering
Hos Peisbutikken får du veiledning på modell, effekt og tilbehør – og vi bistår med montering og service i Bærum og omegn. Ta gjerne kontakt for en uforpliktende peisprat.
`.trim();

export const peisHubLandingContent: HubLandingPageContent = {
  seo: {
    title: "Peiser til hjemmet – velg peisovn, gasspeis eller innsats",
    description:
      "Finn riktig peis hos Peisbutikken. Sammenlign peisovner, gasspeiser og peisinnsatser – vi veileder deg fra valg til montering i Bærum og nettbutikk.",
  },
  hero: {
    title: "Peis",
    subtitle: "Finn riktig peis til stuen, hytta eller opplegg i murstein",
    description:
      "Hos Peisbutikken finner du peisovner, gasspeiser og peisinnsatser til ulike behov og rom. Vi hjelper deg velge modell med riktig effekt, design og driftsform.",
    ctaLabel: "Kontakt oss",
    ctaHref: "/kontakt-oss/",
    imageSrc: `${IMG}/hero.webp`,
    imageAlt:
      "Peis med levende flammer i moderne stue – utvalg av peiser hos Peisbutikken.no",
  },
  whyChoose: {
    title: "Hvorfor velge peis til hjemmet?",
    paragraphs: [
      "En peis gir mer enn varme – den skaper et naturlig samlingspunkt og en koselig atmosfære som er vanskelig å oppnå med panelovner alene. Med riktig modell får du jevn, behagelig varme i stuen eller på hytta.",
      "Peiser finnes i flere typer: frittstående peisovn, gasspeis med enkel tenning, eller innsats i eget peisbygg. Det gjør det enklere å finne en løsning som passer både boligen og bruksmønsteret ditt.",
      "Hos Peisbutikken får du utvalg fra anerkjente merker, veiledning ved valg og hjelp med montering. Enten du handler i nettbutikken eller besøker oss i Bærum, er målet det samme: riktig peis som varmer godt i mange år.",
    ],
  },
  brandTeaserIntro: {
    title: "Typer peiser – finn modellen som passer deg",
    description:
      "Peiser deles grovt i peisovn, gasspeis og peisinnsats. Her er de vanligste løsningene våre kunder starter med – klikk videre for hele utvalget.",
  },
  brandTeasers: [
    {
      id: "peisovn",
      title: "Peisovn",
      description:
        "Peisovner gir en autentisk følelse av varme og er laget for å vare i generasjoner. De passer perfekt i nesten alle hjem. Lave installasjonskostnader er et stort pluss.",
      ctaLabel: "Se peisovner",
      href: buildCategoryHref("peisovn"),
      imageSrc: `${IMG}/teaser-peisovn.webp`,
      imageAlt: "Nordpeis brannmur med sort glass",
      imageObjectFit: "cover",
    },
    {
      id: "gasspeis",
      title: "Gasspeis",
      description:
        "Gasspeiser kombinerer bekvemmelighet med stil. De gir ekte flammer uten behov for mye vedlikehold, og de kan enkelt tennes og slukkes med et knappetrykk, app eller ur.",
      ctaLabel: "Se gasspeiser",
      href: buildCategoryHref("gasspeis"),
      imageSrc: `${IMG}/teaser-gasspeis.webp`,
      imageAlt:
        "Ungt par som slapper av på fargerike gulvputer foran en moderne høy svart frittstående gasspeis med varme realistiske flammer, i et stilfullt industrielt loft med rå betongvegger – koselig moderne livsstil stock-foto",
      imageObjectFit: "cover",
    },
    {
      id: "peisinnsats",
      title: "Peisinnsats",
      description:
        "Peisinnsatser er for deg som ønsker å bygge den perfekte peisopplevelsen til akkurat ditt hjem. Velg mellom elementpeiser og rene innsatser hvor det kun er du og fantasien som setter grenser for hva man kan lage.",
      ctaLabel: "Se peisinnsatser",
      href: buildCategoryHref("peisinnsats"),
      imageSrc: `${IMG}/teaser-peisinnsats.webp`,
      imageAlt:
        "Moderne peisinnsats i hjørne med sort ramme, levende flammer, lys stue og vednisje – stilrent interiør hos Peisbutikken",
      imageObjectFit: "cover",
    },
  ],
  feature: {
    ...parseHubFeatureProse(PEIS_FEATURE_PROSE),
    imageSrc: `${IMG}/feature.webp`,
    imageAlt:
      "Spartherm Passo XS kompakt sort sylindrisk vedfyrt peisovn med buet glassfront og oransje flammer i moderne stue hos Peisbutikken.no",
    ctaLabel: "Kontakt oss",
    ctaHref: "/kontakt-oss/",
  },
};
