import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import {
  HOME_GOODS_STORE_OPENING_HOURS,
  HOME_GOODS_STORE_PROFILE,
} from "@/lib/seo/homegoods-store";
import { resolveProductDescriptionText } from "@/lib/products/description-cards";
import { getProductForJsonLd } from "@/lib/products/product-for-json-ld";
import { buildProductHref } from "@/lib/products/paths";
import type { Product } from "@/lib/types/product";
import { SITE_NAME, buildCanonical } from "@/lib/seo/metadata";
import { getSiteBaseUrl, toAbsoluteUrl } from "@/lib/seo/site-url";
import {
  HOME_DELIVERY_TRANSIT_DAYS,
  HOME_DELIVERY_ZONES,
  SMALL_PACKAGE_HANDLING_DAYS,
  SMALL_PACKAGE_MAX_KG,
  resolveHomeDeliveryBracket,
  resolveSmallPackagePriceNok,
} from "@/lib/shipping/shipping-rates";

type JsonLdNode = { [key: string]: unknown };
type SchemaWithContext = JsonLdNode & {
  "@context": "https://schema.org";
  "@type": string;
};

type QuantitativeValueSchema = {
  "@type": "QuantitativeValue";
  value: number;
  unitCode: "CMT" | "KGM";
};

type ImageObjectJsonLd = {
  "@type": "ImageObject";
  url: string;
  caption?: string;
  inLanguage?: "nb-NO";
};

type PropertyValueJsonLd = {
  "@type": "PropertyValue";
  name: string;
  value: string;
};

type OfferAvailability =
  | "https://schema.org/InStock"
  | "https://schema.org/OutOfStock"
  | "https://schema.org/BackOrder";

type MonetaryAmountSchema = {
  "@type": "MonetaryAmount";
  value: number;
  currency: "NOK";
};

type ShippingDestinationSchema = {
  "@type": "DefinedRegion";
  addressCountry: "NO";
  postalCodeRange?: {
    "@type": "PostalCodeRangeSpecification";
    postalCodeBegin: string;
    postalCodeEnd: string;
  };
};

type DayRangeSchema = {
  "@type": "QuantitativeValue";
  minValue: number;
  maxValue: number;
  unitCode: "DAY";
};

type ShippingDeliveryTimeSchema = {
  "@type": "ShippingDeliveryTime";
  handlingTime?: DayRangeSchema;
  transitTime?: DayRangeSchema;
};

type OfferShippingDetailsSchema = {
  "@type": "OfferShippingDetails";
  shippingRate: MonetaryAmountSchema;
  shippingDestination: ShippingDestinationSchema;
  deliveryTime?: ShippingDeliveryTimeSchema;
};

type MerchantReturnPolicySchema = {
  "@type": "MerchantReturnPolicy";
  applicableCountry: "NO";
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow";
  merchantReturnDays: number;
  returnMethod: "https://schema.org/ReturnByMail";
  returnFees: "https://schema.org/ReturnFeesCustomerResponsibility";
};

type OfferSellerSchema = {
  "@type": "Organization";
  "@id": string;
  name: string;
  url: string;
  sameAs: string[];
};

type ProductOfferSchema = {
  "@type": "Offer";
  price: number;
  priceCurrency: "NOK";
  availability: OfferAvailability;
  url: string;
  itemCondition: "https://schema.org/NewCondition";
  priceValidUntil: string;
  seller: OfferSellerSchema;
  priceSpecification: {
    "@type": "PriceSpecification";
    price: number;
    priceCurrency: "NOK";
    valueAddedTaxIncluded: boolean;
  };
  shippingDetails?: OfferShippingDetailsSchema[];
  hasMerchantReturnPolicy: MerchantReturnPolicySchema;
};

type AggregateOfferSchema = {
  "@type": "AggregateOffer";
  lowPrice: number;
  highPrice: number;
  priceCurrency: "NOK";
  offerCount: number;
  availability: OfferAvailability;
  url: string;
  itemCondition: "https://schema.org/NewCondition";
  priceValidUntil: string;
  seller: OfferSellerSchema;
  shippingDetails?: OfferShippingDetailsSchema[];
  hasMerchantReturnPolicy: MerchantReturnPolicySchema;
};

