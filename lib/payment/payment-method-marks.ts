export type PaymentMethodMark = {
  id: string
  name: string
  src: string
  /** Optional wordmark for dark backgrounds (e.g. Resurs, Google Pay). */
  srcDark?: string
  /**
   * Invert monochrome black wordmarks on dark surfaces (Apple Pay, Klarna).
   * Prefer `srcDark` when brand colors must stay intact.
   */
  invertOnDark?: boolean
  /**
   * Extra classes on the logo chip. Default chip is already transparent in dark
   * mode so marks sit on MetaRubric / card backgrounds without a black box.
   */
  chipClassName?: string
}

/** Local storefront payment marks under `/public/images/payment/`. */
export const PAYMENT_METHOD_MARKS: PaymentMethodMark[] = [
  {
    id: "visa",
    name: "Visa",
    src: "/images/payment/visa.svg",
    srcDark: "/images/payment/visa-dark.svg",
  },
  {
    id: "mastercard",
    name: "Mastercard",
    src: "/images/payment/mastercard.svg",
    srcDark: "/images/payment/mastercard-dark.svg",
  },
  {
    id: "amex",
    name: "American Express",
    src: "/images/payment/amex.svg",
    srcDark: "/images/payment/amex-dark.svg",
  },
  // Vipps orange wordmark stays readable on dark MetaRubric as-is.
  { id: "vipps", name: "Vipps", src: "/images/payment/vipps.svg" },
  {
    id: "klarna",
    name: "Klarna",
    src: "/images/payment/klarna.svg",
    invertOnDark: true,
  },
  {
    id: "apple-pay",
    name: "Apple Pay",
    src: "/images/payment/apple-pay.svg",
    invertOnDark: true,
  },
  {
    id: "google-pay",
    name: "Google Pay",
    src: "/images/payment/google-pay.svg",
    srcDark: "/images/payment/google-pay-dark.svg",
  },
  {
    id: "resurs",
    name: "Resurs Bank",
    src: "/images/payment/resurs.svg",
    srcDark: "/images/payment/resurs-dark.svg",
  },
]

const MARK_BY_ID = new Map(
  PAYMENT_METHOD_MARKS.map((mark) => [mark.id, mark] as const)
)

type PaymentMethodMatcher = {
  /** One or more mark ids (generic card uses Visa + Mastercard). */
  ids: string[]
  test: (normalizedTitle: string) => boolean
}

/** More specific matchers first (wallet names before generic card brands). */
const PAYMENT_METHOD_MATCHERS: PaymentMethodMatcher[] = [
  {
    ids: ["google-pay"],
    test: (s) => s.includes("google pay") || s.includes("googlepay"),
  },
  {
    ids: ["apple-pay"],
    test: (s) => s.includes("apple pay") || s.includes("applepay"),
  },
  { ids: ["vipps"], test: (s) => s.includes("vipps") },
  { ids: ["klarna"], test: (s) => s.includes("klarna") },
  {
    ids: ["resurs"],
    // Woo titles vary: "Resurs Bank", "24MND Delbetaling", "Delbetaling …"
    test: (s) =>
      s.includes("resurs") ||
      s.includes("delbetaling") ||
      s.includes("24mnd") ||
      /\b24\s*mnd\b/.test(s) ||
      /\b24\s*måneder\b/.test(s),
  },
  {
    ids: ["amex"],
    test: (s) => s.includes("american express") || s.includes("amex"),
  },
  {
    ids: ["mastercard"],
    test: (s) => s.includes("mastercard") || s.includes("master card"),
  },
  { ids: ["visa"], test: (s) => /\bvisa\b/.test(s) },
  // No generic-card SVG in /images/payment — reuse Visa + Mastercard.
  {
    ids: ["visa", "mastercard"],
    test: (s) =>
      s.includes("credit card") ||
      s.includes("creditcard") ||
      s.includes("kredittkort") ||
      // Compound NO titles like "Betalingskort" — `\bkort\b` does not match.
      s.includes("betalingskort") ||
      s.includes("stripe") ||
      /\bcard\b/.test(s) ||
      /\bkort\b/.test(s),
  },
]

function marksForIds(ids: string[]): PaymentMethodMark[] {
  const marks: PaymentMethodMark[] = []
  for (const id of ids) {
    const mark = MARK_BY_ID.get(id)
    if (mark) marks.push(mark)
  }
  return marks
}

/**
 * Map a WooCommerce payment method title (or similar label) to local mark(s).
 * Returns an empty array when unknown — callers should fall back to text-only.
 */
export function resolvePaymentMethodMarks(
  title: string | null | undefined
): PaymentMethodMark[] {
  const normalized = title?.trim().toLowerCase()
  if (!normalized) return []

  for (const matcher of PAYMENT_METHOD_MATCHERS) {
    if (matcher.test(normalized)) {
      return marksForIds(matcher.ids)
    }
  }

  return []
}

/**
 * Map a WooCommerce payment method title to a single local mark.
 * Returns null when unknown — callers should fall back to text-only.
 */
export function resolvePaymentMethodMark(
  title: string | null | undefined
): PaymentMethodMark | null {
  return resolvePaymentMethodMarks(title)[0] ?? null
}

/**
 * Customer-facing payment method title (display only).
 * Normalizes all Vipps family titles to the brand name "Vipps".
 */
export function displayPaymentMethodTitle(
  title: string | null | undefined
): string {
  const trimmed = title?.trim() ?? ""
  if (!trimmed) return ""

  const marks = resolvePaymentMethodMarks(trimmed)
  if (marks.some((mark) => mark.id === "vipps")) {
    return MARK_BY_ID.get("vipps")!.name
  }

  return trimmed
}
