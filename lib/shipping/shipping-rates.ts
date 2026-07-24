/**
 * Canonical shipping rate table for Peisbutikken (source of truth).
 * Used by both the /fraktbetingelser page and the schema.org
 * OfferShippingDetails on product pages — keep prices only here.
 */

export type HomeDeliveryWeightBracket = "w35to199" | "w200to499" | "w500to599";

export type HomeDeliveryZone = {
  fromPostcode: string;
  toPostcode: string;
  rateByBracketNok: Record<HomeDeliveryWeightBracket, number>;
};

/** Home delivery (35–599 kg) by postcode zone, prices in NOK incl. VAT. */
export const HOME_DELIVERY_ZONES: readonly HomeDeliveryZone[] = [
  {
    fromPostcode: "0000",
    toPostcode: "1499",
    rateByBracketNok: { w35to199: 1095, w200to499: 1545, w500to599: 1790 },
  },
  {
    fromPostcode: "1500",
    toPostcode: "2299",
    rateByBracketNok: { w35to199: 1145, w200to499: 1695, w500to599: 1890 },
  },
  {
    fromPostcode: "2300",
    toPostcode: "2999",
    rateByBracketNok: { w35to199: 1245, w200to499: 1795, w500to599: 2145 },
  },
  {
    fromPostcode: "3000",
    toPostcode: "3999",
    rateByBracketNok: { w35to199: 1445, w200to499: 2095, w500to599: 2390 },
  },
  {
    fromPostcode: "4000",
    toPostcode: "7499",
    rateByBracketNok: { w35to199: 1545, w200to499: 2395, w500to599: 2890 },
  },
  {
    fromPostcode: "7500",
    toPostcode: "9499",
    rateByBracketNok: { w35to199: 2045, w200to499: 3295, w500to599: 3890 },
  },
  {
    fromPostcode: "9500",
    toPostcode: "9999",
    rateByBracketNok: { w35to199: 2345, w200to499: 3795, w500to599: 4590 },
  },
] as const;

export type SmallPackageBracket = {
  /** Display label as shown on /fraktbetingelser */
  label: string;
  /** Upper bound (inclusive) in kg */
  maxKg: number;
  priceNok: number;
};

/** Small packages (< 35 kg) via Postnord, nationwide flat rates in NOK. */
export const SMALL_PACKAGE_BRACKETS: readonly SmallPackageBracket[] = [
  { label: "0-1 kg", maxKg: 1, priceNok: 99 },
  { label: "2-9 kg", maxKg: 9, priceNok: 149 },
  { label: "10-19 kg", maxKg: 19, priceNok: 199 },
  { label: "20-35 kg", maxKg: 35, priceNok: 289 },
] as const;

export const SMALL_PACKAGE_MAX_KG = 35;
/** Above this weight, delivery is quoted individually (by agreement). */
export const HOME_DELIVERY_MAX_KG = 599;

/** Home delivery: normally 5–21 days after registered payment. */
export const HOME_DELIVERY_TRANSIT_DAYS = { min: 5, max: 21 } as const;
/** Small packages ship within 2 business days after payment. */
export const SMALL_PACKAGE_HANDLING_DAYS = { min: 0, max: 2 } as const;

export function resolveHomeDeliveryBracket(
  weightKg: number
): HomeDeliveryWeightBracket | null {
  if (weightKg > SMALL_PACKAGE_MAX_KG && weightKg <= 199) return "w35to199";
  if (weightKg > 199 && weightKg <= 499) return "w200to499";
  if (weightKg > 499 && weightKg <= HOME_DELIVERY_MAX_KG) return "w500to599";
  return null;
}

export function resolveSmallPackagePriceNok(weightKg: number): number | null {
  if (weightKg <= 0) return null;
  const bracket = SMALL_PACKAGE_BRACKETS.find((b) => weightKg <= b.maxKg);
  return bracket?.priceNok ?? null;
}

/** Formats 1095 as "1 095 kr" (matches the /fraktbetingelser table style). */
export function formatNok(value: number): string {
  const grouped = value
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} kr`;
}
