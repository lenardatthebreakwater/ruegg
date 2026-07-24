/** Canonical storefront contact details (footer, contact blocks, etc.). */
export const SITE_CONTACT = {
  companyLegalName: "Peisindustri AS",
  /**
   * Public phone — live ruegg.no is form-only; leave empty until confirmed.
   * Empty strings hide phone CTAs in the UI.
   */
  phoneHref: "",
  phoneDisplay: "",
  /**
   * Public + default form recipient. Prefer `CONTACT_RECIPIENT_OVERRIDE` in env.
   * Empty until a Rüegg inbox is confirmed — do not reuse Peisbutikken addresses.
   */
  email: "",
  /** Account «Kom med Forslag» — unused on Strategy A; keep empty. */
  suggestionsEmail: "",
  streetAddress: "Harestumoen 12",
  postalCode: "2743",
  addressLocality: "Harestua",
  addressCountry: "NO",
  addressDisplay: "Harestumoen 12, 2743 Harestua",
  orgNumberDisplay: "NO 929 766 989 MVA",
  vatID: "NO929766989MVA",
} as const;

export type SiteContactInfo = typeof SITE_CONTACT;

export function hasPublicPhone(): boolean {
  return Boolean(SITE_CONTACT.phoneHref && SITE_CONTACT.phoneDisplay);
}

export function hasPublicEmail(): boolean {
  return Boolean(SITE_CONTACT.email);
}
