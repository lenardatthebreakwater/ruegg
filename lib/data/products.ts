import type { Product } from "@/lib/types/product";

/**
 * Dummy product data. Replace with GraphQL query to WooCommerce in the future.
 */
export const bestSellingProducts: Product[] = [
  {
    id: "1",
    name: "Moderne peisovn med glassdør",
    slug: "moderne-peisovn-med-glassdor",
    image: {
      sourceUrl: "https://placehold.co/400x400/e5e5e5/737373?text=Peisovn",
      altText: "Moderne peisovn",
    },
    brand: "Morsø",
    energyLabel: "A",
    price: "12 499 kr",
    priceNumeric: 12499,
    regularPrice: "14 999 kr",
    onSale: true,
    saleBadge: "Save 2 500 kr",
    maxPower: 6,
    fireplaceType: "Peisovn",
    color: "Svart",
  },
  {
    id: "2",
    name: "Klassisk støpejernsovn",
    slug: "klassisk-stopejernsovn",
    image: {
      sourceUrl: "https://placehold.co/400x400/e5e5e5/737373?text=Støpejern",
    },
    brand: "Jøtul",
    energyLabel: "A",
    price: "18 990 kr",
    priceNumeric: 18990,
    regularPrice: null,
    onSale: false,
    saleBadge: null,
    maxPower: 8,
    fireplaceType: "Vedovn",
    color: "Grå",
  },
  {
    id: "3",
    name: "Kompakt vedovn for små rom",
    slug: "kompakt-vedovn",
    image: {
      sourceUrl: "https://placehold.co/400x400/e5e5e5/737373?text=Vedovn",
    },
    brand: "Contura",
    energyLabel: "B",
    price: "9 990 kr",
    priceNumeric: 9990,
    regularPrice: "11 490 kr",
    onSale: true,
    saleBadge: "Save 1 500 kr",
    maxPower: 5,
    fireplaceType: "Vedovn",
    color: "Svart",
  },
  {
    id: "4",
    name: "Designer peis med sidelaster",
    slug: "designer-peis-sidelaster",
    image: {
      sourceUrl: "https://placehold.co/400x400/e5e5e5/737373?text=Designer",
    },
    brand: "Scan",
    energyLabel: "A",
    price: "24 900 kr",
    priceNumeric: 24900,
    regularPrice: "27 900 kr",
    onSale: true,
    saleBadge: "Save 3 000 kr",
    maxPower: 10,
    fireplaceType: "Peis",
    color: "Hvit",
  },
  {
    id: "5",
    name: "Innendørs ildsted med røykpipe",
    slug: "innendors-ildsted",
    image: {
      sourceUrl: "https://placehold.co/400x400/e5e5e5/737373?text=Ildsted",
    },
    brand: "Morsø",
    energyLabel: "A",
    price: "15 499 kr",
    priceNumeric: 15499,
    regularPrice: null,
    onSale: false,
    saleBadge: null,
    maxPower: 7,
    fireplaceType: "Ildsted",
    color: "Svart",
  },
  {
    id: "6",
    name: "Vedovn med varmelager",
    slug: "vedovn-varmelager",
    image: {
      sourceUrl: "https://placehold.co/400x400/e5e5e5/737373?text=Varmelager",
    },
    brand: "Jøtul",
    energyLabel: "A",
    price: "21 990 kr",
    priceNumeric: 21990,
    regularPrice: "24 990 kr",
    onSale: true,
    saleBadge: "Save 3 000 kr",
    maxPower: 9,
    fireplaceType: "Vedovn",
    color: "Grå",
  },
];

/** Most popular fireplaces (homepage). Replace with real data later. */
export const mostPopularProducts: Product[] = [
  bestSellingProducts[2],
  bestSellingProducts[0],
  bestSellingProducts[3],
  bestSellingProducts[1],
  bestSellingProducts[4],
];

