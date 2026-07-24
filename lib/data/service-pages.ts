import type { FAQItem, LocationInfo } from "@/lib/data/homepage";

export type ServiceTrustItem = {
  iconKey: "star" | "truck" | "shieldCheck" | "mapPin" | "clock3" | "wrench";
  text: string;
};

export type ServiceGalleryItem = {
  id: string;
  imageUrl: string;
  alt: string;
  caption?: string;
};

export type ServiceHeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  callCtaLabel: string;
  callCtaHref: string;
  imageUrl: string;
  imageAlt: string;
  /** Defaults to cover. Use "contain" for logos or marks that must not crop. */
  imageFit?: "cover" | "contain";
  /** Applied to the image panel (e.g. background behind a contained logo). */
  imagePanelClassName?: string;
};

export type ServiceMapContent = {
  title: string;
  description: string;
  areasHeading: string;
  areas: string[];
  closingText: string;
};

export type ServicePostContentSection = {
  id: string;
  title: string;
  description: string;
};

export type ServicePageData = {
  slug: "montering" | "piperehabilitering";
  hero: ServiceHeroContent;
  trustItems: ServiceTrustItem[];
  mapContent: ServiceMapContent;
  location: LocationInfo;
  galleryTitle: string;
  galleryDescription: string;
  galleryItems: ServiceGalleryItem[];
  postContentSections?: ServicePostContentSection[];
  faqTitle: string;
  faqDescription: string;
  faqItems: FAQItem[];
};

const serviceAreaLocation: LocationInfo = {
  name: "Peisbutikken AS",
  address: "Brynsveien 98, 1352 Kolsås",
  description:
    "Vi holder til i Bærum og monterer ofte i Oslo, Bærum, Asker, Drammen og nærliggende områder.",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=59.9079806,10.5102085&z=17&hl=no&output=embed",
  mapsPlaceUrl:
    "https://www.google.com/maps/place/Peisbutikken+AS/@59.9079806,10.5076282,17z/data=!3m1!4b1!4m6!3m5!1s0x46416e4a2bf1433d:0x74753686aed0d21b!8m2!3d59.9079806!4d10.5102085!16s%2Fg%2F1ptw2l1j1?hl=no",
  backgroundImageUrl: "/images/homepage/location/showroom-baerum.webp",
};

export const monteringPageData: ServicePageData = {
  slug: "montering",
  hero: {
    eyebrow: "Trygg peismontering fra fagfolk",
    title: "Montering av peis og ovn - sikkert, ryddig og forskriftsmessig",
    description:
      "Vi monterer vedovn, peisinnsats, elementpeis og gasspeis med erfarne montører og godkjente gassteknikere. Du får en løsning som ser bra ut, varmer godt og er trygg for familien.",
    callCtaLabel: "Ring oss nå",
    callCtaHref: "tel:+4721014010",
    imageUrl: "/images/services/montering/hero.webp",
    imageAlt: "Moderne stue med nyinstallert peis",
  },
  trustItems: [
    { iconKey: "shieldCheck", text: "Montering etter lover og forskrifter" },
    { iconKey: "wrench", text: "Erfarne montører og godkjente gassteknikere" },
    { iconKey: "star", text: "4,4/5 fra 116+ kundeanmeldelser" },
  ],
  mapContent: {
    title: "Hvor vi monterer",
    description:
      "Peisbutikken har butikk i Bærum og vi tilbyr våre monteringstjenester innen omtrent 1 times kjøretur unna butikken.",
    areasHeading: "Noen områder hvor vi monterer peis ofte:",
    areas: [
      "Hele Oslo",
      "Bærum",
      "Asker",
      "Kolsås",
      "Høvik",
      "Fornebu",
      "Snarøya",
      "Bygdøy",
      "Drammen",
      "Nittedal",
    ],
    closingText: "Se vårt monteringskart for nærmere info om hvor vi monterer.",
  },
  location: serviceAreaLocation,
  galleryTitle: "Eksempler på montering",
  galleryDescription:
    "Se utvalgte installasjoner vi har levert i norske hjem. Målet er alltid samme resultat: trygg varme og et pent helhetsinntrykk.",
  galleryItems: [
    {
      id: "montering-1",
      imageUrl: "/images/services/montering/gallery-01.webp",
      alt: "Peisovn montert i lys stue",
      caption: "Peisovn med ren og effektiv installasjon",
    },
    {
      id: "montering-2",
      imageUrl: "/images/services/montering/gallery-02.webp",
      alt: "Hjørnepeis montert i moderne bolig",
      caption: "Montering tilpasset rom og stil",
    },
    {
      id: "montering-3",
      imageUrl: "/images/services/montering/hero.webp",
      alt: "Montør som installerer gasspeis i bolig",
      caption: "Faglig montering utført av erfarne montører",
    },
  ],
  faqTitle: "Ofte stilte spørsmål om montering",
  faqDescription:
    "Svar på det de fleste lurer på før de bestiller montering av peis eller ovn.",
  faqItems: [
    {
      id: "montering-alle-typer",
      question:
        "Kan dere montere alle typer peiser, inkludert vedovn, peisinnsats og gasspeis?",
      answer:
        "Ja. Vi monterer vedovner, peisinnsatser, elementpeiser og gasspeiser. Gasspeis monteres og kontrolleres av godkjent gasstekniker.",
    },
    {
      id: "montering-ror-pipe",
      question: "Installerer dere også røykrør og pipe?",
      answer:
        "Ja, vi leverer komplett montering med røykrør, pipe/stålpipe og nødvendige tilpasninger for sikker ventilasjon.",
    },
    {
      id: "montering-uten-pipe",
      question: "Jeg har ikke pipe i dag. Kan dere hjelpe med det også?",
      answer:
        "Ja. Vi kan hjelpe med løsning for ny pipe og håndtering av nødvendig prosess mot kommunen der det kreves.",
    },
    {
      id: "montering-tid",
      question: "Hvor lang tid tar monteringen?",
      answer:
        "En standard montering av peisovn tar ofte rundt 1 dag. Mer omfattende prosjekter kan ta lengre tid, avhengig av arbeidets omfang.",
    },
    {
      id: "montering-pris",
      question: "Hva koster montering av peis?",
      answer:
        "Montering starter normalt fra ca. 6 900 kr. Endelig pris avhenger av peistype, eksisterende forhold og eventuelle tilleggsarbeider.",
    },
    {
      id: "montering-prosess",
      question: "Hvordan går jeg frem for å få ny peis montert?",
      answer:
        "Send oss en forespørsel med bilder og litt informasjon om boligen. Vi gir deg et uforpliktende forslag og tilbud, og avtaler videre steg.",
    },
  ],
};

