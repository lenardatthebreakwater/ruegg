export type CookieConsentCategoryKey =
  | "necessary"
  | "preferences"
  | "statistics"
  | "marketing";

export const cookieConsentCategoryLabels: Record<CookieConsentCategoryKey, string> = {
  necessary: "Nødvendig",
  preferences: "Preferanser",
  statistics: "Statistikk",
  marketing: "Markedsføring",
};

export const cookieConsentBannerContent = {
  title: "Cookies",
  description:
    "Vi bruker cookies for at nettsiden skal fungere, for trafikk- og ytelsesanalyse, og for funksjoner mot sosiale medier.",
};

export const cookieConsentDialogContent = {
  tabs: {
    consent: "Samtykke",
    details: "Detaljer",
    about: "Om",
  },
  consent: {
    heading: "Som du sikkert har gjettet..",
    description:
      "Vi bruker cookies for å personalisere innhold og annonser, levere funksjoner for sosiale medier og analysere trafikken vår. Vi deler også informasjon om hvordan du bruker nettsiden med våre partnere innen sosiale medier, annonsering og analyse.",
  },
  details: {
    heading: "Detaljer om cookies",
    intro:
      "Her kan du lese hva de ulike cookie-kategoriene brukes til. Nødvendige cookies er alltid aktive for at nettsiden skal fungere.",
    categories: [
      {
        key: "necessary",
        description:
          "Nødvendige cookies aktiverer grunnleggende funksjoner som sidevisning, sikker navigasjon og tilgang til beskyttede områder.",
      },
      {
        key: "preferences",
        description:
          "Preferanse-cookies gjør at nettsiden kan huske valg du har gjort, som språk, region eller andre innstillinger, og aktiverer kundechat.",
      },
      {
        key: "statistics",
        description:
          "Statistikk-cookies hjelper oss å forstå hvordan nettsiden brukes, slik at vi kan forbedre innhold, ytelse og brukeropplevelse.",
      },
      {
        key: "marketing",
        description:
          "Markedsførings-cookies brukes for å vise relevante annonser og måle effekten av kampanjer på tvers av nettsteder.",
      },
    ] as Array<{ key: CookieConsentCategoryKey; description: string }>,
  },
  about: {
    heading: "Om samtykke",
    paragraphs: [
      "Samtykket ditt gjelder for dette nettstedet og lagres i nettleseren din.",
      "Du kan når som helst trekke tilbake eller endre samtykket ved å åpne cookie-innstillingene på nytt.",
      "Les mer om hvordan vi behandler personopplysninger i personvernserklæringen vår.",
    ],
    privacyLinkHref: "/personvern",
    privacyLinkLabel: "Åpne personvernserklæring",
  },
  actions: {
    reject: "Avslå",
    allowSelection: "Tillat utvalg",
    allowAll: "Tillat alle",
  },
};
