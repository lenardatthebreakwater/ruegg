const DEFAULT_STAPE_EVENT_SUFFIX = "_stape";

/**
 * Suffix for a second `dataLayer` `event` so Stape GTM tags can use Custom Event
 * triggers (e.g. `add_to_cart_stape`). If `NEXT_PUBLIC_GTM_STAPE_EVENT_SUFFIX` is
 * unset, defaults to `_stape`. If set to an empty value (e.g. `=`), no duplicate
 * event is pushed.
 */
export function getStapeEventSuffix(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GTM_STAPE_EVENT_SUFFIX;
  if (fromEnv === undefined) return DEFAULT_STAPE_EVENT_SUFFIX;
  return fromEnv.trim();
}

export function toStapeEventName(ga4Event: string, suffix: string): string | null {
  if (suffix.length === 0) return null;
  if (ga4Event.endsWith(suffix)) return null;
  return `${ga4Event}${suffix}`;
}
