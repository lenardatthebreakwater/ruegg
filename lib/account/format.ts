/** WooCommerce omits the country line for Norway on storefront addresses. */
const NORWAY_COUNTRY_VALUES = new Set(["no", "norge", "norway"]);

export function isNorwayCountry(value: string | null | undefined): boolean {
  if (!value) return false;
  return NORWAY_COUNTRY_VALUES.has(value.trim().toLowerCase());
}

/**
 * Country line for account address displays.
 * Returns null for Norway (match WooCommerce); otherwise the trimmed country value.
 */
export function formatAccountAddressCountry(
  value: string | null | undefined
): string | null {
  if (!value?.trim()) return null;
  if (isNorwayCountry(value)) return null;
  return value.trim();
}

type AccountAddressLinesInput = {
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  postcode?: string | null;
  city?: string | null;
  country?: string | null;
  email?: string | null;
  phone?: string | null;
};

/** Display lines for billing/shipping address blocks (order detail, etc.). */
export function formatAccountAddressLines(
  address: AccountAddressLinesInput
): string[] {
  const name = [address.firstName, address.lastName].filter(Boolean).join(" ");
  return [
    name,
    address.address1,
    address.address2,
    [address.postcode, address.city].filter(Boolean).join(" "),
    formatAccountAddressCountry(address.country),
    address.email,
    address.phone,
  ].filter((line): line is string => Boolean(line && line.trim()));
}

export function formatOrderDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Date + time for order timeline events (Norwegian locale). */
export function formatOrderDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatOrderMoney(value: string | null | undefined): string {
  if (value == null || value === "") return "—";

  // WooCommerce / GraphQL may return HTML-formatted money, e.g. "kr&nbsp;159".
  const decoded = value
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/g, " ")
    .replace(/&amp;/gi, "&")
    .trim();

  const numericCandidate = decoded
    .replace(/[^\d,.\s-]/g, "")
    .replace(/\s/g, "")
    .replace(",", ".");
  const amount = Number.parseFloat(numericCandidate);

  if (!Number.isFinite(amount)) {
    return decoded.includes("kr") ? decoded : `${decoded} kr`;
  }

  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(amount);
}
