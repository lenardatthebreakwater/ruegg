import type { FAQItem } from "@/lib/data/homepage";
import { buildProductHref } from "@/lib/routing/live-url-registry";

import type {
  HubFeatureSpecSplitContent,
  HubFeatureSplitContent,
  HubHomeHeroContent,
  HubSeo,
} from "./types";

const IMG = "/images/campaigns/oranier-pureblack";
const VID = "/videos/campaigns/oranier-pureblack";

export const ORANIER_PUREBLACK_PATH = "/oranier-pureblack/" as const;

const ARENA_SECTION_HASH = "#oranier-pureblack-arena";

export const oranierPureBlackSeo: HubSeo = {
  title: "Oranier pureBLACK – helsort peisovn og vedovn",
  description:
    "Utforsk Oranier pureBLACK hos Peisbutikken: elegant helsort design og effektiv vedfyring. Arena W+ 2.0, Polar Neo og Arktis 7 2.0 – showroom i Bærum.",
};

/** Product slugs featured on this campaign page (for ItemList JSON-LD). */
export const ORANIER_PUREBLACK_PRODUCT_SLUGS = [
  "oranier-arena-w-2-0-pureblack",
  "oranier-polar-neo-w-pureblack",
  "oranier-arktis-7-2-0-pureblack",
] as const;

export const oranierPureBlackHero: HubHomeHeroContent = {
  title: "Din stil. Din peis!",
  description: "Smart varme – stilfullt og bærekraftig.",
  ctaLabel: "Til Produktene",
  ctaHref: `/oranier-pureblack${ARENA_SECTION_HASH}`,
  imageSrc: `${IMG}/oranier-pureblack-peisovn-tegning.webp`,
  imageAlt:
    "Oranier pureBLACK peisovn – stilren tegning av sort vedovn med moderne linjer hos Peisbutikken",
  backgroundVideoSrc: `${VID}/polar-neo-pureblack-flammevisning.mp4`,
};

/** Intro block: Oranier pureBLACK (after hero + reading-time bar). */
export const oranierPureBlackIntroFeature: HubFeatureSplitContent = {
  id: "oranier-pureblack-intro",
  sections: [
    {
      title: "Oranier pureBLACK",
      description: `PureBlack fra det tyske selskapet Oranier kombinerer kompromissløs tysk kvalitet – med over 100 års erfaring i høykvalitets varmeapparater – og et elegant, helsort design som passer sømløst inn i moderne hjem. Med minimalistisk uttrykk og rene linjer varmer den effektivt og løfter interiøret, mens den sorte finishen gir et eksklusivt preg og fremhever flammebildet.

Ovnen leverer høy ytelse og effektiv forbrenning via avansert teknologi for lavere utslipp og optimal varmeutnyttelse, noe som gjør den både miljøvennlig og økonomisk. Den kombinerer funksjon og form – perfekt for deg med sans for detaljer og varig kvalitet.`,
    },
  ],
  imageSrc: `${IMG}/oranier-pureblack-peisovn-tegning.webp`,
  imageAlt:
    "Oranier pureBLACK peisovn – lineær illustrasjon av sort vedovn hos Peisbutikken",
  ctaLabel: "Til Produktene",
  ctaHref: `/oranier-pureblack${ARENA_SECTION_HASH}`,
};

