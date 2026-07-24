import type {
  HubFeatureSplitContent,
  HubHomeHeroContent,
  HubSeo,
} from "./types";

const IMG = "/images/campaigns/black-friday-2025";

export const BLACK_FRIDAY_2025_PATH = "/black-friday-kampanje-2025/" as const;

export const blackFriday2025Seo: HubSeo = {
  title: "Black Friday 2025 – tilbud på Nordpeis peisovn",
  description:
    "Black Friday 2025 hos Peisbutikken: eksklusive rabatter på utvalgte Nordpeis peisovner og vedovner, 22.–30. november. Begrenset lager – bestill tidlig.",
};

export const blackFriday2025Hero: HubHomeHeroContent = {
  title: "Eksklusive Black Friday",
  subtitle: "Kampanjeperiode: 22-30 November 2025",
  description:
    "Gjør hjemmet ditt varmt og koselig med vårt Black Friday-salg! Vi tilbyr eksklusive rabatter på utvalgte Nordpeis peisovner og vedovner. Dette er årets beste mulighet til å sikre deg toppkvalitets varmeprodukter til sterke priser – perfekt for deg som ønsker både design og funksjonalitet. OBS! Kun så langt lageret rekker, bestill tidlig!",
  ctaLabel: "Se Nordpeis Duo",
  ctaHref: "#nordpeis-duo",
  imageSrc: `${IMG}/hero.webp`,
  imageAlt:
    "Moderne stue med peis – Black Friday-kampanje hos Peisbutikken",
  eyebrow: "Tilbud 2025",
};

export const blackFriday2025DuoFeature: HubFeatureSplitContent = {
  sections: [
    {
      title: "Nordpeis Duo",
      description:
        "Serien er en elegant og moderne serie vedovner designet for å passe inn i alle hjem. Med sitt slanke design, store glassflater for optimalt innsyn til flammene og miljøvennlig teknologi, kombinerer Duo-serien funksjonalitet og estetikk på en perfekt måte.",
    },
    {
      title: "Høydepunkter i serien",
      listItems: [
        "Flere modeller for ulike behov og stiler, fra vegghengte til frittstående løsninger.",
        "Ren forbrenningsteknologi som sikrer høy effektivitet og lave utslipp.",
        "Praktiske løsninger som integrert vedoppbevaring og enkel betjening.",
      ],
      description: "Duo-serien gir varme, hygge og et stilrent uttrykk til hjemmet ditt.",
    },
  ],
  imageSrc: "/images/campaigns/black-friday-2024/feature.webp",
  imageAlt:
    "Nordpeis Duo-serien – elegant vedovn med store glassflater i moderne stue",
  ctaLabel: "Til Nordpeis Duo 6",
  ctaHref: "/produkt/nordpeis-duo-6/",
};

/** YouTube embed on the campaign page (same as WordPress). */
export const blackFriday2025YoutubeVideoId = "xLjXf8j53jc";

export const blackFriday2025YoutubeTitle =
  "Nordpeis Quadro serien – produktvideo hos Peisbutikken";
