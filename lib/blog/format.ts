const nbDateFormatter = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Formats an ISO date as Norwegian long date, e.g. "9. april 2025". */
export function formatBlogDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return null;
  return nbDateFormatter.format(new Date(time));
}

export function formatReadingTime(minutes: number): string {
  const value = Math.max(1, Math.round(minutes));
  return `${value} min lesing`;
}

/** Meta line pieces joined with a single middle dot (max two parts). */
export function joinBlogMeta(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");
}
