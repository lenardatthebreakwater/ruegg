/**
 * Homepage content and dummy data. Replace with CMS/API later.
 */

import { buildCategoryHref } from "@/lib/products/paths";

export type HomepageOffer = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  /** Optional badge, e.g. "Spring campaign" */
  badge?: string;
  /** Hero image from local public folder */
  imageUrl: string;
  /** Short alt text for the image; falls back to title-based copy in the card */
  imageAlt?: string;
};

export type HomepageProductCard = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
};

export const homepageProductCards: HomepageProductCard[] = [
  {
    id: "elementpeis",
    title: "Elementpeis",
    description:
      "Gir deg den perfekte kombinasjonen av eksklusivitet og praktisk design. Vi har mange forskjellige valg og mange av peisene kan man selv tilpasse med egne farger.",
    ctaLabel: "Se elementpeiser her",
    ctaHref: buildCategoryHref("elementpeis"),
    imageUrl: "/images/homepage/products/element-fireplace.webp",
    imageAlt: "Elementpeis i moderne stue",
  },
  {
    id: "peisovn",
    title: "Peisovn",
    description:
      "Er du på jakt etter en peisovn? I vårt sortiment finner du et stort utvalg av peisovner fra kjente merkevarer som Aduro, Nordpeis, Spartherm og mange andre spennende merker.",
    ctaLabel: "Se peisovner her",
    ctaHref: buildCategoryHref("peisovn"),
    imageUrl: "/images/homepage/products/wood-stove.webp",
    imageAlt: "Peisovn i nordisk interiør",
  },
  {
    id: "peisinnsats",
    title: "Peisinnsats",
    description:
      "Peisinnsatser er peiser som krever montering, omramming eller muring for å bli til en komplett peis. Vi har et stort utvalg og vi håper du finner noe du setter pris på her hos oss.",
    ctaLabel: "Se peisinnsatser her",
    ctaHref: buildCategoryHref("peisinnsats"),
    imageUrl: "/images/homepage/products/fireplace-insert.webp",
    imageAlt: "Innebygd peisinnsats med omramming",
  },
  {
    id: "gasspeis",
    title: "Gasspeis",
    description:
      "Praktisk og elegant - vi tilbyr et stort utvalg av gasspeiser og gassovner. Enten du er på jakt etter en frittstående gassovn, hjørnepeis eller utendørs gasspeis, finner du det hos oss.",
    ctaLabel: "Se gasspeiser her",
    ctaHref: buildCategoryHref("gasspeis"),
    imageUrl: "/images/homepage/products/gas-fireplace.webp",
    imageAlt: "Gasspeis med levende flammer",
  },
  {
    id: "utepeis",
    title: "Utepeis",
    description:
      "Utepeis er perfekt for å skape et hyggelig samlingspunkt i hagen. Nyt sene kvelder ute med en klassisk utepeis, peisbord eller en peis der du også kan grille.",
    ctaLabel: "Se utepeiser her",
    ctaHref: buildCategoryHref("utepeis"),
    imageUrl: "/images/homepage/products/outdoor-fireplace.webp",
    imageAlt: "Utepeis i hage om kvelden",
  },
  {
    id: "peistilbehor",
    title: "Peistilbehør",
    description:
      "Her finner du alt av tilbehør til din peis. Enten du trenger gulvplate, vedkurv, vedbærer eller rengjøringsprodukter - så finner du de her hos oss.",
    ctaLabel: "Se peistilbehør her",
    ctaHref: buildCategoryHref("peistilbehor"),
    imageUrl: "/images/homepage/products/fireplace-accessories.webp",
    imageAlt: "Peistilbehør ved siden av vedovn",
  },
];

export const homepageOffers: HomepageOffer[] = [
  {
    id: "catalog",
    badge: "Utvalg",
    title: "Utforsk Rüegg-peiser",
    description: "Se peiser, vedovner og peisinnsatser i vårt katalogutvalg.",
    ctaLabel: "Se våre peiser",
    ctaHref: "/shop/",
    imageUrl: "/images/homepage/offers/spring-campaign.webp",
    imageAlt:
      "Moderne stue med peis og skandinavisk interiør",
  },
  {
    id: "guidance",
    badge: "Veiledning",
    title: "Trenger du råd?",
    description: "Vi hjelper deg finne riktig peis til hjemmet ditt.",
    ctaLabel: "Kontakt oss",
    ctaHref: "/kontakt-oss/",
    imageUrl: "/images/homepage/offers/spare-parts.webp",
    imageAlt: "Vedovn i stue — personlig veiledning",
  },
  {
    id: "about",
    badge: "Om oss",
    title: "Sveitsisk kvalitet siden 1955",
    description: "Les mer om Rüegg og hvordan vi jobber.",
    ctaLabel: "Om oss",
    ctaHref: "/om-oss/",
    imageUrl: "/images/homepage/offers/chimney-rehabilitation.webp",
    imageAlt: "Moderne bolig med peis",
  },
];

