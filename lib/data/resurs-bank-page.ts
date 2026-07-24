import type { ServiceHeroContent } from "@/lib/data/service-pages";
import type { SummaryCardItem } from "@/lib/data/single-pages";

/** Inline emphasis segments for paragraphs that mirror the original page’s bold highlights. */
export type RichTextSegment = {
  text: string;
  bold?: boolean;
};

export type RichParagraph = RichTextSegment[];

export type ResursArticleSection = {
  id: string;
  title: string;
  paragraphs: RichParagraph[];
};

export type ResursEksempelCard = {
  id: string;
  title: string;
  lines: string[];
};

export const resursBankHero: ServiceHeroContent = {
  eyebrow: "Delbetaling med Resurs Bank",
  title: "Betaling med Resurs Bank",
  description: "Fleksibel delbetaling hos Peisbutikken.no",
  callCtaLabel: "Ring oss nå",
  callCtaHref: "tel:+4721014010",
  imageUrl: "/images/resurs-bank/financing-hero.webp",
  imageAlt:
    "Resurs Bank logo – sikker rentefri 24 måneders delbetaling hos Peisbutikken.no",
  imageFit: "contain",
  imagePanelClassName: "bg-white dark:bg-white",
};

export const resursBankIntroSections: ResursArticleSection[] = [
  {
    id: "innledning",
    title: "Innledning",
    paragraphs: [
      [
        { text: "Hos " },
        { text: "Peisbutikken.no", bold: true },
        {
          text:
            " ønsker vi å gjøre det enklere for deg å realisere peisdrømmen. Derfor tilbyr vi nå betaling gjennom ",
        },
        { text: "Resurs Bank", bold: true },
        {
          text: ", hvor du kan dele opp betalingen over ",
        },
        { text: "24 måneder", bold: true },
        { text: " med " },
        { text: "0 % rente", bold: true },
        { text: ", " },
        { text: "0 kr etableringsgebyr", bold: true },
        { text: ", og kun et " },
        { text: "månedsgebyr på 79 kr", bold: true },
        { text: ". Maksbeløp: " },
        { text: "60 000 kr", bold: true },
      ],
    ],
  },
  {
    id: "hva-er-resurs",
    title: "Hva er Resurs Bank?",
    paragraphs: [
      [
        { text: "Resurs Bank", bold: true },
        {
          text:
            " er en ledende nordisk bank som spesialiserer seg på finansiering og betalingsløsninger for både privatpersoner og bedrifter. Med Resurs Bank får du en trygg og fleksibel måte å finansiere dine kjøp på. Vær oppmerksom på at det kreves en kredittvurdering og godkjenning for å benytte seg av denne betalingsløsningen.",
        },
      ],
    ],
  },
];

export const resursBankFordelerSection = {
  title: "Fordeler med delbetaling gjennom Resurs Bank",
  description:
    "Her ser du hovedfordelene ved å dele opp betalingen med Resurs Bank hos oss.",
};

export const resursBankFordelerCards: SummaryCardItem[] = [
  {
    iconKey: "percent",
    title: "Rente",
    description:
      "Du betaler ingen renter i løpet av nedbetalingsperioden.",
  },
  {
    iconKey: "banknote",
    title: "Etableringsgebyr",
    description: "Ingen ekstra kostnader ved opprettelse av avtalen.",
  },
  {
    iconKey: "calendar",
    title: "Faste månedsgebyrer",
    description:
      "Kun 79 kr per måned i administrasjonsgebyr",
  },
  {
    iconKey: "pieChart",
    title: "Fleksibilitet",
    description: "Del opp betalingen over 24 måneder.",
  },
];

export const resursBankEksemplerSection = {
  title: "Nedbetalingseksempler",
  description:
    "Her er noen eksempler på hvordan nedbetalingen kan se ut, inkludert effektiv rente:",
};

export const resursBankEksempelCards: ResursEksempelCard[] = [
  {
    id: "eks-10k",
    title: "Eksempel 1: Handle for 10 000 kr",
    lines: [
      "Nedbetalingstid: 24 måneder",
      "Månedsbeløp: (10 000 kr ÷ 24) + 79 kr = 495,67 kr per måned",
      "Totalkostnad: 495,67 kr × 24 måneder = 11 896 kr",
      "Effektiv rente: 14,9 %",
    ],
  },
  {
    id: "eks-20k",
    title: "Eksempel 2: Handle for 20 000 kr",
    lines: [
      "Nedbetalingstid: 24 måneder",
      "Månedsbeløp: (20 000 kr ÷ 24) + 79 kr = 912,33 kr per måned",
      "Totalkostnad: 912,33 kr × 24 måneder = 21 896 kr",
      "Effektiv rente: 7,7 %",
    ],
  },
  {
    id: "eks-50k",
    title: "Eksempel 3: Handle for 50 000 kr",
    lines: [
      "Nedbetalingstid: 24 måneder",
      "Månedsbeløp: (50 000 kr ÷ 24) + 79 kr = 2 162,33 kr per måned",
      "Totalkostnad: 2 162,33 kr × 24 måneder = 51 896 kr",
      "Effektiv rente: 3,1 %",
    ],
  },
];

export const resursBankEksemplerDisclaimer =
  "Merk: Effektiv rente varierer avhengig av lånebeløp og nedbetalingstid. Beregningene over er basert på standard forutsetninger.";

export const resursBankSoknadSection = {
  title: "Hvordan søke om delbetaling?",
  description:
    "Følg disse trinnene når du vil søke om delbetaling med Resurs Bank i kassen.",
};

/** Step labels shown in the trust-style banner (same sequence as the original page). */
export const resursBankSoknadSteps = [
  "Velg Resurs Bank som betalingsalternativ i kassen på Peisbutikken.no.",
  "Fyll ut søknadsskjemaet med nødvendig informasjon.",
  "Send inn søknaden for kredittvurdering.",
  "Motta svar: Du vil få svar om søknaden er godkjent med en gang.",
  "Fullfør kjøpet: Ved godkjent søknad fullføres kjøpet med din nye betalingsavtale.",
] as const;

export const resursBankViktigSection = {
  title: "Viktig å vite",
  description:
    "Les gjennom disse punktene før du søker om delbetaling.",
};

export const resursBankViktigCards: SummaryCardItem[] = [
  {
    iconKey: "shieldCheck",
    title: "Kredittgodkjenning",
    description:
      "Alle søknader er underlagt kredittvurdering av Resurs Bank.",
  },
  {
    iconKey: "userCheck",
    title: "Aldersgrense",
    description:
      "Du må være minst 18 år for å søke om kreditt.",
  },
  {
    iconKey: "scale",
    title: "Ansvarlig låneopptak",
    description:
      "Vurder din egen økonomi før du inngår en kredittavtale.",
  },
  {
    iconKey: "fileText",
    title: "Avtalevilkår",
    description:
      "Les nøye gjennom vilkårene som følger med kredittavtalen.",
  },
];

export const resursBankOmSection: ResursArticleSection = {
  id: "om-resurs-bank",
  title: "Om Resurs Bank",
  paragraphs: [
    [
      {
        text:
          "Resurs Bank har over 40 års erfaring innen finansiering og tilbyr skreddersydde løsninger for millioner av kunder i Norden. Banken er kjent for sin kundevennlige tilnærming og effektive tjenester, noe som gjør betalingsprosessen enkel og sikker for deg.",
      },
    ],
  ],
};

