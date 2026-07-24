import { buildBrandHref, buildCategoryHref } from "@/lib/routing/live-url-registry";

import type { HubLandingPageContent } from "./types";
import { parseHubFeatureProse } from "./parse-hub-feature-prose";

export { peisovnUtvalgteCarousels } from "./brand-utvalgte-categories";

const IMG = "/images/hub-pages/peisovn";

const PEISOVN_FEATURE_PROSE = `
Når du skal velge peisovn, bør du se på romstørrelse, ønsket effekt og hvordan ovnen passer inn i interiøret.

# Slik velger du riktig peisovn

Start med å måle rommet og vurdere om ovnen skal stå fritt, mot vegg eller i hjørne. Anbefalt effekt i kilowatt bør stemme med arealet du vil varme, og glassareal påvirker både uttrykk og varmefølelse.

# Fordeler med peisovn

Peisovner gir jevn varme og skaper koselig atmosfære i stuen. Mange modeller har høy virkningsgrad og kan supplere andre varmekilder, samtidig som de fungerer som et naturlig samlingspunkt.

# Typer peisovner

Du finner kompakte modeller til mindre rom og større peisovner med bredt glassareal. Utvalget spenner fra klassiske former til moderne design, slik at du kan finne en løsning som matcher både bolig og budsjett.

# Tips før kjøp

Sjekk pipeløsning, vedlikehold og monteringskrav før du bestiller. Utforsk kategorien og sammenlign merker i utvalget vårt – eller ta kontakt for veiledning i showroom.
`.trim();

const categoryPeisovn = buildCategoryHref("peisovn");

export const peisovnHubLandingContent: HubLandingPageContent = {
  seo: {
    title: "Peisovn – Stort utvalg, merker og veiledning i showroom",
    description:
      "Se peisovner fra ledende merker hos Peisbutikken. Vi hjelper deg med valg av modell, effekt og design – stort utvalg online og veiledning i showroom i Bærum.",
  },
  hero: {
    title: "Peisovn",
    subtitle: "Finn varm og koselig løsning til stuen",
    description:
      "Peisovner gir jevn varme og et levende fokuspunkt i oppholdsrommet. Moderne modeller har høy virkningsgrad og kan supplere andre varmekilder effektivt.",
    ctaLabel: "Finn din peisovn",
    ctaHref: categoryPeisovn,
    imageSrc: `${IMG}/hero.webp`,
    imageAlt:
      "Nordpeis Duo 6 peisovn med levende flammer i koselig skandinavisk stue med snødekt utsikt hos Peisbutikken.no",
  },
  whyChoose: {
    title: "Hvorfor velge en peisovn?",
    paragraphs: [
      "En peisovn kombinerer effektiv oppvarming med et tydelig estetisk uttrykk. Den passer godt i stuer og oppholdsrom der du ønsker både varme og atmosfære uten å bygge peis fra bunnen av.",
      "Når du velger modell, bør du vurdere romstørrelse, anbefalt effekt, glassareal og plassering. Riktig peisovn gir bedre varmeøkonomi og tryggere drift over tid.",
      "Hos Peisbutikken finner du peisovner fra anerkjente merker, og vi hjelper deg gjerne med å sammenligne alternativer – enten i nettbutikken eller i showroom i Bærum.",
    ],
  },
  brandTeaserIntro: {
    title: "Populære merker for peisovn",
    description:
      "Hos Peisbutikken finner du peisovner fra flere ledende produsenter. Her er noen merker mange starter med når de leter etter riktig modell:",
  },
  brandTeaserImageAspectClass: "aspect-square",
  brandTeasers: [
    {
      id: "aduro",
      title: "Aduro peisovner",
      description:
        "Dansk peismerke som er blitt utrolig populært i Norge. God kvalitet, flott design og rimelige priser!",
      ctaLabel: "Aduro",
      href: buildBrandHref("aduro"),
      imageSrc: "/images/hub-pages/aduro/teaser-1-1.webp",
      imageObjectFit: "cover",
      imageAlt:
        "Aduro peisovn med flammer i moderne kjøkken – dansk design hos Peisbutikken.no",
    },
    {
      id: "dovre",
      title: "Dovre peisovner",
      description:
        "Dovre-peisovner er laget spesielt for Norge. De tilbyr robusthet og pålitelighet uten å gå på bekostning av stil, med både klassiske og nostalgiske modeller.",
      ctaLabel: "Dovre",
      href: buildBrandHref("dovre"),
      imageSrc: "/images/hub-pages/dovre-peis/teaser-saga.webp",
      imageObjectFit: "cover",
      imageAlt:
        "Dovre peisovn med flammer i moderne stue med vednisje hos Peisbutikken.no",
    },
    {
      id: "nordpeis",
      title: "Nordpeis peisovner",
      description:
        "Nordpeis tilbyr et bredt spekter av stilige og moderne peisovner som passer perfekt inn i et minimalistisk interiør. Norsk merke med produksjon i Øst-Europa.",
      ctaLabel: "Nordpeis",
      href: buildBrandHref("nordpeis"),
      imageSrc: "/images/populaere-sok/nordpeis.webp",
      imageObjectFit: "cover",
      imageAlt:
        "Nordpeis peis i moderne stue med flammer – stilrent norsk design hos Peisbutikken.no",
    },
  ],
  feature: {
    ...parseHubFeatureProse(PEISOVN_FEATURE_PROSE),
    imageSrc: `${IMG}/feature.webp`,
    imageAlt:
      "To personer nyter en kopp kakao foran en ny, moderne peis fra Peisbutikken.no etter ferdig montering, med varme flammer som lyser opp rommet.",
    ctaLabel: "Finn din peisovn",
    ctaHref: categoryPeisovn,
  },
};
