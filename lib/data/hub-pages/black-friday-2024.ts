import type {
  HubFeatureSplitContent,
  HubHomeHeroContent,
  HubSeo,
} from "./types";

const IMG = "/images/campaigns/black-friday-2024";
const HERO_IMG_2025 = "/images/campaigns/black-friday-2025";

export const BLACK_FRIDAY_2024_PATH = "/black-friday-kampanje-2024/" as const;

export const blackFriday2024Seo: HubSeo = {
  title: "Black Friday 2024 – tilbud på Nordpeis peisovn",
  description:
    "Black Friday 2024 hos Peisbutikken: eksklusive rabatter på utvalgte Nordpeis peisovner og vedovner, 22.–30. november. Se kampanjen og showroom i Bærum.",
};

export const blackFriday2024Hero: HubHomeHeroContent = {
  title: "Eksklusive Black Friday",
  subtitle: "Kampanjeperiode: 22-30 November 2024",
  description:
    "Gjør hjemmet ditt varmt og koselig med vårt Black Friday-salg! Fra 22. til 30. november 2024 tilbyr vi eksklusive rabatter på utvalgte Nordpeis peisovner og vedovner. Dette er årets beste mulighet til å sikre deg toppkvalitets varmeprodukter til fantastiske priser. Ikke gå glipp av vårt Black Friday peistilbud – perfekt for deg som ønsker både design og funksjonalitet. Finn din favoritt blant våre Black Friday Nordpeis-kampanjer!",
  ctaLabel: "Se Nordpeis Duo",
  ctaHref: "#nordpeis-duo",
  imageSrc: `${HERO_IMG_2025}/hero.webp`,
  imageAlt:
    "Moderne stue med peis – Black Friday-kampanje hos Peisbutikken",
  eyebrow: "Tilbud 2024",
};

export const blackFriday2024DuoFeature: HubFeatureSplitContent = {
  sections: [
    {
      title: "Nordpeis Duo",
      description:
        "Nordpeis Duo-serien er en elegant og moderne serie vedovner designet for å passe inn i alle hjem. Med sitt slanke design, store glassflater for optimalt innsyn til flammene og miljøvennlig teknologi, kombinerer Duo-serien funksjonalitet og estetikk på en perfekt måte.",
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
    {
      title: "Nordpeis Quadro",
      description:
        "Vi har et av Norges største utvalg av peis, vedovn og peisinnsatser med et stort showroom i Bærum. Vi både tegner, designer og monterer både ved og gasspeiser og har sertifiserte gassteknikere. Vi både rehabiliterer og monterer nye stålpiper.",
    },
  ],
  imageSrc: `${IMG}/feature.webp`,
  imageAlt:
    "Nordpeis Duo i moderne stue – kampanje hos Peisbutikken",
  ctaLabel: "Til Nordpeis Duo 6",
  ctaHref: "/produkt/nordpeis-duo-6/",
};

/** Same productvideo as the legacy 2024 WordPress page. */
export const blackFriday2024YoutubeVideoId = "xLjXf8j53jc";

export const blackFriday2024YoutubeTitle =
  "Nordpeis Quadro serien – produktvideo hos Peisbutikken";
