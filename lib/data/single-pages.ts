import {
  HOME_DELIVERY_ZONES,
  SMALL_PACKAGE_BRACKETS,
  formatNok,
} from "@/lib/shipping/shipping-rates";

export type SinglePageSlug =
  | "fraktbetingelser"
  | "fyringsveiledning"
  | "salgsbetingelser"
  | "personvernserklaering";

export type SinglePageIconKey =
  | "truck"
  | "package"
  | "clock3"
  | "shieldCheck"
  | "alertTriangle"
  | "fileText"
  | "receipt"
  | "scale"
  | "userCheck"
  | "flame"
  | "wind"
  | "droplets"
  | "wrench"
  | "video"
  | "lock"
  | "database"
  | "mail"
  | "eye"
  | "percent"
  | "banknote"
  | "calendar"
  | "pieChart"
  | "layers"
  | "smartphone"
  | "wifi"
  | "volumeX"
  | "leaf"
  | "palette"
  | "zap";

export type SummaryCardItem = {
  iconKey: SinglePageIconKey;
  title: string;
  description: string;
  bullets?: string[];
};

export type SummaryAccordionItem = {
  id: string;
  title: string;
  content: string;
};

export type SummaryAccordionSection = {
  title: string;
  description?: string;
  items: SummaryAccordionItem[];
};

export type HomeDeliveryRateRow = {
  fromPostcode: string;
  toPostcode: string;
  price35to199: string;
  price200to499: string;
  price500to599: string;
};

export type SmallPackageRateRow = {
  weightRange: string;
  price: string;
};

export type ShippingSummarySection = {
  homeDeliveryIntro: string;
  homeDeliveryNote?: string;
  homeDeliveryRates: HomeDeliveryRateRow[];
  smallPackageIntro: string;
  smallPackageRates: SmallPackageRateRow[];
  damageNotice: string;
  svalbardNote?: string;
};

export type SummaryVideoItem = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  youtubeVideoId?: string;
};

