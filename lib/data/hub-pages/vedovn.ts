import {
  buildBrandHref,
  buildCategoryHref,
} from "@/lib/routing/live-url-registry";

import { parseHubFeatureProse } from "./parse-hub-feature-prose";
import type { HubLandingPageContent } from "./types";

const IMG = "/images/hub-pages/vedovn";

const VEDOVN_FEATURE_PROSE = `
Når du skal velge vedovn, er det smart å tenke på både varmebehov og plass i rommet. Vi hjelper deg finne modellen som passer best.

# Slik velger du vedovn
En god vedovn skal gi jevn varme og passe inn i interiøret. Vurder romstørrelse, effekt og plassering – spesielt i mindre stuer, hytter eller sekundærboliger.

# Fordeler med vedovner
Vedovner gir koselig flammevarme og fungerer uten strøm. Moderne modeller er bygget for effektiv forbrenning og kan varme raskt når temperaturen faller.

# Vedovn eller peisovn?
Peisovner har ofte større glass og høyere effekt, mens tradisjonelle vedovner er kompakte og enkle å plassere. Begge varmer med ved – vi hjelper deg velge riktig type.
`.trim();

export const vedovnHubLandingContent: HubLandingPageContent = {
  seo: {
    title: "Vedovn – finn riktig vedovn med effektiv varme og utvalg",
    description:
      "Finn riktig vedovn hos Peisbutikken. Bredt utvalg av effektive vedovner fra Dovre og Nordpeis, med personlig veiledning og montering i Bærum.",
  },
  hero: {
    title: "Vedovn",
    subtitle: "Effektive vedovner til stue, hytte og sekundærbolig",
    description:
      "Vedovner gir jevn og behagelig varme med levende flammer – uten strøm. Hos Peisbutikken finner du kompakte og robuste modeller som passer både små og større rom.",
    ctaLabel: "Se våre vedovner",
    ctaHref: buildCategoryHref("peisovn"),
    imageSrc: `${IMG}/hero.webp`,
    imageAlt:
      "Dovre 101 CBS vedovn blogg bilde – klassisk sort støpejerns vedovn med koselige flammer i rustikk hytte-stil stue hos Peisbutikken.no",
  },
  whyChoose: {
    title: "Hvorfor velge en vedovn?",
    paragraphs: [
      "Vedovner er et trygt og praktisk valg når du vil ha vedfyrt varme som fungerer også ved strømbrudd. De gir jevn varme over tid og skaper den koselige atmosfæren mange forbinder med norsk vinter.",
      "Velg effekt ut fra romstørrelse: for små rom trenger du mindre kW, mens større stuer krever mer kapasitet. Kompakte vedovner er enkle å plassere, og mange modeller har god virkningsgrad som gir mer varme per vedkubbe.",
      "Usikker på vedovn versus peisovn? Peisovner har ofte større glass og høyere effekt, mens tradisjonelle vedovner er mer kompakte. Begge varmer med ved – vi hjelper deg finne riktig løsning for ditt hjem.",
    ],
  },
  brandTeaserIntro: {
    title: "Vedovner fra ledende merker",
    description:
      "Hos Peisbutikken finner du vedovner fra produsenter med lang erfaring og høy kvalitet. Utforsk merkene våre og finn modellen som passer stilen og varmebehovet ditt:",
  },
  brandTeasers: [
    {
      id: "nordpeis",
      title: "Nordpeis Vedovner",
      description:
        "Nordpeis tilbyr et bredt spekter av vedovner med moderne design. De er enkle å installere og bruke, noe som gjør dem ideelle for travle husholdninger.",
      ctaLabel: "Nordpeis",
      href: buildBrandHref("nordpeis"),
      imageSrc: `${IMG}/teaser-nordpeis-logo.svg`,
      imageAlt:
        "Nordpeis logo 2020 – offisiell svart Nordpeis logo med flammesymbol på gjennomsiktig bakgrunn hos Peisbutikken.no",
    },
    {
      id: "dovre",
      title: "Dovre Vedovner",
      description:
        "Dovre er synonymt med kvalitet og holdbarhet. Deres vedovner er kjent for å vare lenge og for å tilby effektiv oppvarming i selv de kaldeste klimaene.",
      ctaLabel: "Dovre",
      href: buildBrandHref("dovre"),
      imageSrc: `${IMG}/teaser-dovre-logo.webp`,
      imageAlt:
        "Dovre logo svart – offisiell svart Dovre logo med flammesymbol i oval ramme på gjennomsiktig bakgrunn hos Peisbutikken.no",
    },
  ],
  feature: {
    ...parseHubFeatureProse(VEDOVN_FEATURE_PROSE),
    imageSrc: `${IMG}/feature.webp`,
    imageAlt: "Dovre Saga 207 i bruk",
    ctaLabel: "Kontakt oss for en hyggelig peisprat! ",
    ctaHref: "/kontakt-oss/",
  },
};