type AggregateRatingSchema = {
  "@type": "AggregateRating";
  ratingValue: number;
  reviewCount: number;
};

type OpeningHoursSpecificationSchema = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string;
  opens: string;
  closes: string;
};

export type StoreGraphSchema = {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
};

type BreadcrumbListItemSchema = {
  "@type": "ListItem";
  position: number;
  name: string;
  item?: string;
};

export type BreadcrumbSchema = SchemaWithContext & {
  "@type": "BreadcrumbList";
  itemListElement: BreadcrumbListItemSchema[];
};

export type CollectionPageSchema = SchemaWithContext & {
  "@type": "CollectionPage";
  name: string;
  description: string;
  url: string;
  inLanguage: "nb-NO";
};

export type ContactPageSchema = SchemaWithContext & {
  "@type": "ContactPage";
  name: string;
  description: string;
  url: string;
  inLanguage: "nb-NO";
};

export type ProductSchema = SchemaWithContext & {
  "@type": "Product";
  "@id"?: string;
  name: string;
  sku?: string;
  mpn?: string;
  description?: string;
  image?: (string | ImageObjectJsonLd)[];
  brand?: {
    "@type": "Brand";
    name: string;
  };
  /** Primary category (first term), matches breadcrumb and legacy SEO output */
  category?: string;
  url: string;
  gtin8?: string;
  gtin12?: string;
  gtin13?: string;
  gtin14?: string;
  width?: QuantitativeValueSchema;
  height?: QuantitativeValueSchema;
  depth?: QuantitativeValueSchema;
  weight?: QuantitativeValueSchema;
  additionalProperty?: PropertyValueJsonLd[];
  offers?: ProductOfferSchema | AggregateOfferSchema;
  aggregateRating?: AggregateRatingSchema;
};

export type ServiceSchema = SchemaWithContext & {
  "@type": "Service";
  name: string;
  description: string;
  url: string;
  provider: { "@id": string };
  areaServed?: string;
  inLanguage: "nb-NO";
};

export type FaqSchema = SchemaWithContext & {
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
};

type FaqItem = {
  question: string;
  answer: string;
};

function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function toProductPrice(value: Product["priceNumeric"] | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  return value;
}

function addGtinToSchema(target: ProductSchema, gtin: string | null | undefined) {
  const d = (gtin ?? "").replace(/\D/g, "");
  if (d.length === 13) {
    target.gtin13 = d;
  } else if (d.length === 8) {
    target.gtin8 = d;
  } else if (d.length === 12) {
    target.gtin12 = d;
  } else if (d.length === 14) {
    target.gtin14 = d;
  }
}

/**
 * Norwegian statutory right of withdrawal (angrerett): 14 days, customer
 * pays return shipping.
 */
function buildMerchantReturnPolicy(): MerchantReturnPolicySchema {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "NO",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
  };
}

/**
 * Weight-based shipping from the /fraktbetingelser rate table
 * (lib/shipping/shipping-rates.ts):
 * - ≤ 35 kg: nationwide Postnord flat rate, shipped within 2 business days.
 * - 35–599 kg: home delivery priced per postcode zone, 5–21 days.
 * - Heavier or unknown weight: quoted individually, so no shippingDetails.
 */
function buildShippingDetails(
  weightKg: number | null | undefined
): OfferShippingDetailsSchema[] | undefined {
  if (weightKg == null || !Number.isFinite(weightKg) || weightKg <= 0) {
    return undefined;
  }

  const smallPackagePrice = resolveSmallPackagePriceNok(weightKg);
  if (weightKg <= SMALL_PACKAGE_MAX_KG && smallPackagePrice != null) {
    return [
      {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: smallPackagePrice,
          currency: "NOK",
        },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "NO" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: SMALL_PACKAGE_HANDLING_DAYS.min,
            maxValue: SMALL_PACKAGE_HANDLING_DAYS.max,
            unitCode: "DAY",
          },
        },
      },
    ];
  }

  const bracket = resolveHomeDeliveryBracket(weightKg);
  if (!bracket) return undefined;

  return HOME_DELIVERY_ZONES.map((zone) => ({
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: zone.rateByBracketNok[bracket],
      currency: "NOK",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "NO",
      postalCodeRange: {
        "@type": "PostalCodeRangeSpecification",
        postalCodeBegin: zone.fromPostcode,
        postalCodeEnd: zone.toPostcode,
      },
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: HOME_DELIVERY_TRANSIT_DAYS.min,
        maxValue: HOME_DELIVERY_TRANSIT_DAYS.max,
        unitCode: "DAY",
      },
    },
  }));
}

