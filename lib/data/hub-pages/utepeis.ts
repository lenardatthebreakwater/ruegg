import { buildCategoryHref } from "@/lib/routing/live-url-registry";

import { parseHubFeatureProse } from "./parse-hub-feature-prose";
import type { HubLandingPageContent } from "./types";

const IMG = "/images/hub-pages/utepeis";

const UTEPEIS_FEATURE_PROSE = `
Når du skal velge en utepeis, bør du tenke på hvordan du bruker uteplassen – og hvilken type varme og stemning du ønsker.

# Slik velger du riktig utepeis
Vurder om du vil ha vedfyrt varme, enkel gassdrift eller en modell som også fungerer som grill. Tenk også på plassering: terrasse, hage eller balkong setter krav til størrelse, røyk og avstand til overbygg.

# Materialer og drift
Vedfyrte utepeiser og bålpanner gir autentisk flamme og god varme, mens gassmodeller er enkle å starte og regulere. Cortenstål og støpejern tåler norsk vær godt og utvikler patina over tid.

# Typer utepeiser vi tilbyr
Hos Peisbutikken finner du ved- og gassfyrte utepeiser, bålpanner og kombinasjonsmodeller med grill – fra kompakte løsninger til større modeller for hyggelige kvelder ute.
`.trim();

export const utepeisHubLandingContent: HubLandingPageContent = {
  seo: {
    title: "Utepeiser – Varme og hygge på terrassen og i hagen",
    description:
      "Utforsk utepeiser hos Peisbutikken – ved- og gassfyrte modeller, bålpanne og grill. Få hjelp til å velge riktig utepeis til terrasse, hage eller balkong.",
  },
  hero: {
    title: "Utepeis",
    subtitle: "Varme, grill og hygge ute – finn riktig utepeis til terrassen",
    description:
      "Med en utepeis forlenger du sesongen på terrassen og skaper et naturlig samlingspunkt ute. Hos Peisbutikken finner du ved- og gassfyrte modeller, bålpanner og grillløsninger tilpasset norske forhold.",
    ctaLabel: "Finn riktig utepeis for deg",
    ctaHref: buildCategoryHref("utepeis"),
    imageSrc: `${IMG}/hero.webp`,
    imageAlt:
      "Utepeis livsstilsbilde – moderne uteovn med brennende ild på treterrasse med koselige lenestoler, saueskinn og vakker hageutsikt hos Peisbutikken.no",
  },
  whyChoose: {
    title: "Hvorfor velge en utepeis?",
    paragraphs: [
      "En utepeis gjør at du kan bruke terrassen og hagen lenge etter solen har gått ned. Flammen gir både varme og stemning, og mange modeller fungerer like godt til grilling og marshmallows som til avslapning en kjølig kveld.",
      "Materialer som Cortenstål og støpejern er laget for utendørs bruk og krever lite vedlikehold. Vedfyrte utepeiser gir autentisk flamme, mens gassmodeller er raske å starte når du vil ha varme med en gang.",
      "Plassering er viktig: vurder avstand til vegger, tak og brennbart materiale, og om røyk skal ledes bort fra sitteplasser. Vi hjelper deg å finne en utepeis som passer størrelsen på uteplassen og hvordan du bruker den.",
    ],
  },
  brandTeaserIntro: {
    title: "Utvalgte utepeiser fra ledende merker",
    description:
      "Her er noen av de mest populære utepeisene i sortimentet vårt – fra stilrene gassmodeller til vedfyrte bålpanner og grillkombinasjoner.",
  },
  brandTeasers: [
    {
      id: "nordpeis-air",
      title: "Nordpeis Air",
      description:
        "En moderne og stilren utepeis som passer perfekt for minimalistiske uteområder. Nordpeis Air kombinerer design og funksjon i en pakke som er enkel å installere og bruke.",
      ctaLabel: "Nordpeis Air Utepeiseis",
      href: "/produkt/nordpeis-air-utepeis/",
      imageSrc: `${IMG}/teaser-air.webp`,
      imageAlt: "Nordpeis Air Utepeis lifestyle image",
      imageObjectFit: "cover",
    },
    {
      id: "aduro-fireball",
      title: "Aduro Fireball",
      description:
        "En tradisjonell vedfyrt bålpanne som gir en autentisk utendørs opplevelse. Robust konstruksjon, enkel i bruk. Perfekt for å grille pølser eller marshmallows.",
      ctaLabel: "Aduro Fireball bålpanne",
      href: "/produkt/fire-ball-balpanne/",
      imageSrc: `${IMG}/teaser-fireball.webp`,
      imageAlt:
        "Aduro Fire Ball bålpanne livsstilsbilde – sort Aduro Fire Ball uteildpanne med koselige flammer og folk som steker marshmallows på pinner hos Peisbutikken.no",
      imageObjectFit: "cover",
    },
    {
      id: "riviera",
      title: "Riviera Utepeis og Grill",
      description:
        "En allsidig modell som fungerer både som utepeis og grill. Denne modellen er ideell for de som ønsker å kombinere matlaging med hygge rundt bålet.",
      ctaLabel: "Riviera Utepeis og Grill",
      href: "/produkt/nordpeis-riviera-utepeis-og-grill/",
      imageSrc: `${IMG}/teaser-riviera.webp`,
      imageAlt: "Nordpeis Riviera Utepeis produktbilde",
      imageObjectFit: "cover",
    },
  ],
  feature: {
    ...parseHubFeatureProse(UTEPEIS_FEATURE_PROSE),
    imageSrc: `${IMG}/feature.webp`,
    imageAlt:
      "Aduro utepeis sort Corten livsstilsbilde – moderne sort Corten stål utepeis med koselige flammer og ved i bruk på terrasse hos Peisbutikken.no",
    ctaLabel: "Kontakt oss for en hyggelig grillprat! ",
    ctaHref: "/kontakt-oss/",
  },
};
