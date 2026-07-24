/**
 * Stable form_id / form_name values for ContactForm placements.
 * Pushed on successful submit as `generate_lead` (and optional Stape twin).
 */
export const CONTACT_FORM_PLACEMENTS = {
  homepage: {
    formId: "kontakt-forside",
    formName: "Kontakt oss (forside)",
  },
  contactPage: {
    formId: "kontakt-oss",
    formName: "Kontakt oss",
  },
  productExpert: {
    formId: "spor-ekspert-produkt",
    formName: "Spør en ekspert (produkt)",
  },
  /** Category / brand / attribute archive JetEngine bottom CTAs. */
  archiveBottom: {
    formId: "spor-ekspert-arkiv",
    formName: "Spør en ekspert (arkiv)",
  },
  minPeisMontering: {
    formId: "min-peis-montering",
    formName: "Monteringshjelp (Min peis)",
  },
  /** My Account dashboard — product feedback / suggestions. */
  accountSuggestions: {
    formId: "komme-med-forslag",
    formName: "Kom med forslag (Min konto)",
  },
  /** Shared ContactSection on campaign / service / financing pages. */
  section: {
    formId: "kontakt-seksjon",
    formName: "Kontakt oss (seksjon)",
  },
} as const;