function toOfferAvailability(
  stockStatus: Product["stockStatus"]
): OfferAvailability {
  switch (stockStatus) {
    case "OUT_OF_STOCK":
      return "https://schema.org/OutOfStock";
    case "ON_BACKORDER":
    case "AVAILABLE_ON_ORDER":
      return "https://schema.org/BackOrder";
    default:
      return "https://schema.org/InStock";
  }
}

/**
 * For variable products, prefer an aggregate across variations so JSON-LD does
 * not claim OutOfStock when another variation is still buyable (or vice versa).
 */
function resolveOfferAvailability(product: Product): OfferAvailability {
  const variations = product.variations ?? [];
  if (variations.length === 0) {
    return toOfferAvailability(product.stockStatus);
  }

  const statuses = variations.map((variation) => variation.stockStatus);
  if (statuses.some((status) => status === "IN_STOCK" || status == null)) {
    return "https://schema.org/InStock";
  }
  if (
    statuses.some(
      (status) => status === "ON_BACKORDER" || status === "AVAILABLE_ON_ORDER"
    )
  ) {
    return "https://schema.org/BackOrder";
  }
  if (statuses.every((status) => status === "OUT_OF_STOCK")) {
    return "https://schema.org/OutOfStock";
  }

  return toOfferAvailability(product.stockStatus);
}

/** Rolling 1-year validity unless overridden for Merchant Center experiments. */
function getSchemaPriceValidUntilDate(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SCHEMA_PRICE_VALID_UNTIL?.trim();
  if (fromEnv) return fromEnv;

  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

export function getOrganizationId(): string {
  return `${getSiteBaseUrl()}/#organization`;
}

export function getWebsiteId(): string {
  return `${getSiteBaseUrl()}/#website`;
}

type BuildStoreGraphSchemaOptions = {
  /**
   * Live Google Business Profile aggregate rating. Only emit when both values
   * are finite numbers from the live API — never static UI fallbacks.
   */
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  } | null;
};

function isLiveAggregateRating(
  value: BuildStoreGraphSchemaOptions["aggregateRating"]
): value is { ratingValue: number; reviewCount: number } {
  return (
    value != null &&
    typeof value.ratingValue === "number" &&
    Number.isFinite(value.ratingValue) &&
    value.ratingValue > 0 &&
    typeof value.reviewCount === "number" &&
    Number.isFinite(value.reviewCount) &&
    value.reviewCount > 0
  );
}

/**
 * Single source of truth for the business entity, emitted on the homepage and
 * the contact page as one @graph so every node (and the seller reference in
 * product schemas) resolves to the same @id.
 *
 * HomeGoodsStore is the most specific schema.org type for a fireplace store
 * (LocalBusiness → Store → HomeGoodsStore); OnlineStore covers the webshop.
 */