export const oranierPureBlackArenaStory: HubFeatureSplitContent = {
  id: "oranier-pureblack-arena",
  sections: [
    {
      title: "Arena W+ 2.0 pureBLACK",
      description:
        "Oranier Arena W+ 2.0 pureBLACK er den høyeste av de tre pureBLACK modellene og også den med mest varmelagring.",
    },
    {
      title: "Egenskaper",
      listItems: [
        "Design: Helsvart, matt finish, panoramavindu med glassspyling, rustfrie ståldetaljer.",
        "Funksjonalitet: Selvlukkende Snap-Lock-System, kjølig luftstrømmet håndtak, oppbevaringsrom med magnetlukk.",
        "Effektivitet: Trippelt luftsystem for ren forbrenning, Økodesign-sertifisert, reduserer vedforbruk og utslipp.",
        "Varmelagring: Gir jevn, bærekraftig varme.",
        "Sertifiseringer: EN 13240, 2. Stufe BImSchV, Økodesign.",
        "Klar for friskluft: Ideell for moderne hjem.",
        "Dreieskive-tilbehør: Gjør at du kan rotere ovnen mens den er i bruk. Obs: Kan ikke brukes sammen med friskluft – og røykrøret må topp-monteres.",
      ],
      description: "Perfekt ovn for koselige vinterkvelder!",
    },
  ],
  imageSrc: `${IMG}/oranier-arena-pureblack-transparent-1.webp`,
  imageAlt:
    "Oranier Arena W+ 2.0 pureBLACK – transparent produktbilde av sort vedovn hos Peisbutikken",
  ctaLabel: "Lær mer om Arena W+ 2.0",
  ctaHref: buildProductHref("oranier-arena-w-2-0-pureblack"),
};

export const oranierPureBlackArenaSpecs: HubFeatureSpecSplitContent = {
  id: "oranier-pureblack-arena-specs",
  title: "Oranier Arena W+ 2.0 pureBLACK",
  stats: [
    {
      label: "Mål (H x B x D)",
      value: "149,1 x 51,5 x 51,5 cm",
      iconKey: "ruler",
    },
    { label: "Vekt", value: "275 kg", iconKey: "weight" },
    { label: "Nominell effekt", value: "7 kW", iconKey: "zap" },
    {
      label: "Oppvarmingsareal",
      value: "40 – 144 kvm",
      iconKey: "home",
    },
  ],
  imageSrc: `${IMG}/arena-w-2.0-pureblack-livstilbilde-landing-page.webp`,
  imageAlt:
    "Oranier Arena W+ 2.0 pureBLACK i moderne stue med livsstilsbilde hos Peisbutikken",
  ctaLabel: "Til Oranier Arena W+ 2.0 pureBLACK",
  ctaHref: buildProductHref("oranier-arena-w-2-0-pureblack"),
};

export const oranierPureBlackPolarStory: HubFeatureSplitContent = {
  id: "oranier-pureblack-polar",
  sections: [
    {
      title: "Polar Neo pureBLACK W+",
      description: `Oranier Polar Neo pureBLACK W+ kombinerer industriell design med avansert teknologi for effektiv oppvarming og minimalistisk estetikk. Den har helsvart «deepblack»-lakkering, runde form, høydejusterbare føtter, og veier ca. 153 kg (pluss 41 kg varmelagringsstein). Glassdøren med Robax NightFlame® er svart og ugjennomsiktig når kald, men transparent ved bruk for klart flammespill. Korpus i stål, dør og base i støpejern, innvendig svart ildfast betong.`,
    },
    {
      title: "Egenskaper",
      listItems: [
        "Design og materialer: Helsvart finish, panoramaglass med spyling, rustfrie detaljer.",
        "Funksjonalitet: Automatisk luftregulering, Snap-Lock-System for selvlukkende dør, kjølig håndtak, stor askeskuff, oppbevaringsrom.",
        "Effektivitet: Trippelt luftsystem for ren forbrenning, 41 kg varmelagringsstein for jevn varme i timer, støtter 24-timers drift.",
        "Oppgradering: Mulig conFlame for app-styring (ikke standard).",
        "Miljø og sikkerhet: Sertifisert etter BImSchV 2, EN 16510, energiklasse A+; lavt utslipp, ekstern lufttilførsel for lufttette hjem.",
        "Installasjon: Fleksible sikkerhetsavstander og tilkoblinger.",
      ],
      description:
        "Ovnen reduserer brenselforbruk, gir jevn varme og oppfyller miljøstandarder, egnet for moderne boliger.",
    },
  ],
  imageSrc: `${IMG}/oranier-polar-neo-pureblack-transparent-bakgrunn.webp`,
  imageAlt:
    "Oranier Polar Neo pureBLACK W+ – transparent produktbilde av sort kuleformet vedovn hos Peisbutikken",
  ctaLabel: "Lær mer om Polar neo W+",
  ctaHref: buildProductHref("oranier-polar-neo-w-pureblack"),
};