export type ReviewSummary = {
  rating: number;
  count: number;
  /** Short quote or tagline from reviews */
  headline?: string;
};

/**
 * Default summary for the top bar and homepage when the Google Business Profile API
 * is unavailable. **Not** used when `GMB_*` is set and the API returns successfully.
 */
export const socialProofFallbackReviewSummary: ReviewSummary = {
  rating: 4.4,
  count: 116,
  headline: "Hva de sier.....",
};

export type ReviewQuote = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date?: string;
  /** Reviewer profile image URL (e.g. Google Business `profilePhotoUrl`). */
  avatarUrl?: string;
};

/** Inclusive minimum star rating for the homepage Google-reviews carousel (4 and 5 only). */
export const SOCIAL_PROOF_CAROUSEL_MIN_RATING = 4;

/**
 * Placeholder review cards for local dev, preview, and error fallback.
 * **Live data** comes from `getCachedGoogleBusinessSocialProof()` in
 * `lib/google-business-reviews.ts` when `GMB_CLIENT_ID`, `GMB_CLIENT_SECRET`,
 * `GMB_REFRESH_TOKEN`, `GMB_ACCOUNT_ID`, and `GMB_LOCATION_ID` are set.
 */
export const socialProofFallbackReviewQuotes: ReviewQuote[] = [
  {
    id: "1",
    author: "Kari N.",
    rating: 5,
    text: "Profesjonelt fra start til slutt. Den nye ovnen ser fantastisk ut og varmer hele huset.",
    date: "for 2 uker siden",
  },
  {
    id: "2",
    author: "Ole S.",
    rating: 5,
    text: "Endelig en butikk der du kan se og ta på ovnene. Rådgivning og montering i toppklasse.",
    date: "for 1 måned siden",
  },
  {
    id: "3",
    author: "Maria L.",
    rating: 4,
    text: "Rimelige priser og reservedelene vi trengte var på lager. Kommer gjerne tilbake.",
    date: "for 3 uker siden",
  },
  {
    id: "4",
    author: "Thomas H.",
    rating: 5,
    text: "Veldig fornøyd med installasjonen. Ryddig arbeid og god oppfølging etter leveranse.",
    date: "for 5 dager siden",
  },
  {
    id: "5",
    author: "Ingrid V.",
    rating: 5,
    text: "Utrolig hjelpsom betjening da vi skulle velge peisovn. Anbefales på det sterkeste.",
    date: "for 1 uke siden",
  },
  {
    id: "6",
    author: "Per K.",
    rating: 4,
    text: "God pris og rask levering. Peisen passer perfekt inn i stuen vår.",
    date: "for 2 uker siden",
  },
  {
    id: "7",
    author: "Anne B.",
    rating: 5,
    text: "Fra befaring til ferdig montering — alt gikk som avtalt. Takk for god service!",
    date: "for 4 dager siden",
  },
  {
    id: "8",
    author: "Lars M.",
    rating: 5,
    text: "Stort utvalg og folk som kan faget. Fikk svar på alle spørsmålene våre.",
    date: "for 10 dager siden",
  },
  {
    id: "9",
    author: "Silje R.",
    rating: 4,
    text: "Hyggelig butikk og greie å ha med å gjøre ved eventuell reklamasjon senere.",
    date: "for 3 uker siden",
  },
  {
    id: "10",
    author: "Erik F.",
    rating: 5,
    text: "Monteringsteamet var punktlige og profesjonelle. Resultatet ble akkurat som vi håpet.",
    date: "for 6 dager siden",
  },
  {
    id: "11",
    author: "Nina D.",
    rating: 5,
    text: "Vi er superfornøyde med vedovnen og den personlige oppfølgingen i prosessen.",
    date: "for 2 måneder siden",
  },
  {
    id: "12",
    author: "Bjørn A.",
    rating: 4,
    text: "God veiledning om pipe og sikkerhet. Følte oss trygge på valget.",
    date: "for 8 dager siden",
  },
  {
    id: "13",
    author: "Camilla S.",
    rating: 5,
    text: "Raskt svar på e-post og grundig tilbud. Alt stemte når vi kom til montering.",
    date: "for 12 dager siden",
  },
  {
    id: "14",
    author: "Morten J.",
    rating: 5,
    text: "Rüegg leverte kvalitet og god kommunikasjon fra første kontakt.",
    date: "for 3 dager siden",
  },
  {
    id: "15",
    author: "Heidi E.",
    rating: 4,
    text: "Fine produkter og dyktige montører. Absolutt verdt turen inn til utstillingen.",
    date: "for 9 dager siden",
  },
  {
    id: "16",
    author: "Jonas P.",
    rating: 5,
    text: "Enkel bestilling og god informasjon underveis. Anbefales!",
    date: "for 11 dager siden",
  },
  {
    id: "17",
    author: "Line W.",
    rating: 4,
    text: "Flott utvalg i butikken — vi fant akkurat det vi lette etter.",
    date: "for 14 dager siden",
  },
  {
    id: "18",
    author: "Frank O.",
    rating: 5,
    text: "Monteringen gikk knirkefritt. Hyggelige folk og ryddig prosess.",
    date: "for 6 dager siden",
  },
  {
    id: "19",
    author: "Ida C.",
    rating: 5,
    text: "Topp kundeservice da vi hadde et spørsmål etter levering.",
    date: "for 4 uker siden",
  },
  {
    id: "20",
    author: "Magnus T.",
    rating: 4,
    text: "God pris på vedovnen og rask levering til døren.",
    date: "for 18 dager siden",
  },
  {
    id: "21",
    author: "Silje H.",
    rating: 5,
    text: "Vi er kjempefornøyde med valget og hvordan alt ble forklart.",
    date: "for 7 dager siden",
  },
  {
    id: "22",
    author: "Espen L.",
    rating: 4,
    text: "Seriøs aktør — alt skjedde som avtalt og til avtalt tid.",
    date: "for 16 dager siden",
  },
  {
    id: "23",
    author: "Randi K.",
    rating: 5,
    text: "Utstillingen ga oss trygghet før vi bestemte oss for modell.",
    date: "for 20 dager siden",
  },
  {
    id: "24",
    author: "Anders N.",
    rating: 5,
    text: "Meget dyktige på pipe og tekniske detaljer — imponert.",
    date: "for 13 dager siden",
  },
  {
    id: "25",
    author: "Mette G.",
    rating: 4,
    text: "God oppfølging fra første telefon til ferdig montering.",
    date: "for 22 dager siden",
  },
  {
    id: "26",
    author: "Henrik B.",
    rating: 5,
    text: "Kvalitetsfølelse på produktet og på hele kjøpsopplevelsen.",
    date: "for 5 uker siden",
  },
  {
    id: "27",
    author: "Tonje F.",
    rating: 5,
    text: "Anbefaler Rüegg til alle vi kjenner som vurderer ny peis.",
    date: "for 17 dager siden",
  },
  {
    id: "28",
    author: "Stian V.",
    rating: 4,
    text: "Alt dokumentert pent og oversiktlig i tilbudet vi fikk.",
    date: "for 19 dager siden",
  },
  {
    id: "29",
    author: "Elise M.",
    rating: 5,
    text: "Fantastisk hjelp til å velge riktig effekt til rommet vårt.",
    date: "for 8 uker siden",
  },
  {
    id: "30",
    author: "Kristoffer R.",
    rating: 5,
    text: "Takk for tålmodighet da vi skulle bestemme oss — verdt ventetiden!",
    date: "for 21 dager siden",
  },
];