export function buildStoreGraphSchema(
  options?: BuildStoreGraphSchemaOptions
): StoreGraphSchema {
  const baseUrl = getSiteBaseUrl();
  const organizationId = getOrganizationId();
  const logoUrl = toAbsoluteUrl("/peisbutikken-logo-on-light.webp");
  const imageUrl = toAbsoluteUrl("/opengraph-image");

  const openingHoursSpecification: OpeningHoursSpecificationSchema[] =
    HOME_GOODS_STORE_OPENING_HOURS.filter(
      (hours): hours is typeof hours & { opens: string; closes: string } =>
        hours.opens != null && hours.closes != null
    ).map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.dayOfWeek,
      opens: hours.opens,
      closes: hours.closes,
    }));

  const hasGeo =
    typeof HOME_GOODS_STORE_PROFILE.geoLatitude === "number" &&
    typeof HOME_GOODS_STORE_PROFILE.geoLongitude === "number";

  const contactPoint: JsonLdNode = {
    "@type": "ContactPoint",
    contactType: "customer service",
    areaServed: "NO",
    availableLanguage: "Norwegian",
  };
  if (HOME_GOODS_STORE_PROFILE.telephone) {
    contactPoint.telephone = HOME_GOODS_STORE_PROFILE.telephone;
  }
  if (HOME_GOODS_STORE_PROFILE.email) {
    contactPoint.email = HOME_GOODS_STORE_PROFILE.email;
  }

  const store: JsonLdNode = {
    "@type": ["HomeGoodsStore", "OnlineStore"],
    "@id": organizationId,
    name: SITE_NAME,
    legalName: HOME_GOODS_STORE_PROFILE.legalName,
    description: HOME_GOODS_STORE_PROFILE.description,
    url: `${baseUrl}/`,
    logo: {
      "@type": "ImageObject",
      "@id": `${baseUrl}/#logo`,
      url: logoUrl,
      caption: SITE_NAME,
    },
    image: [imageUrl, logoUrl],
    address: {
      "@type": "PostalAddress",
      streetAddress: HOME_GOODS_STORE_PROFILE.streetAddress,
      postalCode: HOME_GOODS_STORE_PROFILE.postalCode,
      addressLocality: HOME_GOODS_STORE_PROFILE.addressLocality,
      addressCountry: HOME_GOODS_STORE_PROFILE.addressCountry,
    },
    hasMap: HOME_GOODS_STORE_PROFILE.hasMap,
    openingHoursSpecification,
    contactPoint,
    sameAs: [...HOME_GOODS_STORE_PROFILE.sameAs],
    areaServed: HOME_GOODS_STORE_PROFILE.areaServed,
    currenciesAccepted: HOME_GOODS_STORE_PROFILE.currenciesAccepted,
    vatID: HOME_GOODS_STORE_PROFILE.vatID,
    priceRange: "$$-$$$",
  };

  if (HOME_GOODS_STORE_PROFILE.email) {
    store.email = HOME_GOODS_STORE_PROFILE.email;
  }
  if (HOME_GOODS_STORE_PROFILE.telephone) {
    store.telephone = HOME_GOODS_STORE_PROFILE.telephone;
  }
  if (hasGeo) {
    store.geo = {
      "@type": "GeoCoordinates",
      latitude: HOME_GOODS_STORE_PROFILE.geoLatitude,
      longitude: HOME_GOODS_STORE_PROFILE.geoLongitude,
    };
  }
  if (HOME_GOODS_STORE_PROFILE.paymentAccepted.length > 0) {
    store.paymentAccepted = [...HOME_GOODS_STORE_PROFILE.paymentAccepted];
  }

  if (isLiveAggregateRating(options?.aggregateRating)) {
    store.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: options.aggregateRating.ratingValue,
      reviewCount: options.aggregateRating.reviewCount,
    };
  }

  const website: JsonLdNode = {
    "@type": "WebSite",
    "@id": getWebsiteId(),
    name: SITE_NAME,
    url: `${baseUrl}/`,
    inLanguage: "nb-NO",
    publisher: { "@id": organizationId },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [store, website],
  };
}