export const oranierPureBlackPolarSpecs: HubFeatureSpecSplitContent = {
  id: "oranier-pureblack-polar-specs",
  title: "Oranier Polar Neo pureBLACK W+",
  stats: [
    {
      label: "Mål (H x B x D)",
      value: "120,8 x 57 x 48 cm",
      iconKey: "ruler",
    },
    { label: "Vekt", value: "192 kg", iconKey: "weight" },
    { label: "Nominell effekt", value: "6,5 kW", iconKey: "zap" },
    {
      label: "Oppvarmingsareal",
      value: "40 – 144 kvm",
      iconKey: "home",
    },
  ],
  imageSrc: `${IMG}/arena-w-2.0-pureblack-livstilbilde-landing-page.webp`,
  imageAlt:
    "Livsstilsbilde – Oranier pureBLACK ovn i lys, moderne stue hos Peisbutikken",
  ctaLabel: "Til Oranier Polar Neo pureBLACK W+",
  ctaHref: buildProductHref("oranier-polar-neo-w-pureblack"),
};

export const oranierPureBlackArktisStory: HubFeatureSplitContent = {
  id: "oranier-pureblack-arktis",
  sections: [
    {
      title: "Arktis 7 2.0 pureBLACK",
      description:
        "Opplev vintervarme med Oraniers eksklusive PureBlack-spesialutgave, som kombinerer tidløs eleganse, høy kvalitet og kraftfull ytelse i et helsort, moderne design som passer ethvert hjem.",
    },
    {
      title: "Egenskaper",
      listItems: [
        "Design og funksjonalitet: Moderne, helsort matt Deepblack-lakk, minimalistisk stil, Robax NightFlame®-glass for klar flammevisning og redusert vedlikehold.",
        "Miljøvennlig teknologi: Økodesign-sertifisert for ren, effektiv forbrenning, reduserte utslipp og energisparing.",
        "Praktiske funksjoner: Glassskylling, lukket vedoppbevaring, fleksibel røykrørtilkobling (150 mm topp/bak), ekstern lufttilførsel (100 mm).",
        "Holdbarhet: Laget i stål og støpejern med robust håndtak for lang levetid.",
        "Sertifiseringer: Økodesign, BimSchV nivå 2, EN 16510.",
        "Kapasitet: Plass til ved opptil 33 cm.",
      ],
      description:
        "Praktisk og den mest kompakte av pureBLACK modellene. Likevel solid og stødig – spesielt sammenlignet med konkurrentene.",
    },
  ],
  imageSrc: `${IMG}/oranier-arktis-pureblack-transparent-bakgrunn.webp`,
  imageAlt:
    "Oranier Arktis 7 2.0 pureBLACK – transparent produktbilde av kompakt sort vedovn hos Peisbutikken",
  ctaLabel: "Lær mer om Arktis 7 2.0",
  ctaHref: buildProductHref("oranier-arktis-7-2-0-pureblack"),
};

export const oranierPureBlackArktisSpecs: HubFeatureSpecSplitContent = {
  id: "oranier-pureblack-arktis-specs",
  title: "Oranier Arktis 7 2.0 pureBLACK",
  stats: [
    {
      label: "Mål (H x B x D)",
      value: "107 x 57 x 48 cm",
      iconKey: "ruler",
    },
    { label: "Vekt", value: "200 kg", iconKey: "weight" },
    { label: "Nominell effekt", value: "7 kW", iconKey: "zap" },
    {
      label: "Oppvarmingsareal",
      value: "30 – 144 kvm",
      iconKey: "home",
    },
  ],
  imageSrc: `${IMG}/arktis-7-2.0-pureblack-livstilbilde.webp`,
  imageAlt:
    "Oranier Arktis 7 2.0 pureBLACK livsstilsbilde i moderne interiør hos Peisbutikken",
  ctaLabel: "Til Oranier Arktis 7 2.0 pureBLACK",
  ctaHref: buildProductHref("oranier-arktis-7-2-0-pureblack"),
};