export const piperehabiliteringPageData: ServicePageData = {
  slug: "piperehabilitering",
  hero: {
    eyebrow: "Trygg rehabilitering av skorstein",
    title: "Piperehabilitering som gir trygg fyring og bedre trekk",
    description:
      "Har du dårlig trekk, avvik fra feiertilsyn eller en slitt pipe? Vi rehabiliterer piper med skånsom metode, minimalt inngrep og løsninger som oppfyller dagens krav.",
    callCtaLabel: "Kontakt oss",
    callCtaHref: "#kontakt",
    imageUrl: "/images/services/piperehabilitering/hero.webp",
    imageAlt: "Tak med rehabilitert pipe i kveldssol",
  },
  trustItems: [
    { iconKey: "shieldCheck", text: "Rehabilitering i tråd med gjeldende krav" },
    { iconKey: "clock3", text: "Effektiv prosess med minimalt inngrep i boligen" },
    { iconKey: "mapPin", text: "Lokal fagkompetanse i Oslo-området" },
  ],
  mapContent: {
    title: "Steder vi ofte rehabiliterer piper",
    description:
      "Peisbutikken har butikk i Bærum og vi tilbyr rehabilitering av pipe innen omtrent 1 times kjøretur unna butikken.",
    areasHeading: "Noen områder hvor vi ofte monterer og rehabiliterer piper:",
    areas: [
      "Hele Oslo",
      "Bærum",
      "Asker",
      "Kolsås",
      "Høvik",
      "Fornebu",
      "Snarøya",
      "Bygdøy",
      "Drammen",
      "Nittedal",
    ],
    closingText:
      "Se vårt monteringskart for nærmere info om hvor vi rehabiliterer piper.",
  },
  location: serviceAreaLocation,
  galleryTitle: "Eksempler på piperehabilitering",
  galleryDescription:
    "Se hvordan rehabilitering kan gi tryggere fyring, bedre funksjon og en pipe som tåler mange nye år i bruk.",
  galleryItems: [
    {
      id: "pipe-1",
      imageUrl: "/images/services/piperehabilitering/gallery-01.webp",
      alt: "Bolig med rehabilitert skorstein",
      caption: "Oppgradert pipe med bedre trekk",
    },
    {
      id: "pipe-2",
      imageUrl: "/images/services/piperehabilitering/gallery-02.webp",
      alt: "Tak med ny pipehatt etter rehabilitering",
      caption: "Trygg løsning tilpasset eksisterende bolig",
    },
    {
      id: "pipe-3",
      imageUrl: "/images/services/piperehabilitering/gallery-03.webp",
      alt: "Skorstein på norsk enebolig",
      caption: "Rehabilitering som reduserer risiko for røyklekkasje",
    },
  ],
  faqTitle: "Ofte stilte spørsmål om piperehabilitering",
  faqDescription:
    "Her finner du svar på vanlige spørsmål om pris, prosess og hva som kreves.",
  faqItems: [
    {
      id: "pipe-pris",
      question: "Hva koster piperehabilitering?",
      answer:
        "Pris varierer normalt fra ca. 18 000 til 100 000 kr, avhengig av pipens høyde, antall etasjer og antall ildsteder som skal kobles til.",
    },
    {
      id: "pipe-tegn",
      question: "Hvordan vet jeg om pipen bør rehabiliteres?",
      answer:
        "Typiske tegn er dårlig trekk, røyklukt inne, sprekker, fuktskader eller avvik fra feiertilsyn. Da bør pipen vurderes av fagfolk.",
    },
    {
      id: "pipe-prosess",
      question: "Hvordan foregår rehabiliteringen?",
      answer:
        "Prosessen starter med vurdering av eksisterende pipe. Vanlig metode er innføring av nytt syrefast stålrør fra taket, med nødvendig tilpasning for tett og trygg røykgang.",
    },
    {
      id: "pipe-kommunen",
      question: "Må jeg søke kommunen?",
      answer:
        "Arbeid over tak kan være søknadspliktig. Vi veileder deg i prosessen og kan bistå med nødvendig dokumentasjon.",
    },
    {
      id: "pipe-bo-hjemme",
      question: "Kan vi bo i huset mens arbeidet pågår?",
      answer:
        "I de fleste tilfeller, ja. Metoden er normalt skånsom og mye av arbeidet utføres fra utsiden av boligen.",
    },
    {
      id: "pipe-flere-etg",
      question: "Vi har ildsteder i flere etasjer. Kan dette løses?",
      answer:
        "Ja. Vi kan rehabilitere pipen og etablere tilkobling for flere ildsteder der forholdene ligger til rette for det.",
    },
  ],
};
