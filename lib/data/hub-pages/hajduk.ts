import { buildBrandHref } from "@/lib/routing/live-url-registry";

import { parseHubFeatureProse } from "./parse-hub-feature-prose";
import type { HubLandingPageContent } from "./types";

const IMG = "/images/hub-pages/hajduk";

const HAJDUK_FEATURE_PROSE = `
Hajduk peisinnsatser kombinerer polsk kvalitet, effektiv forbrenning og moderne design – og passer både nybygg og rehabilitering av peis.

# Slik velger du riktig Hajduk innsats

Tenk på romstørrelse, pipe og om du vil ha standard dør, heve/senke eller glass på tre sider. Smart-serien passer kompakte stuer, Volcano gir høy effekt i større rom, og Prisma er fleksibel med ulike dørløsninger.

# Clear View og effektiv forbrenning

Mange Hajduk modeller har Clear View for selvrensende glass og Jet Stream Superior for jevn og rent brenn. CLING-systemet gjør vedlikehold enklere når du skal fylle ved eller tømme aske.

# Smart, Volcano og Prisma

Smart er moderne og plassvennlig. Volcano er kraftig for åpne planløsninger. Prisma kombinerer høy effekt med stilrent design – med vanlig dør eller elegant heve/senke-dør.
`.trim();

const hrefSmart =
  "/?s=hajduk%20smart&jet_ajax_search_settings=%7B%22search_source%22%3A%22product%22%2C%22custom_fields_source%22%3A%22_sku%2C%22%2C%22catalog_visibility%22%3Atrue%7D&post_type=product";
const hrefVolcano =
  "/?s=hajduk%20volcano&jet_ajax_search_settings=%7B%22search_source%22%3A%22product%22%2C%22custom_fields_source%22%3A%22_sku%2C%22%2C%22catalog_visibility%22%3Atrue%7D&post_type=product";
const hrefPrisma =
  "/?s=hajduk%20prisma&jet_ajax_search_settings=%7B%22search_source%22%3A%22product%22%2C%22custom_fields_source%22%3A%22_sku%2C%22%2C%22catalog_visibility%22%3Atrue%7D&post_type=product";

export const hajdukHubLandingContent: HubLandingPageContent = {
  seo: {
    title: "Hajduk peisinnsatser – effektiv varme og rent brenn",
    description:
      "Finn Hajduk peisinnsatser hos Peisbutikken. Vi hjelper deg velge riktig modell med veiledning, montering og showroom i Bærum – se Smart, Volcano og Prisma.",
  },
  hero: {
    title: "Hajduk peisinnsatser",
    subtitle: "Effektive innsatser med moderne design og smart teknologi",
    description:
      "Hajduk produserer peisinnsatser med høy effekt, rent brenn og selvrensende glass. Hos Peisbutikken finner du Smart, Volcano og Prisma – med veiledning til valg og montering.",
    ctaLabel: "Hopp rett til alle Hajduk peisinnsatser",
    ctaHref: buildBrandHref("hajduk"),
    imageSrc: `${IMG}/hero.webp`,
    imageAlt:
      "Hajduk peisinnsats livsstils blogg bilde – høy moderne hvit hjørnepeis med koselige flammer i lys soveromssuite hos Peisbutikken.no",
  },
  whyChoose: {
    title: "Hvorfor velge Hajduk peisinnsats?",
    paragraphs: [
      "Hajduk er en polsk produsent med lang erfaring innen peisinnsatser og rentbrennende teknologi. Innsatsene gir høy varmeeffekt, godt utsyn til flammene og løsninger som passer både nybygg og oppgradering av eksisterende peis.",
      "Serier som Smart, Volcano og Prisma dekker ulike behov – fra kompakte stuer til større rom med høy effekt. Clear View holder glasset rent, Jet Stream Superior gir jevn forbrenning, og CLING-systemet gjør daglig bruk og vedlikehold enklere.",
      "Hos Peisbutikken får du hjelp til å finne riktig Hajduk modell, montering og oppfølging etter installasjon. Besøk showroomet vårt i Bærum for å se utvalgte innsatser og få personlig veiledning.",
    ],
  },
  brandTeaserIntro: {
    title: "Populære Hajduk peisinnsatser",
    description:
      "Utforsk våre mest etterspurte Hajduk-serier – fra kompakte Smart-modeller til kraftige Volcano og fleksible Prisma:",
  },
  brandTeasers: [
    {
      id: "smart",
      title: "Hajduk Smart-serien",
      description:
        "En moderne peis med et minimalistisk design som passer perfekt i nyere boliger. F.eks denne Smart 1TVH-modellen gir effektiv varme med et flott design og høy kvalitet.",
      ctaLabel: "Hajduk Smart",
      href: hrefSmart,
      imageSrc: `${IMG}/teaser-smart.webp`,
      imageAlt:
        "Hajduk Smart blogg bilde – høy moderne hvit hjørnepeis med koselige flammer i lys skandinavisk stue hos Peisbutikken.no",
      imageObjectFit: "cover",
    },
    {
      id: "volcano",
      title: "Hajduk Volcano",
      description:
        "En kraftig serie med peisinnsatser som er designet for å gi maksimal varmeutbytte. Volcano-modellene er ideell for større rom og åpne områder.",
      ctaLabel: "Hajduk Volcano",
      href: hrefVolcano,
      imageSrc: `${IMG}/teaser-volcano.webp`,
      imageAlt:
        "Hajduk Volcano blogg bilde – høy moderne hvit hjørnepeis med koselige flammer i lys skandinavisk stue hos Peisbutikken.no",
      imageObjectFit: "cover",
    },
    {
      id: "prisma",
      title: "Hajduk Prisma",
      description:
        "En flott serie med innsatser med høy effekt og stilig design. Fås både med vanlig dør, samt en flott og elegant heve/senke-dør for enkel betjening.",
      ctaLabel: "Hajduk Prisma",
      href: hrefPrisma,
      imageSrc: `${IMG}/teaser-prisma.webp`,
      imageAlt:
        "Hajduk Prisma peisinnsats blogg bilde – høy moderne hvit sylindrisk kakkelovn med koselige flammer i lys åpen stue hos Peisbutikken.no",
      imageObjectFit: "cover",
    },
  ],
  feature: {
    ...parseHubFeatureProse(HAJDUK_FEATURE_PROSE),
    imageSrc: `${IMG}/feature.webp`,
    imageAlt:
      "Hajduk produktbilde – moderne høy grå hjørne vedpeisinnsats med koselige flammer i lys åpen stue hos Peisbutikken.no",
    ctaLabel: "Kontakt oss for en hyggelig peisprat! ",
    ctaHref: "/kontakt-oss/",
  },
};
