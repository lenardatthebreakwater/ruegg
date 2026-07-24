import type { SummaryCardItem, SummaryVideoItem } from "@/lib/data/single-pages";

import type { HubHomeHeroContent, HubProseBlock, HubSeo } from "./types";

const IMG = "/images/campaigns/aduro-hybrid";

export const ADURO_HYBRID_KAMPANJE_PATH =
  "/eklsusive-kampanjetilbud-pa-aduro-hybridovner/" as const;

export const aduroHybridKampanjeSeo: HubSeo = {
  title: "Aduro hybridovner – kampanje på ved og pellets",
  description:
    "Kampanje på Aduro hybridovner hos Peisbutikken. Fleksibel ved- og pelletsfyring med app-styring. Se utvalget og få veiledning i showroom i Bærum.",
};

export const aduroHybridKampanjeHero: HubHomeHeroContent = {
  eyebrow: "Kampanje",
  title: "Utforsk våre eksklusive kampanjetilbud på Aduro hybridovner",
  description:
    "Velkommen til vår spesialside dedikert til unike kampanjetilbud på fire forskjellige Aduro hybridovner. Er du på jakt etter en stilren, effektiv og moderne peisovn, så er en Aduro hybridovn noe for deg!",
  ctaLabel: "Kontakt oss",
  ctaHref: "/kontakt-oss/",
  imageSrc: `${IMG}/hero.webp`,
  imageAlt:
    "Moderne sort hybrid ved- og pelletsovn med flammer i lys stue – Aduro hybridovn hos Peisbutikken",
};

export const aduroHybridKampanjeIntro: HubProseBlock = {
  title: "Aduro Hybridovner",
  paragraphs: [
    "Aduro hybridovn er en innovativ type ovn som kombinerer funksjonene til både en vedovn og en pelletsovn. Dette gir deg fleksibiliteten til å bruke enten ved eller pellets som brensel, avhengig av hva som er mest praktisk for deg i øyeblikket. Her er noen nøkkelfunksjoner ved Aduro hybridovner:",
  ],
};

export const aduroHybridKampanjeKeyCards: SummaryCardItem[] = [
  {
    iconKey: "layers",
    title: "Kombinasjon av ved og pellets",
    description:
      "Våre kunder har sagt at de liker fleksibiliteten ved å kunne bruke både ved og pellets. Dette gir dem muligheten til å nyte den tradisjonelle peisstemningen med ved, samtidig som de kan dra nytte av den praktiske og kontinuerlige varmen fra pellets.",
  },
  {
    iconKey: "smartphone",
    title: "Brukervennlighet",
    description:
      "Mange av våre kunder setter pris på hvor enkelt det er å betjene ovnen, spesielt med muligheten til å styre den via en app. Dette gjør det mulig å tenne opp ovnen selv når man ikke er hjemme.",
  },
  {
    iconKey: "wifi",
    title: "WIFI-støtte som standard",
    description:
      "Integrert WIFI-modul med egen Aduro Hybrid-app til din iPhone eller Android-telefon. Start ovnen, sett romtemperaturen med appen med noen enkle klikk. Super brukervennlig og moderne.",
  },
  {
    iconKey: "volumeX",
    title: "Støyfri drift",
    description:
      "Flere brukere nevner at ovnene er svært stillegående, noe som bidrar til en hyggelig atmosfære uten forstyrrelser.",
  },
  {
    iconKey: "leaf",
    title: "Miljøvennlig",
    description:
      "Hybridovnene er designet for å være miljøvennlige, med lavere utslipp og muligheten til å bruke fornybare energikilder som pellets.",
  },
  {
    iconKey: "palette",
    title: "Stilrent design",
    description:
      "Aduro hybridovner får også skryt for sitt moderne og estetisk tiltalende design, som passer godt inn i de fleste hjem.",
  },
  {
    iconKey: "zap",
    title: "Effektiv oppvarming",
    description:
      "Hybridovner gir rask og effektiv oppvarming. Ved gir en intens varme, mens pellets gir en jevn og langvarig varmeeffekt.",
  },
];

export const aduroHybridKampanjeVideos: SummaryVideoItem[] = [
  {
    title: "Aduro Hybridovner – effektiv moderne ovn med app-styring",
    description:
      "Oversikt over Aduro hybridovner: moderne løsning med app-styring (Peisbutikken på YouTube).",
    youtubeVideoId: "N7iowV73EXo",
    href: "https://www.youtube.com/watch?v=N7iowV73EXo",
    ctaLabel: "Åpne på YouTube",
  },
  {
    title: "Hvordan bruke din Aduro hybridovn mest mulig effektivt",
    description:
      "Praktiske tips til betjening og optimal ytelse på Aduro hybridovn (Peisbutikken på YouTube).",
    youtubeVideoId: "FVkNL6MyKHM",
    href: "https://www.youtube.com/watch?v=FVkNL6MyKHM",
    ctaLabel: "Åpne på YouTube",
  },
];
