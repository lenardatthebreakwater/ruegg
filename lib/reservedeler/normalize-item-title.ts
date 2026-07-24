const RESERVED_TERM_WORDS = /\b(reservedeler|deler)\b/gi;

export function normalizeReservedelerItemTitle(rawTitle: string): string {
  const trimmed = rawTitle.trim();
  if (!trimmed) return "";

  const stripped = trimmed
    .replace(RESERVED_TERM_WORDS, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*[-/]\s*$/g, "")
    .trim();

  return stripped || trimmed;
}
