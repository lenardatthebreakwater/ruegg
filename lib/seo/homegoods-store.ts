import { SITE_CONTACT } from "@/lib/site-contact";

type OpeningHoursRow = {
  dayOfWeek: string;
  opens: string | null;
  closes: string | null;
};

/**
 * Social / sameAs — empty until Rüegg public profiles are confirmed.
 * Live ruegg.no does not expose social links in the footer.
 */
export const HOME_GOODS_STORE_SOCIAL_LINKS = [] as const;

/** Stable Google Maps place URL for the public storefront address. */
export const HOME_GOODS_STORE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_CONTACT.addressDisplay)}` as const;

/** Opening hours unknown on live ruegg.no (form-only contact) — omit structured hours. */
export const HOME_GOODS_STORE_OPENING_HOURS: readonly OpeningHoursRow[] = [] as const;

export const HOME_GOODS_STORE_PAYMENT_METHODS = [] as const;

export const HOME_GOODS_STORE_PROFILE = {
  name: "Rüegg",
  legalName: SITE_CONTACT.companyLegalName,
  description:
    "Utforsk peiser, vedovner og peisinnsatser fra Rüegg. Sveitsisk kvalitet siden 1955.",
  streetAddress: SITE_CONTACT.streetAddress,
  postalCode: SITE_CONTACT.postalCode,
  addressLocality: SITE_CONTACT.addressLocality,
  addressCountry: SITE_CONTACT.addressCountry,
  geoLatitude: null as number | null,
  geoLongitude: null as number | null,
  hasMap: HOME_GOODS_STORE_MAPS_URL,
  email: SITE_CONTACT.email || undefined,
  telephone: SITE_CONTACT.phoneHref || undefined,
  vatID: SITE_CONTACT.vatID,
  currenciesAccepted: "NOK",
  areaServed: "Norge",
  openingHoursText: [] as const,
  paymentAccepted: HOME_GOODS_STORE_PAYMENT_METHODS,
  acceptedPaymentMethod: HOME_GOODS_STORE_PAYMENT_METHODS,
  sameAs: [HOME_GOODS_STORE_MAPS_URL] as const,
} as const;
