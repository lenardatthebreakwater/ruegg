import {
  buildBrandHref,
  buildProductHref,
} from "@/lib/routing/live-url-registry";

import { parseHubFeatureProse } from "./parse-hub-feature-prose";
import type { HubLandingPageContent } from "./types";

const IMG = "/images/hub-pages/aduro";

const KONTAKT_OSS = "/kontakt-oss/";

const ADURO_FEATURE_PROSE = `
Når du skal velge Aduro peisovn eller vedovn, bør du se på romstørrelse, plassering og om du ønsker standard modell eller Lux med helglassdør.

# Slik velger du riktig Aduro

Start med å vurdere hvor ovnen skal stå – fritt, mot vegg eller i hjørne – og hvilket effektbehov rommet har. Modeller som 1.1 og 9.5 finnes i ulike størrelser, og mange kommer med formskjærte gulvplater som gir et ryddig uttrykk.

# Fordeler med Aduro

Aduro peisovner og vedovner er rentbrennende og energieffektive, med skandinavisk design og store glassflater. Aduro-tronic justerer lufttilførselen automatisk for bedre forbrenning og lavere vedforbruk.

# Aduro Lux og standardmodeller

Lux-serien har helglassdør som gir uavbrutt utsikt til flammene. Standardmodellene har ståldør med glassvindu – ofte et mer kompakt valg til mindre rom.

Ta gjerne kontakt eller besøk showroom i Bærum for å se modellene og få hjelp til montering.
`.trim();

const brandAduro = buildBrandHref("aduro");

export const aduroHubLandingContent: HubLandingPageContent = {
  seo: {
    title: "Aduro peisovn og vedovn – stort utvalg og veiledning",
    description:
      "Se Aduro peisovner og vedovner hos Peisbutikken. Dansk design, høy virkningsgrad og Aduro-tronic – stort utvalg og veiledning i showroom i Bærum.",
  },
  hero: {
    title: "Aduro peisovn og vedovn",
    subtitle: "Dansk design med effektiv vedfyring til norske hjem",
    description:
      "Aduro kombinerer moderne linjer, høy virkningsgrad og smart teknologi som Aduro-tronic. Hos Peisbutikken finner du populære modeller som 1.1, 9.5 Lux og 9.4 Wall.",
    ctaLabel: "Se våre Aduro peiser her",
    ctaHref: brandAduro,
    imageSrc: `${IMG}/hero.webp`,
    imageAlt:
      "Aduro hero section bilde – elegant sort sylindrisk Aduro vedovn med koselige flammer på glasssokkel i lys moderne stue",
  },
  whyChoose: {
    title: "Hvorfor velge Aduro?",
    paragraphs: [
      "Aduro er et dansk merke som har blitt svært populært i Norge – særlig for peisovner og vedovner med rent design, god kvalitet og fornuftige priser. Modellene passer godt i både nye og eldre boliger.",
      "Med Aduro-tronic justeres lufttilførselen automatisk for optimal forbrenning. Det gir lavere vedforbruk, renere forbrenning og jevnere varme over tid.",
      "Hos Peisbutikken finner du et bredt utvalg av Aduro peisovner og vedovner – inkludert kompakte modeller, hjørne- og veggmonterte løsninger. Vi hjelper deg gjerne med valg, montering og service i showroom i Bærum.",
    ],
  },
  brandTeaserIntro: {
    title: "Populære Aduro-modeller",
    description:
      "Her er noen av Aduro peisovnene og vedovnene kundene våre oftest velger – fra kompakt modell til panoramaglass:",
  },
  brandTeasers: [
    {
      id: "aduro-1-1",
      title: "Aduro 1.1",
      description:
        "Denne stilrene vedovnen gir effektiv varme og er designet for både små og store rom. Med sitt klassiske utseende passer Aduro 1.1 perfekt inn i norske hjem. Aduro 1.1 kommer også i en versjon kledd med Kleberstein.",
      ctaLabel: "Aduro 1.1",
      href: buildProductHref("aduro-1-1"),
      imageSrc: `${IMG}/teaser-1-1.webp`,
      imageAlt:
        "Sort sylindrisk Aduro 1.1 peisovn med levende oransje flammer synlige gjennom dens store buede glassdør, som viser en solid støpejernskonstruksjon og glatt platejernsfinish, plassert på et lyst tregulv i et moderne kjøkkenmiljø med elegante sorte skap, hvite barkrakker, en vase med hvite liljer på benken, en sølvkran, friske frukter i en bolle, en laptop og pendellamper overhead, som understreker peisovnens kompakte fotavtrykk og elegante designintegrasjon for peis og vedfyrt bruk.",
      imageObjectFit: "cover",
    },
    {
      id: "aduro-9-5-lux",
      title: "Aduro 9.5 Lux",
      description:
        "En høyreist vedovn med panoramavinduer som gir fantastisk utsikt over flammene. Lux-modellen har glassdør og passer for deg som ønsker en estetisk og funksjonell peis.",
      ctaLabel: "Aduro 9.5 Lux",
      href: buildProductHref("aduro-9-5-lux-bestselger"),
      imageSrc: `${IMG}/teaser-9-5.webp`,
      imageAlt:
        "Aduro hybrid kombinert ved- & pelletsovn bilde – moderne sort sylindrisk hybridovn med koselige flammer i lys stue hos Peisbutikken.no",
      imageObjectFit: "cover",
    },
    {
      id: "aduro-9-4-wall",
      title: "Aduro 9.4 Wall",
      description:
        "Praktisk og flott vedovn som du kan henge på veggen. Gir god utsikt til flammene med store front og sideglass.",
      ctaLabel: "Aduro 9.4 Wall",
      href: buildProductHref("aduro-9-4-wall"),
      imageSrc: `${IMG}/teaser-9-4-wall.webp`,
      imageAlt:
        "Aduro 9.4 Wall livsstilsbilde – moderne svart veggmontert hjørne vedovn med stort buet panoramaglass og levende realistiske flammer, montert høyt på hvit vegg i lys samtids stue med store vinduer, hageutsikt, tregulv og mykt naturlig lys hos peisbutikken.no",
      imageObjectFit: "cover",
    },
  ],
  feature: {
    ...parseHubFeatureProse(ADURO_FEATURE_PROSE),
    imageSrc: `${IMG}/feature.webp`,
    imageAlt:
      "Aduro kategorier bilde – oversikt over moderne Aduro peisovner med koselige flammer i lys stue hos Peisbutikken.no",
    ctaLabel: "Kontakt oss for en hyggelig peisprat! ",
    ctaHref: KONTAKT_OSS,
  },
};
