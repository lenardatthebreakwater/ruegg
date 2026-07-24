export const RESURS_TERM_MONTHS = 24;
export const RESURS_FIXED_MONTHLY_FEE = 79;

export function calculateResursMonthlyAmount(priceNumeric: number | null | undefined): number | null {
  if (typeof priceNumeric !== "number" || !Number.isFinite(priceNumeric) || priceNumeric <= 0) {
    return null;
  }

  return Math.round(priceNumeric / RESURS_TERM_MONTHS + RESURS_FIXED_MONTHLY_FEE);
}

export function formatResursMonthlyLabel(monthlyAmount: number): string {
  const formatted = monthlyAmount.toLocaleString("nb-NO");
  return `kr ${formatted}/mnd i ${RESURS_TERM_MONTHS} måneder`;
}
