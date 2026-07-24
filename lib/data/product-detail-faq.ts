export type ProductDetailFaqItem = {
  id: string;
  question: string;
  answer: string;
  iconKey: "wrench" | "house" | "home" | "truck" | "hammer" | "sparkles";
};

export const productDetailFaq: ProductDetailFaqItem[] = [
  {
    id: "komplisert-a-installere",
    iconKey: "wrench",
    question: "Er det komplisert å installere peisen?",
    answer:
      "Installasjon varierer etter bolig og eksisterende skorstein. Vi hjelper med vurdering, planlegging og montering i henhold til gjeldende krav.",
  },
  {
    id: "passer-i-hjemmet",
    iconKey: "house",
    question: "Passer denne modellen i mitt hjem?",
    answer:
      "Det avhenger av romstørrelse, ventilasjon, varmebehov og plassering. Vi anbefaler riktig modell basert på boligen din.",
  },
  {
    id: "pipe-eller-oppgradering",
    iconKey: "home",
    question: "Trenger jeg pipe eller oppgradering av skorstein?",
    answer:
      "Noen boliger trenger ny eller rehabilitert skorstein. Vi avklarer behovet tidlig og kan bistå med hele prosessen.",
  },
  {
    id: "leveringstid",
    iconKey: "truck",
    question: "Hvor lang er leveringstiden?",
    answer:
      "Lagerførte modeller leveres vanligvis raskt, mens bestillingsvarer kan bruke lengre tid. Du får estimat før bestilling.",
  },
  {
    id: "hele-jobben-med-montering",
    iconKey: "hammer",
    question: "Kan dere ta hele jobben med montering?",
    answer:
      "Ja, vi kan levere en komplett løsning med montering og nødvendig koordinering i Oslo og Akershus-området.",
  },
  {
    id: "service-og-vedlikehold",
    iconKey: "sparkles",
    question: "Hva med service og vedlikehold etter kjøp?",
    answer:
      "Vi gir råd om riktig bruk, vedlikehold og reservedeler, slik at peisen fungerer trygt og effektivt over tid.",
  },
];