export function buildBreadcrumbSchema(
  breadcrumbs: BreadcrumbItem[],
  currentPath: string
): BreadcrumbSchema {
  const itemListElement = breadcrumbs.map((breadcrumb, index) => {
    const position = index + 1;
    const listItem: BreadcrumbListItemSchema = {
      "@type": "ListItem",
      position,
      name: breadcrumb.label,
    };

    if (breadcrumb.href) {
      listItem.item = toAbsoluteUrl(breadcrumb.href);
    } else if (position === breadcrumbs.length) {
      listItem.item = buildCanonical(currentPath);
    }

    return listItem;
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

type BuildCollectionPageSchemaInput = {
  path: string;
  name: string;
  description: string;
};

export function buildCollectionPageSchema({
  path,
  name,
  description,
}: BuildCollectionPageSchemaInput): CollectionPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: buildCanonical(path),
    inLanguage: "nb-NO",
  };
}

type ItemListElementSchema = {
  "@type": "ListItem";
  position: number;
  url: string;
};

export type ItemListSchema = SchemaWithContext & {
  "@type": "ItemList";
  numberOfItems: number;
  itemListElement: ItemListElementSchema[];
};

type BuildArchiveItemListSchemaInput = {
  /** Full products or slug-only entries (ItemList only needs product URLs). */
  products: Array<Pick<Product, "slug">>;
  /** How many products to emit as ListItems (defaults to the first page). */
  limit?: number;
};

/**
 * Google's "category page" structured data: an ItemList of product URLs
 * (summary-page style — each ListItem carries only the url; Google crawls the
 * product pages themselves for the full Product markup).
 */
export function buildArchiveItemListSchema({
  products,
  limit = 12,
}: BuildArchiveItemListSchemaInput): ItemListSchema {
  const itemListElement = products.slice(0, limit).map((product, index) => ({
    "@type": "ListItem" as const,
    position: index + 1,
    url: toAbsoluteUrl(buildProductHref(product.slug)),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: itemListElement.length,
    itemListElement,
  };
}

type BuildContactPageSchemaInput = {
  path: string;
  name: string;
  description: string;
};

export function buildContactPageSchema({
  path,
  name,
  description,
}: BuildContactPageSchemaInput): ContactPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name,
    description,
    url: buildCanonical(path),
    inLanguage: "nb-NO",
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildOfferSeller(): OfferSellerSchema {
  return {
    "@type": "Organization",
    "@id": getOrganizationId(),
    name: SITE_NAME,
    url: toAbsoluteUrl("/"),
    sameAs: [...HOME_GOODS_STORE_PROFILE.sameAs],
  };
}

/**
 * When a variable product has distinct numeric variation prices, emit
 * AggregateOffer (low/high/offerCount). Otherwise emit a single Offer for the
 * first/default variation (see `getProductForJsonLd`).
 */
function resolveVariationPriceRange(
  product: Product
): { lowPrice: number; highPrice: number; offerCount: number } | null {
  const prices = (product.variations ?? [])
    .map((variation) => toProductPrice(variation.priceNumeric))
    .filter((price): price is number => price != null)
    .map(roundMoney);

  if (prices.length < 2) return null;

  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);
  if (lowPrice === highPrice) return null;

  return { lowPrice, highPrice, offerCount: prices.length };
}

export function buildProductSchema(product: Product): ProductSchema {
  const p = getProductForJsonLd(product);
  const descriptionSource = resolveProductDescriptionText(p);
  const price = toProductPrice(p.priceNumeric);
  const path = buildProductHref(p.slug);
  const canonical = toAbsoluteUrl(path);
  const priceValidUntil = getSchemaPriceValidUntilDate();
  const availability = resolveOfferAvailability(product);
  const roundedPrice = price != null ? roundMoney(price) : null;
  const priceRange = resolveVariationPriceRange(product);

  const imageNodes: ImageObjectJsonLd[] | undefined =
    p.images && p.images.length > 0
      ? p.images.map((image) => {
          const node: ImageObjectJsonLd = { "@type": "ImageObject", url: image.sourceUrl };
          if (image.altText) {
            node.caption = image.altText;
            node.inLanguage = "nb-NO";
          }
          return node;
        })
      : p.image?.sourceUrl
        ? [
            (() => {
              const node: ImageObjectJsonLd = {
                "@type": "ImageObject",
                url: p.image.sourceUrl,
              };
              if (p.image.altText) {
                node.caption = p.image.altText;
                node.inLanguage = "nb-NO";
              }
              return node;
            })(),
          ]
        : undefined;

  const additionalProperty: PropertyValueJsonLd[] | undefined = p.attributes
    ?.map((a) => {
      const n = a.name?.trim() || a.label;
      if (!n || !a.value) return null;
      return { "@type": "PropertyValue" as const, name: n, value: a.value };
    })
    .filter((x): x is PropertyValueJsonLd => x != null);

  const schema: ProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonical}#richSnippet`,
    // Google recommends the plain product name without the site name suffix.
    name: p.name,
    sku: p.sku ?? undefined,
    description: descriptionSource ? stripHtml(descriptionSource) : undefined,
    image: imageNodes,
    brand: p.brand
      ? {
          "@type": "Brand",
          name: p.brand,
        }
      : undefined,
    category: p.categories?.[0]?.name,
    url: canonical,
  };

  const mpn = p.nobb?.trim();
  if (mpn) {
    schema.mpn = mpn;
  }

  addGtinToSchema(schema, p.gtin);

  if (p.heightCm != null && Number.isFinite(p.heightCm)) {
    schema.height = { "@type": "QuantitativeValue", value: p.heightCm, unitCode: "CMT" };
  }
  if (p.widthCm != null && Number.isFinite(p.widthCm)) {
    schema.width = { "@type": "QuantitativeValue", value: p.widthCm, unitCode: "CMT" };
  }
  if (p.lengthCm != null && Number.isFinite(p.lengthCm)) {
    schema.depth = { "@type": "QuantitativeValue", value: p.lengthCm, unitCode: "CMT" };
  }
  if (p.weightKg != null && Number.isFinite(p.weightKg)) {
    schema.weight = { "@type": "QuantitativeValue", value: p.weightKg, unitCode: "KGM" };
  }

  if (additionalProperty && additionalProperty.length > 0) {
    schema.additionalProperty = additionalProperty;
  }

  const shippingDetails = buildShippingDetails(p.weightKg);
  const seller = buildOfferSeller();
  const returnPolicy = buildMerchantReturnPolicy();

  if (priceRange) {
    schema.offers = {
      "@type": "AggregateOffer",
      lowPrice: priceRange.lowPrice,
      highPrice: priceRange.highPrice,
      priceCurrency: "NOK",
      offerCount: priceRange.offerCount,
      availability,
      url: canonical,
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil,
      seller,
      ...(shippingDetails ? { shippingDetails } : {}),
      hasMerchantReturnPolicy: returnPolicy,
    };
  } else if (roundedPrice != null) {
    schema.offers = {
      "@type": "Offer",
      price: roundedPrice,
      priceCurrency: "NOK",
      availability,
      url: canonical,
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil,
      seller,
      priceSpecification: {
        "@type": "PriceSpecification",
        price: roundedPrice,
        priceCurrency: "NOK",
        valueAddedTaxIncluded: true,
      },
      ...(shippingDetails ? { shippingDetails } : {}),
      hasMerchantReturnPolicy: returnPolicy,
    };
  }

  if (
    typeof p.rating === "number" &&
    Number.isFinite(p.rating) &&
    p.rating > 0 &&
    typeof p.reviewCount === "number" &&
    Number.isFinite(p.reviewCount) &&
    p.reviewCount > 0
  ) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: p.reviewCount,
    };
  }

  return schema;
}

