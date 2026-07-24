import { parseHubFeatureProse } from "./parse-hub-feature-prose";
import type { HubLandingPageContent } from "./types";

const IMG = "/images/hub-pages/element4";

const ELEMENT4_FEATURE_PROSE = `
Element4 er et nederlandsk merke kjent for elegante gasspeiser med naturtro flamme og enkel betjening. Her er det viktigste å vite før du velger modell.

# Slik velger du Element4 gasspeis
Tenk på romstørrelse, plassering og om du trenger pipe eller kan nøye deg med eksosventil. Mange Element4-modeller monteres uten tradisjonell pipe – bare med eksosutslipp i yttervegg.

# Smarthjem og betjening
De fleste peiser leveres med fjernkontroll. Med app og WiFi-modul kan du styre flamme og varme fra mobilen, og integrasjonsmodulen kobles til mange smarthjemssystemer.

# Modeller hos Peisbutikken
Hos oss finner du hjørnepeiser som Bidore, panoramavinduer som Trisore og minimalistiske modeller som Lucius – alle med realistisk flammeeffekt og tilbehør tilpasset moderne norske hjem.
`.trim();

export const element4HubLandingContent: HubLandingPageContent = {
  seo: {
    title: "Element4 gasspeiser – moderne design og varme uten pipe",
    description:
      "Se Element4 gasspeiser hos Peisbutikken. Realistisk flamme, app-styring og montering uten pipe på mange modeller. Personlig veiledning i showroom i Bærum.",
  },
  hero: {
    title: "Element4 gasspeiser",
    subtitle: "Moderne flamme uten vedfyring",
    description:
      "Realistisk gassflamme, stilrent design og enkel betjening – med modeller som kan monteres uten pipe på mange hus.",
    ctaLabel: "Finn oss på Google Maps",
    ctaHref: "https://maps.app.goo.gl/jaNLUMJpypvNo72X7",
    imageSrc: `${IMG}/hero.webp`,
    imageAlt:
      "Element4 Summum 140 T – moderne tunnel-gasspeis med tosidig LED-flammevisning og naturtro tømmerstokker, som skaper varme og en innbydende atmosfære.",
  },
  whyChoose: {
    title: "Hvorfor velge Element4 gasspeis?",
    paragraphs: [
      "Element4 lager gasspeiser for deg som vil ha peisbildet uten vedfyring. Flammene ser naturtro ut, varmen slås enkelt av og på, og mange modeller kan styres med app og fjernkontroll.",
      "Merkevaren er kjent for rent design og fleksible løsninger – fra hjørne- og panoramapeiser til modeller som kan monteres med eksosventil i stedet for pipe. Det gjør Element4 aktuelt både i nybygg og oppgradering av eldre peis.",
      "Hos Peisbutikken har vi Element4 utstillinger i showroom. Kom innom for å se flammeeffekt og design på nært hold, eller ta kontakt så hjelper vi deg finne riktig modell.",
    ],
  },
  brandTeaserIntro: {
    title: "Populære Element4 gasspeiser",
    description:
      "Se utvalgte Element4-modeller med panoramavindu, hjørneplassering og minimalistisk design – tilgjengelige hos Peisbutikken.",
  },
  brandTeasers: [
    {
      id: "bidore",
      title: "Element4 Bidore 100",
      description:
        "En moderne hjørnepeis som gir en fantastisk utsikt over flammene fra flere",
      ctaLabel: "Element4 Bidore 100",
      href: "/produkt/element4-bidore-100/",
      imageSrc: `${IMG}/teaser-bidore.webp`,
      imageAlt:
        "Element4 Bidore 100 gasspeis livsstilsbilde – luksuriøs moderne innbygd gasspeis med realistiske flammer i elegant samtidstue hos Peisbutikken.no",
      imageObjectFit: "cover",
    },
    {
      id: "trisore",
      title: "Element4 Trisore 140",
      description:
        "En bred peis med panoramavinduer som gir et imponerende inntrykk i ethvert rom. Trisore 140-modellen kombinerer stil og funksjon på en elegant måte.",
      ctaLabel: "Element4 Trisore 140",
      href: "/produkt/element4-trisore-140/",
      imageSrc: `${IMG}/teaser-trisore.webp`,
      imageAlt:
        "Element4 Trisore 100, tre-sidig gasspeis med rammeløst glass og realistiske flammer over keramiske vedkubber, plassert i en lys, minimalistisk stue med kurvstol, grønn plante og teksturert teppe",
      imageObjectFit: "cover",
    },
    {
      id: "lucius",
      title: "Element4 Lucius 140",
      description:
        "En stilren peis med et minimalistisk design. Lucius 140-modellen er ideell for moderne hjem som ønsker et diskret, men effektivt varmekilde.",
      ctaLabel: "Element4 Lucius  140",
      href: "/produkt/element4-lucius-140/",
      imageSrc: `${IMG}/teaser-lucius.webp`,
      imageAlt:
        "Element4 Lucius 140 gasspeis livsstilsbilde – luksuriøs bred innbygd gasspeis med realistiske blå flammer i moderne elegant stue hos Peisbutikken.no",
      imageObjectFit: "cover",
    },
  ],
  feature: {
    ...parseHubFeatureProse(ELEMENT4_FEATURE_PROSE),
    imageSrc: `${IMG}/feature.webp`,
    imageAlt: "Moderne gasspeis med elegant design i stue",
    ctaLabel: "Kontakt oss for en hyggelig peisprat! ",
    ctaHref: "/kontakt-oss/",
  },
};
