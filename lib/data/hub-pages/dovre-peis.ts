import { buildBrandHref } from "@/lib/routing/live-url-registry";

import { parseHubFeatureProse } from "./parse-hub-feature-prose";
import type { HubLandingPageContent } from "./types";

const IMG = "/images/hub-pages/dovre-peis";

const DOVRE_PEIS_FEATURE_PROSE = `
Dovre har laget vedovner og peisinnsatser siden 1933. Seriene Phoenix, Sense og Saga dekker alt fra oppgradering av gammel peis til kompakt peisovn i mindre rom.

# Slik velger du riktig Dovre
Start med romstørrelse og om du trenger frittstående ovn eller innsats i eksisterende peis. Phoenix passer ofte der du skal bytte ut Dovre 2000 eller sette inn ny innsats i åpen grue. Sense er kompakt og effektiv til mindre stuer, mens Saga gir klassisk støpejernlook i flere størrelser.

# Phoenix, Sense og Saga
Phoenix er løsningen når du vil modernisere uten å rive hele peisen. Sense-serien er laget for tett bolig og god varmeutnyttelse. Saga kombinerer nostalgi og robust støpejern – modeller som varer i generasjoner.

# Montering og service
Hos Peisbutikken hjelper vi deg finne riktig modell og effekt, og tilbyr montering og oppfølging etter installasjon. Besøk showroom i Bærum eller ta kontakt for en uforpliktende peisprat.
`.trim();

const hrefSense =
  "/?s=dovre%20sense&jet_ajax_search_settings=%7B%22search_source%22%3A%22product%22%2C%22custom_fields_source%22%3A%22_sku%2C%22%2C%22catalog_visibility%22%3Atrue%7D&post_type=product";
const hrefSaga =
  "/?s=dovre%20saga&jet_ajax_search_settings=%7B%22search_source%22%3A%22product%22%2C%22custom_fields_source%22%3A%22_sku%2C%22%2C%22catalog_visibility%22%3Atrue%7D&post_type=product";

export const dovrePeisHubLandingContent: HubLandingPageContent = {
  seo: {
    title: "Dovre peiser – kvalitetsvedovner og innsatser til hjemmet",
    description:
      "Utforsk Dovre peiser hos Peisbutikken – fra Phoenix innsats til Saga og Sense. Vi veileder deg til riktig vedovn, montering og service i Bærum og nettbutikk.",
  },
  hero: {
    title: "Dovre peiser",
    subtitle: "Belgiske vedovner og peisinnsatser med over 90 års erfaring",
    description:
      "Hos Peisbutikken finner du Dovre Phoenix, Sense og Saga – fra kompakte peisovner til innsatser som passer i eksisterende peis. Vi hjelper med valg, montering og service.",
    ctaLabel: "Dovre Peis",
    ctaHref: buildBrandHref("dovre"),
    imageSrc: `${IMG}/hero.webp`,
    imageAlt:
      "Dovre Saga 101 hos Peisbutikken.no – klassisk sort støpejerns vedovn med koselige flammer på ben i moderne stue",
  },
  whyChoose: {
    title: "Hvorfor velge Dovre peis?",
    paragraphs: [
      "Dovre produserer vedovner og peisinnsatser i Belgia siden 1933. Merket er kjent for robust støpejern, effektiv forbrenning og design som tåler daglig bruk i norske stuer og på hytta – uten å gå på kompromiss med uttrykket.",
      "Utvalget spenner fra Phoenix, som ofte kan monteres der gammel Dovre 2000 eller åpen grue står, til kompakte Sense-ovner og klassiske Saga-modeller i flere størrelser. Det gjør det enklere å finne riktig effekt og plassering.",
      "Hos Peisbutikken får du veiledning på modell og tilbehør, montering og service etter installasjon. Besøk oss i Bærum eller handle i nettbutikken – målet er en Dovre som varmer godt i mange år.",
    ],
  },
  brandTeaserIntro: {
    title: "Populære Dovre-serier – Phoenix, Sense og Saga",
    description:
      "Tre serier som dekker oppgradering, kompakte rom og klassisk design. Utforsk modellene nedenfor og finn Dovre-løsningen som passer hjemmet ditt.",
  },
  brandTeasers: [
    {
      id: "phoenix",
      title: "Dovre Phoenix",
      description:
        "Har du en gammel og utdatert Dovre 2000 eller åpen grue? Phoenix kommer i flere utgaver som kan monteres direkte i det samme hullet som Dovre 2000 eller som en innsats hvis du har åpen grue.",
      ctaLabel: "Dovre Phoenix",
      href: "/produkt/dovre-phoenix/",
      imageSrc: `${IMG}/teaser-phoenix.webp`,
      imageAlt: "Dovre Phoenix 1 (2000) Peisinnsats Lifestyle Image",
      imageObjectFit: "cover",
    },
    {
      id: "sense",
      title: "Dovre Sense",
      description:
        "En kompakt serie peisovner som passer godt i mindre rom. Sense-serien er kjent for sin energieffektivitet og elegante design.",
      ctaLabel: "Dovre Sense",
      href: hrefSense,
      imageSrc: `${IMG}/teaser-sense.webp`,
      imageAlt: "Dovre Sense 103 Peisovn Lifestyle image",
      imageObjectFit: "cover",
    },
    {
      id: "saga",
      title: "Dovre Saga",
      description:
        "En peis-serie med et klassisk design som bringer en følelse av nostalgi. Disse Vintage-modellene er robuste og pålitelige, laget for å vare i mange år.",
      ctaLabel: "Dovre Saga",
      href: hrefSaga,
      imageSrc: `${IMG}/teaser-saga.webp`,
      imageAlt:
        "Dovre Saga 207 bilde – klassisk sort støpejerns vedovn med koselige flammer og vedlager i moderne stue hos Peisbutikken.no",
      imageObjectFit: "cover",
    },
  ],
  feature: {
    ...parseHubFeatureProse(DOVRE_PEIS_FEATURE_PROSE),
    imageSrc: `${IMG}/feature.webp`,
    imageAlt:
      "Peisovn bilde – moderne sort frittstående sylindrisk vedovn med koselige flammer i lys samtid stue hos Peisbutikken.no",
    ctaLabel: "Kontakt oss for en hyggelig peisprat! ",
    ctaHref: "/kontakt-oss/",
  },
};
