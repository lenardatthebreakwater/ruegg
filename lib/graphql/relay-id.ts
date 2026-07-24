/**
 * Decode a WPGraphQL / WooCommerce Relay global ID to a numeric database ID.
 * Expects the usual base64 wire form (e.g. `btoa("post:123")`).
 */
export function decodeRelayDatabaseId(globalId: string): number | null {
  if (!globalId) return null;
  try {
    const decoded = atob(globalId);
    const match = decoded.match(/(\d+)/);
    if (!match) return null;
    const value = Number.parseInt(match[1], 10);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}
