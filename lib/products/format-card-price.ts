/**
 * Compact listing price: Woo variable products often return a min–max string
 * (e.g. "kr 41 905 – kr 54 990"). Cards use "Fra {min}" to avoid wrapping.
 * Product detail pages should keep the full range.
 */
export function formatCardPrice(price: string | null | undefined): string {
  if (!price) return "";

  const cleaned = price
    .replace(/\u00a0/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  const rangeParts = cleaned.split(/\s*[–—−]\s*|\s+-\s+/);
  if (rangeParts.length < 2) return cleaned;

  const minPart = rangeParts[0]?.trim();
  if (!minPart) return cleaned;

  if (/^fra\b/i.test(minPart)) {
    return minPart.replace(/^fra\b/i, "Fra");
  }

  return `Fra ${minPart}`;
}