export const oranierPureBlackFaq: FAQItem[] = [
  {
    id: "oranier-pureblack-hva-er",
    question: "Hva er Oranier PureBLACK, og hvilke hovedfunksjoner har den?",
    answer:
      "Oranier PureBLACK er en moderne vedovn med matt svart finish, designet for effektiv oppvarming. Den har store glassflater for flammesyn, selvstengende dørlås og frisklufttilførsel for miljøvennlig bruk.",
  },
  {
    id: "oranier-pureblack-energiklasse",
    question:
      "Hvilken energiklasse har Oranier PureBLACK, og hvordan bidrar den til miljøvennlig oppvarming?",
    answer:
      "Den har energiklasse A+ med høy virkningsgrad (opptil 83 %), som reduserer vedforbruk og utslipp, og bruker fornybart brensel som er CO2-nøytralt.",
  },
  {
    id: "oranier-pureblack-installasjon",
    question:
      "Hva er kravene til installasjon av Oranier PureBLACK, inkludert avstander til vegger og gulv?",
    answer:
      "Den krever minst 1 cm klaring til bakvegg og passer på under 1 m² gulvflate. Sjekk manualen for nøyaktige krav til sikkerhetsavstander og røykrør – eller spør oss i Peisbutikken.",
  },
  {
    id: "oranier-pureblack-brensel",
    question: "Hvilke typer brensel kan brukes i Oranier PureBLACK?",
    answer:
      "Bruk kun tørr ved eller godkjente briketter. Sjekk manualen for spesifikke anbefalinger om fuktighetsinnhold og størrelse.",
  },
  {
    id: "oranier-pureblack-tenne",
    question:
      "Hvordan tenner og regulerer jeg ilden i Oranier PureBLACK for optimal ytelse?",
    answer:
      "Tenn opp med tørr ved nedenfra, og bruk luftkontrollsystemet til å regulere forbrenning. Start med fullt trekk, og reduser etter hvert.",
  },
  {
    id: "oranier-pureblack-renhold",
    question:
      "Hvordan rengjør jeg glassdøren og askebeholderen i Oranier PureBLACK?",
    answer:
      "Spray glasset med Askepotts sotfjerner og tørk av med en fuktig klut. Bruk hansker og fjern aske når ovnen er kald. Vi har også askestøvsuger som forenkler jobben – sjekk i nettbutikken eller spør oss.",
  },
  {
    id: "oranier-pureblack-sikkerhet",
    question: "Hvilke sikkerhetsfunksjoner har Oranier PureBLACK?",
    answer:
      "Den har et selvstengende låsesystem, termisk sikring og kan utstyres med lavtrykksvarsling for sikker bruk i tette boliger.",
  },
  {
    id: "oranier-pureblack-friskluft",
    question:
      "Kan Oranier PureBLACK kobles til ekstern lufttilførsel, og hvordan gjøres det?",
    answer:
      "Ja, alle peiser i pureBLACK-serien har standard ekstern lufttilkobling (tilbehør kreves). Følg manualen for korrekt montering av luftrør. Spør oss gjerne om råd.",
  },
  {
    id: "oranier-pureblack-vedlikehold",
    question:
      "Hvor ofte bør Oranier PureBLACK vedlikeholdes, og hva inkluderer det?",
    answer:
      "Vedlikehold anbefales årlig, inkludert rengjøring av røykrør, sjekk av tetninger og eventuell utskifting av slitedeler som isoleringsstein i brennkammeret. De holder ofte i mange år og byttes vanligvis etter ca. fem år ved lett til middels bruk hver sesong.",
  },
  {
    id: "oranier-pureblack-problem",
    question:
      "Hva gjør jeg hvis jeg får problemer med montering eller drift – hvem kontakter jeg?",
    answer:
      "Kontakt oss i Peisbutikken, så hjelper vi deg videre. Vi er tilgjengelig på telefon og e-post.",
  },
];