type BuildServiceSchemaInput = {
  path: string;
  name: string;
  description: string;
  areaServed?: string;
};

export function buildServiceSchema({
  path,
  name,
  description,
  areaServed = "Norge",
}: BuildServiceSchemaInput): ServiceSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: buildCanonical(path),
    provider: { "@id": getOrganizationId() },
    areaServed,
    inLanguage: "nb-NO",
  };
}

export function buildFaqSchema(items: FaqItem[]): FaqSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

type BlogPostingInput = {
  title: string;
  description: string | null;
  path: string;
  datePublished: string | null;
  dateModified: string | null;
  imageUrl: string | null;
  authorName: string | null;
};

/** BlogPosting JSON-LD for editorial singles. */
export function buildBlogPostingSchema({
  title,
  description,
  path,
  datePublished,
  dateModified,
  imageUrl,
  authorName,
}: BlogPostingInput): SchemaWithContext {
  const absoluteImage = imageUrl ? toAbsoluteUrl(imageUrl) : null;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    ...(description ? { description } : {}),
    url: buildCanonical(path),
    mainEntityOfPage: buildCanonical(path),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...(absoluteImage
      ? {
          image: {
            "@type": "ImageObject",
            url: absoluteImage,
            inLanguage: "nb-NO",
          },
        }
      : {}),
    author: {
      "@type": "Person",
      name: authorName?.trim() || SITE_NAME,
    },
    publisher: { "@id": getOrganizationId() },
    inLanguage: "nb-NO",
    isPartOf: {
      "@type": "Blog",
      name: "Inspirasjon",
      url: buildCanonical("/blog/"),
    },
  };
}
