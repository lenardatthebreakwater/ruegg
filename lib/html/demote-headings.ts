/**
 * Demotes CMS/WordPress heading levels in HTML so injected content does not
 * compete with the page H1 (and section H2s). Maps h1→h3 and h2→h3.
 * Preserves tag attributes. Intended for trusted HTML strings only.
 */
export function demoteHeadings(html: string): string {
  if (!html) return html;

  return html
    .replace(/<h1(\s[^>]*)?>/gi, "<h3$1>")
    .replace(/<\/h1>/gi, "</h3>")
    .replace(/<h2(\s[^>]*)?>/gi, "<h3$1>")
    .replace(/<\/h2>/gi, "</h3>");
}