/** Single product detail data (extended with gallery, models, description, etc.). */
const productDetailBySlug: Record<string, Product> = {
  "moderne-peisovn-med-glassdor": {
    ...bestSellingProducts[0],
    images: [
      {
        sourceUrl: "https://placehold.co/600x600/e5e5e5/737373?text=Peisovn+1",
        altText: "Moderne peisovn front",
      },
      {
        sourceUrl: "https://placehold.co/600x600/d4d4d4/525252?text=Peisovn+2",
        altText: "Moderne peisovn side",
      },
      {
        sourceUrl: "https://placehold.co/600x600/c4c4c4/404040?text=Peisovn+3",
        altText: "Moderne peisovn detail",
      },
    ],
    models: [
      {
        id: "m1",
        name: "Standard (Svart)",
        image: {
          sourceUrl: "https://placehold.co/600x600/e5e5e5/737373?text=Peisovn+1",
          altText: "Standard svart",
        },
      },
      {
        id: "m2",
        name: "Hvit",
        image: {
          sourceUrl: "https://placehold.co/600x600/f5f5f5/737373?text=Hvit",
          altText: "Hvit modell",
        },
      },
      {
        id: "m3",
        name: "Antrasitt",
        image: {
          sourceUrl: "https://placehold.co/600x600/737373/fff?text=Antrasitt",
          altText: "Antrasitt modell",
        },
      },
    ],
    description:
      "En moderne peisovn med glassdør som kombinerer effektiv forbrenning med elegant design. Ideell for å varme opp mellomstore til store rom. God energiklasse og lavt forbruk av ved.",
    technicalInfo:
      "Effekt: 6 kW\nEnergiklasse: A\nVekt: 85 kg\nHøyde: 75 cm\nBredde: 45 cm\nDyp: 40 cm\nMateriale: Støpejern og stål",
    documents: [
      { label: "Brukermanual (PDF)", url: "#" },
      { label: "Monteringsveiledning (PDF)", url: "#" },
    ],
    recommendedAccessories: [
      bestSellingProducts[1],
      bestSellingProducts[2],
      bestSellingProducts[4],
    ],
    rating: 4.5,
    reviewCount: 24,
  },
  "klassisk-stopejernsovn": {
    ...bestSellingProducts[1],
    images: [
      { sourceUrl: bestSellingProducts[1].image!.sourceUrl, altText: "Klassisk støpejernsovn" },
    ],
    models: [
      {
        id: "jotul-gra",
        name: "Grå",
        image: {
          sourceUrl: bestSellingProducts[1].image!.sourceUrl,
          altText: "Klassisk støpejernsovn grå",
        },
      },
      {
        id: "jotul-svart",
        name: "Svart",
        image: {
          sourceUrl: "https://placehold.co/600x600/262626/fff?text=Svart",
          altText: "Klassisk støpejernsovn svart",
        },
      },
    ],
    description: "Klassisk støpejernsovn med tidløs design.",
    technicalInfo: "Effekt: 8 kW\nEnergiklasse: A",
    documents: [],
    recommendedAccessories: [bestSellingProducts[0], bestSellingProducts[2]],
    rating: 4.8,
    reviewCount: 31,
  },
  "kompakt-vedovn": {
    ...bestSellingProducts[2],
    images: [
      { sourceUrl: bestSellingProducts[2].image!.sourceUrl, altText: "Kompakt vedovn" },
    ],
    models: [
      {
        id: "contura-svart",
        name: "Svart",
        image: {
          sourceUrl: bestSellingProducts[2].image!.sourceUrl,
          altText: "Kompakt vedovn svart",
        },
      },
      {
        id: "contura-hvit",
        name: "Hvit",
        image: {
          sourceUrl: "https://placehold.co/600x600/f5f5f5/737373?text=Hvit",
          altText: "Kompakt vedovn hvit",
        },
      },
    ],
    description: "Kompakt vedovn egnet for små rom.",
    technicalInfo: "Effekt: 5 kW\nEnergiklasse: B",
    documents: [],
    recommendedAccessories: [bestSellingProducts[0], bestSellingProducts[1]],
    rating: 4.2,
    reviewCount: 18,
  },
  "designer-peis-sidelaster": {
    ...bestSellingProducts[3],
    images: [
      { sourceUrl: bestSellingProducts[3].image!.sourceUrl, altText: "Designer peis" },
    ],
    models: [
      {
        id: "scan-hvit",
        name: "Hvit",
        image: {
          sourceUrl: bestSellingProducts[3].image!.sourceUrl,
          altText: "Designer peis hvit",
        },
      },
      {
        id: "scan-svart",
        name: "Svart",
        image: {
          sourceUrl: "https://placehold.co/600x600/262626/fff?text=Svart",
          altText: "Designer peis svart",
        },
      },
    ],
    description: "Designer peis med sidelaster.",
    technicalInfo: "Effekt: 10 kW\nEnergiklasse: A",
    documents: [],
    recommendedAccessories: [bestSellingProducts[0], bestSellingProducts[4]],
    rating: 4.7,
    reviewCount: 12,
  },
  "innendors-ildsted": {
    ...bestSellingProducts[4],
    images: [
      { sourceUrl: bestSellingProducts[4].image!.sourceUrl, altText: "Innendørs ildsted" },
    ],
    models: [
      {
        id: "morso-svart",
        name: "Svart",
        image: {
          sourceUrl: bestSellingProducts[4].image!.sourceUrl,
          altText: "Innendørs ildsted svart",
        },
      },
      {
        id: "morso-anthracite",
        name: "Antrasitt",
        image: {
          sourceUrl: "https://placehold.co/600x600/404040/fff?text=Antrasitt",
          altText: "Innendørs ildsted antrasitt",
        },
      },
    ],
    description: "Innendørs ildsted med røykpipe.",
    technicalInfo: "Effekt: 7 kW\nEnergiklasse: A",
    documents: [],
    recommendedAccessories: [bestSellingProducts[0], bestSellingProducts[1]],
    rating: 4.4,
    reviewCount: 9,
  },
  "vedovn-varmelager": {
    ...bestSellingProducts[5],
    images: [
      { sourceUrl: bestSellingProducts[5].image!.sourceUrl, altText: "Vedovn varmelager" },
    ],
    models: [
      {
        id: "jotul-varmelager-gra",
        name: "Grå",
        image: {
          sourceUrl: bestSellingProducts[5].image!.sourceUrl,
          altText: "Vedovn varmelager grå",
        },
      },
      {
        id: "jotul-varmelager-svart",
        name: "Svart",
        image: {
          sourceUrl: "https://placehold.co/600x600/262626/fff?text=Svart",
          altText: "Vedovn varmelager svart",
        },
      },
    ],
    description: "Vedovn med varmelager for lengre varmeeffekt.",
    technicalInfo: "Effekt: 9 kW\nEnergiklasse: A",
    documents: [],
    recommendedAccessories: [bestSellingProducts[0], bestSellingProducts[2]],
    rating: 4.6,
    reviewCount: 22,
  },
};

/** Get a single product by slug (with full detail data if available). */
export function getProductBySlug(slug: string): Product | null {
  const extended = productDetailBySlug[slug];
  if (extended) return extended;
  return bestSellingProducts.find((p) => p.slug === slug) ?? null;
}

/** Get similar products for suggestions (e.g. same brand or category). Excludes current product. */
export function getSimilarProducts(currentSlug: string, limit = 4): Product[] {
  const current = getProductBySlug(currentSlug);
  if (!current) return bestSellingProducts.slice(0, limit);
  return bestSellingProducts.filter((p) => p.slug !== currentSlug).slice(0, limit);
}