export type SinglePageSummaryData = {
  slug: SinglePageSlug;
  title: string;
  heroBadge: string;
  lead: string;
  keyCards: SummaryCardItem[];
  shippingSummary?: ShippingSummarySection;
  accordionSections?: SummaryAccordionSection[];
  videos?: SummaryVideoItem[];
  supportCard?: {
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

export const fraktbetingelserPageData: SinglePageSummaryData = {
  slug: "fraktbetingelser",
  title: "Fraktbetingelser",
  heroBadge: "Frakt og levering i korthet",
  lead:
    "Levering, fraktpriser og hva du gjør ved transportskade når du handler hos Peisbutikken.",
  keyCards: [
    {
      iconKey: "truck",
      title: "Hjemlevering av peis",
      description:
        "Varer mellom 35-599 kg leveres normalt på fast dekke, vanligvis 5-21 dager etter registrert betaling.",
      bullets: [
        "Leveringstid avhenger av lagerstatus",
        "Hyttefelt leveres etter avtale",
      ],
    },
    {
      iconKey: "package",
      title: "Småpakker med Postnord",
      description:
        "Pakker under 35 kg sendes normalt innen 2 virkedager etter betaling og lagerbekreftelse.",
      bullets: [
        "Du får sporingsinformasjon fra Postnord",
        "Hentefrist er normalt 1 uke (kan utvides i app)",
      ],
    },
    {
      iconKey: "alertTriangle",
      title: "Viktig ved mottak",
      description:
        "Kontroller varen ved levering. Synlige transportskader skal meldes raskt for å kunne behandles.",
      bullets: [
        "Meld skade innen 24 timer",
        "Skade meldes til post@peisbutikken.no",
      ],
    },
  ],
  shippingSummary: {
    homeDeliveryIntro:
      "Pris for hjemlevering avhenger av postnummer og vektklasse. Tabellen under viser hovednivåene.",
    homeDeliveryNote:
      "For leveranser til hyttefelt starter frakt normalt fra kr 2 500 etter avtale.",
    // Derived from lib/shipping/shipping-rates.ts (also feeds product
    // schema.org shippingDetails) so page and schema can never drift.
    homeDeliveryRates: HOME_DELIVERY_ZONES.map((zone) => ({
      fromPostcode: zone.fromPostcode,
      toPostcode: zone.toPostcode,
      price35to199: formatNok(zone.rateByBracketNok.w35to199),
      price200to499: formatNok(zone.rateByBracketNok.w200to499),
      price500to599: formatNok(zone.rateByBracketNok.w500to599),
    })),
    smallPackageIntro:
      "Småpakker under 35 kg har egne faste satser. Uavhentede pakker kan medføre returfrakt.",
    smallPackageRates: SMALL_PACKAGE_BRACKETS.map((bracket) => ({
      weightRange: bracket.label,
      price: formatNok(bracket.priceNok),
    })),
    damageNotice:
      "Undersøk alltid varen ved mottak. Ved synlig skade ber du sjåfør ta varen i retur, og melder saken innen 24 timer.",
    svalbardNote: "For levering til Svalbard: kontakt oss før bestilling.",
  },
  supportCard: {
    title: "Trenger du hjelp med frakt?",
    description:
      "Kontakt oss dersom du er usikker på levering, vektklasse eller frakt til spesielle adresser.",
    ctaLabel: "Kontakt oss",
    ctaHref: "/kontakt-oss",
  },
};

export const fyringsveiledningPageData: SinglePageSummaryData = {
  slug: "fyringsveiledning",
  title: "Fyringsveiledning",
  heroBadge: "Det viktigste om fyring og forbrenning",
  lead:
    "Fyring, ved og pipetrekk som gir tryggere forbrenning og mindre sot – praktiske råd fra Peisbutikken.",
  keyCards: [
    {
      iconKey: "flame",
      title: "Tre faktorer for god forbrenning",
      description:
        "God fyring krever riktig balanse mellom oksygen, brennbart materiale og temperatur.",
      bullets: [
        "For lite ved gir lav temperatur",
        "For lite luft gir sot og ufullstendig forbrenning",
      ],
    },
    {
      iconKey: "droplets",
      title: "Bruk tørr ved",
      description:
        "Fuktig ved kjøler ned forbrenningen og øker risiko for sot på glass og dårlig opptenning.",
      bullets: [
        "Lav temperatur gir mer partikler",
        "Dårlig varme i pipa gir svakere trekk",
      ],
    },
    {
      iconKey: "wind",
      title: "Pipen er motoren",
      description:
        "Det er pipetrekket som driver luft gjennom ildstedet. Uten trekk blir forbrenningen dårlig.",
      bullets: [
        "Varm pipe gir bedre oppdrift",
        "God oppfyring er viktig for å etablere trekk",
      ],
    },
    {
      iconKey: "wrench",
      title: "Vanlige problemer kan løses",
      description:
        "Røykutslag og soting skyldes ofte fyringsmåte og brensel, ikke nødvendigvis feil ved ildstedet.",
      bullets: [
        "Start med riktig opptenningsteknikk",
        "Sjekk vedkvalitet og lufttilførsel",
      ],
    },
  ],
  videos: [
    {
      title: "Fyringsveiledning",
      description:
        "Steg-for-steg om opptenning i rentbrennende ildsted, pipetrekk og god forbrenning (Nordpeis).",
      youtubeVideoId: "mY454kN4Q2Y",
      href: "https://www.youtube.com/watch?v=mY454kN4Q2Y",
      ctaLabel: "Åpne på YouTube",
    },
    {
      title: "Fyringstips for Q-serien",
      description:
        "Praktiske fyringstips for Nordpeis Q-serien fra Peisbutikken på YouTube.",
      youtubeVideoId: "KM8FszTYU4E",
      href: "https://www.youtube.com/watch?v=KM8FszTYU4E",
      ctaLabel: "Åpne på YouTube",
    },
  ],
  supportCard: {
    title: "Usikker på trekk eller sot?",
    description:
      "Ta kontakt med oss for råd om riktig opptenning, vedvalg og tiltak som kan forbedre fyringen.",
    ctaLabel: "Få hjelp",
    ctaHref: "/kontakt-oss",
  },
};

export const salgsbetingelserPageData: SinglePageSummaryData = {
  slug: "salgsbetingelser",
  title: "Salgsbetingelser",
  heroBadge: "Kjøpsvilkår i korthet",
  lead:
    "Avtale, betaling, levering og reklamasjon ved kjøp i nettbutikken – vilkårene du bør kjenne til hos Peisbutikken.",
  keyCards: [
    {
      iconKey: "fileText",
      title: "Avtale og priser",
      description:
        "Avtalen består av salgsbetingelser, informasjon i bestillingen og eventuelle særvilkår.",
      bullets: [
        "Priser oppgis som totalpris",
        "Særvilkår gjelder når de ikke strider mot lov",
      ],
    },
    {
      iconKey: "receipt",
      title: "Betaling",
      description:
        "Kort/Vipps reserveres ved bestilling og belastes når varen sendes. Klarna faktureres ved utsendelse.",
      bullets: [
        "Kjøpere må være minst 18 år",
        "Kredittsjekk kan utføres ved faktura/delbetaling",
      ],
    },
    {
      iconKey: "truck",
      title: "Levering og risiko",
      description:
        "Levering anses skjedd når du eller din representant overtar varen. Risiko går over ved overtakelse.",
      bullets: [
        "Normal frist er uten unødig opphold",
        "Senest 30 dager hvis annet ikke er avtalt",
      ],
    },
    {
      iconKey: "scale",
      title: "Rettigheter ved feil/forsinkelse",
      description:
        "Ved forsinkelse eller mangel kan du blant annet holde tilbake betaling, kreve retting, heving eller erstatning etter loven.",
      bullets: [
        "Reklamasjon innen rimelig tid",
        "Reklamasjonsfrist 2-5 år avhengig av varetype",
      ],
    },
  ],
  accordionSections: [
    {
      title: "Viktige detaljer",
      description: "Kort utdypning av de punktene kunder oftest spør om.",
      items: [
        {
          id: "angrerett",
          title: "Angrerett",
          content:
            "Du kan normalt angre kjøpet innen 14 dager. Retur skjer uten unødig opphold og senest 14 dager etter at du har gitt melding.",
        },
        {
          id: "reklamasjon",
          title: "Reklamasjon",
          content:
            "Meld fra om feil innen rimelig tid etter at feilen ble oppdaget. Reklamasjon innen 2 måneder anses alltid som tidsnok.",
        },
        {
          id: "slitedeler",
          title: "Reservedeler og slitedeler",
          content:
            "Slitedeler som pakninger, glass og vermikulitt har normalt 2 års reklamasjonsfrist. Normal slitasje dekkes ikke.",
        },
        {
          id: "tvister",
          title: "Tvister og lovvalg",
          content:
            "Tvister forsøkes løst i dialog. Ved behov kan saken tas til Forbrukerrådet eller domstol. Norsk rett gjelder.",
        },
      ],
    },
  ],
  supportCard: {
    title: "Les fullstendige salgsbetingelser",
    description:
      "Ta kontakt hvis du vil avklare vilkår eller detaljer før du bestiller.",
    ctaLabel: "Kontakt oss",
    ctaHref: "/kontakt-oss",
  },
};

export const personvernserklaeringPageData: SinglePageSummaryData = {
  slug: "personvernserklaering",
  title: "Personvernserklæring",
  heroBadge: "Personvern og dine rettigheter",
  lead:
    "Slik behandler Peisbutikken personopplysninger når du bruker nettstedet og våre tjenester, og hvilke rettigheter du har.",
  keyCards: [
    {
      iconKey: "database",
      title: "Hvilke data som kan samles inn",
      description:
        "Vi kan registrere tekniske data som IP-adresse, nettleser, operativsystem, tilgangstid og henvisende side.",
    },
    {
      iconKey: "eye",
      title: "Hvorfor opplysningene brukes",
      description:
        "Data brukes for å levere tjenester, forbedre nettsiden og gi informasjon du har bedt om.",
      bullets: [
        "Kvalitetssikring og statistikk",
        "Tilbud/nyheter når du har samtykket",
      ],
    },
    {
      iconKey: "lock",
      title: "Deling og kontroll",
      description:
        "Opplysninger deles ikke med tredjeparter uten samtykke, med mindre lov eller avtalte unntak krever det.",
    },
    {
      iconKey: "userCheck",
      title: "Dine rettigheter",
      description:
        "Du kan be om innsyn og oppdatering av opplysninger for å sikre at dataene er korrekte.",
    },
  ],
  accordionSections: [
    {
      title: "Mer om personvern",
      items: [
        {
          id: "behandlingsansvar",
          title: "Behandlingsansvar",
          content:
            "Peisbutikken er behandlingsansvarlig for personopplysninger som samles inn i forbindelse med bruk av nettstedet og kundedialog.",
        },
        {
          id: "kommunikasjon",
          title: "Kommunikasjon",
          content:
            "Når du registrerer deg eller kontakter oss, brukes opplysningene for å følge opp henvendelsen og levere tjenester du har bedt om.",
        },
      ],
    },
  ],
  supportCard: {
    title: "Spørsmål om personvern?",
    description:
      "Ta kontakt med oss dersom du ønsker innsyn eller har spørsmål om hvordan vi behandler personopplysninger.",
    ctaLabel: "Kontakt oss",
    ctaHref: "/kontakt-oss",
  },
};

export const singlePageSummaryDataBySlug: Record<
  SinglePageSlug,
  SinglePageSummaryData
> = {
  fraktbetingelser: fraktbetingelserPageData,
  fyringsveiledning: fyringsveiledningPageData,
  salgsbetingelser: salgsbetingelserPageData,
  personvernserklaering: personvernserklaeringPageData,
};