export type WhyChooseUsItem = {
  id: string;
  title: string;
  description: string;
  /** Lucide icon name or key */
  iconKey: "store" | "years" | "installations" | "rating" | "sketches";
};

export const whyChooseUsItems: WhyChooseUsItem[] = [
  {
    id: "truck",
    title: "Rask og pålitelig hjemlevering av peis og vedovn til hele Norge",
    description:
      "Spar tid og krefter med vår raske og pålitelige hjemlevering. Vi leverer peiser og vedovner direkte til døren din, uansett hvor i Norge du bor.",
    iconKey: "store",
  },
  {
    id: "price",
    title: "Høykvalitets peiser og vedovner til uslåelige priser",
    description:
      "Vi har peiser og vedovner av super kvalitet fra kjente merker, og til priser som passer enhver lommebok.",
    iconKey: "years",
  },
  {
    id: "installation",
    title: "Ekspertinstallasjon og montering av din nye peisovn eller vedovn",
    description:
      "Våre flinke montører sikrer at din nye vedovn eller peis blir satt opp trygt og riktig. Vi tilbyr også skreddersydde peisløsninger.",
    iconKey: "installations",
  },
];

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export const homepageFAQ: FAQItem[] = [
  {
    id: "typer-peiser",
    question: "Hvilke typer peiser selger dere?",
    answer:
      "Vi tilbyr peiser, vedovner og peisinnsatser fra Rüegg — sveitsisk kvalitet med moderne design.",
  },
  {
    id: "utstilling",
    question: "Kan jeg se peisene i utstillingen deres?",
    answer:
      "Ja, du er velkommen til å besøke oss i Harestua for å se utvalget og få veiledning.",
  },
  {
    id: "riktig-peis",
    question: "Hvilken peis passer best for mitt hjem?",
    answer:
      "Valget av peis avhenger av boligens størrelse, ventilasjon, varmebehov og designpreferanser. Våre eksperter hjelper deg gjerne!",
  },
  {
    id: "rentbrennende",
    question: "Har dere rentbrennende peiser?",
    answer:
      "Ja, vi tilbyr moderne, rentbrennende peiser som gir bedre varmeutnyttelse og lavere utslipp.",
  },
  {
    id: "vannkappe",
    question:
      "Har dere peiser med vannkappe for tilkobling til vannbåren varme?",
    answer:
      "Ja, vi har noen modeller som kan kobles til vannbårne systemer for effektiv oppvarming. Ta kontakt så kan vi hjelpe deg med forslag og tilbud.",
  },
  {
    id: "montering",
    question: "Tilbyr dere montering av peiser?",
    answer:
      "Ja, vi hjelper med montering. Ta kontakt for tilbud og dekning i ditt område.",
  },
  {
    id: "tillatelse",
    question: "Trenger jeg tillatelse for å installere peis?",
    answer:
      "I mange tilfeller må du søke kommunen om tillatelse, spesielt hvis du skal installere ny skorstein. Vi kan håndtere søknader til kommunen og tar oss gjerne av hele prosessen rundt dette.",
  },
  {
    id: "installasjonstid",
    question: "Hvor lang tid tar installasjonen?",
    answer:
      "Tiden varierer avhengig av type peis og om det må bygges ny skorstein. Normalt tar det 1–3 dager.",
  },
  {
    id: "demontering",
    question: "Kan dere fjerne min gamle peis?",
    answer:
      "Ja, vi tilbyr demontering og bortkjøring av gamle peiser mot et tillegg i prisen.",
  },
  {
    id: "trekkforsterkere",
    question: "Selger dere trekkforsterkere til pipe?",
    answer:
      "Ja, vi har ulike løsninger for å forbedre trekken og sikre sikker bruk av peisen. Ta en titt på vårt utvalg av Exodraft, evt ta kontakt for råd og veiledning.",
  },
  {
    id: "finansiering",
    question: "Har dere finansieringsløsninger?",
    answer:
      "Ta kontakt med oss — vi hjelper deg finne en betalingsløsning som passer.",
  },
  {
    id: "leveringstid",
    question: "Hva er leveringstiden på peiser?",
    answer:
      "Lagerførte modeller leveres innen få dager. Bestillingsvarer kan ta 2–6 uker, avhengig av leverandør.",
  },
];

export type LocationInfo = {
  name: string;
  address: string;
  /** Google Maps iframe `src` (Maps → Share → Embed). If omitted, a search-based embed is used. */
  mapsEmbedUrl?: string;
  /** Opens Google Maps at this place (map / business listing), not directions. */
  mapsPlaceUrl?: string;
  /** Full-bleed section background from local public folder. */
  backgroundImageUrl?: string;
  /** Short description */
  description?: string;
};

/** Rüegg / Peisindustri showroom (Harestua). */
export const homepageLocation: LocationInfo = {
  name: "Rüegg",
  address: "Harestumoen 12, 2743 Harestua",
  description:
    "Velkommen innom for en hyggelig peisprat — vi hjelper deg finne riktig Rüegg-løsning.",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Harestumoen+12,+2743+Harestua&z=17&hl=no&output=embed",
  mapsPlaceUrl:
    "https://www.google.com/maps/search/?api=1&query=Harestumoen+12,+2743+Harestua",
  backgroundImageUrl: "/images/homepage/location/showroom-baerum.webp",
};
