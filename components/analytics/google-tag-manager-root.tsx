"use client";

import { GoogleTagManager } from "@next/third-parties/google";
import { ConsentModeHydration } from "@/components/analytics/consent-mode-hydration";
import { GtmRouteChange } from "@/components/analytics/gtm-route-change";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
/** Stape Custom Loader script URL without query (e.g. …/cartdata/….js). */
const gtmScriptBase = process.env.NEXT_PUBLIC_GTM_SCRIPT_URL?.trim();
/**
 * Query string for the loader script (no leading `?`). Newer Stape snippets use a
 * token (e.g. `bjb6j=...`) instead of the raw container id. If unset, falls back
 * to `NEXT_PUBLIC_GTM_ID` so `?GTM-…` still works for older Stape output.
 */
const gtmScriptQuery = process.env.NEXT_PUBLIC_GTM_SCRIPT_QUERY?.trim();
/** Stape noscript page, without query (e.g. https://data.example.com/ns.html). */
const gtmNoscriptPage = process.env.NEXT_PUBLIC_GTM_NOSCRIPT_URL?.trim();

/**
 * GTM + consent hydration. Container ID: `NEXT_PUBLIC_GTM_ID`.
 *
 * **Stape (production):** set `NEXT_PUBLIC_GTM_SCRIPT_URL` to the Custom Loader
 * script path (no `?`), optional `NEXT_PUBLIC_GTM_SCRIPT_QUERY` to the exact
 * query string from the Stape snippet (token form), and `NEXT_PUBLIC_GTM_NOSCRIPT_URL`
 * for `ns.html` (no `?`). The noscript iframe still uses `?id={GTM-ID}`.
 *
 * If `NEXT_PUBLIC_GTM_SCRIPT_URL` is omitted, the default Google host
 * (`googletagmanager.com/gtm.js` + `?id=`) is used for the script only.
 *
 * GTM workspace (manual, in tagmanager.google.com):
 * - Add a GA4 Configuration tag (or Google tag) with Measurement ID `G-XXXXXXXX`.
 * - In Admin → Container → Consent Settings, use Consent Overview; require
 *   `analytics_storage` for the GA4 tag.
 * - Optional: trigger on Custom Event `pb_search_event` (already pushed from
 *   `trackSearchBiEvent` in lib/search/search-history.ts) and map fields to a GA4 event.
 * - Ecommerce: GA4 Event tags for `view_item`, `view_item_list`, `add_to_cart`,
 *   `remove_from_cart`, `view_cart`, `begin_checkout` — Data Layer variables
 *   `ecommerce.items`, `ecommerce.value`, `ecommerce.currency` (see
 *   `pushGa4EcommerceEvent` in lib/analytics/push-ga4-ecommerce-event.ts). The same
 *   helper also pushes Stape trigger names (`add_to_cart_stape`, etc., default suffix
 *   `_stape`; override with `NEXT_PUBLIC_GTM_STAPE_EVENT_SUFFIX`). Do not keep a
 *   legacy regex GA4 ecommerce tag and Stape GA4 tags both enabled or you double-count.
 *   Requires statistics cookie consent.
 * - Leads: Custom Event `generate_lead` (and `generate_lead_stape`) from
 *   `pushGenerateLeadEvent` after successful ContactForm submit, and from
 *   `pushContactClickEvent` on `tel:` / `mailto:` (`method`: phone|email,
 *   `form_id`: click-to-call|click-to-email). Form Data Layer: `form_id`,
 *   `form_name`, page fields, optional `product_name`. Placement IDs:
 *   `lib/analytics/contact-form-placements.ts`. Prefer Custom Event over a
 *   GTM Form Submission trigger — forms use fetch + preventDefault.
 * - Marketing CTAs: Custom Event `select_content` (`content_type`, `content_id`,
 *   `link_url`, `link_text`) via `TrackedCtaLink` / `pushSelectContentEvent`.
 * - Auth: Custom Event `login` / `sign_up` (`method`) on Min konto success.
 * - List clicks: ecommerce `select_item` (+ `view_item_list` on carousels).
 * - Search BI: `pb_search_event` only with statistics consent.
 * - Purchase: configure on WordPress thank-you / GTM (checkout leaves this app).
 * - Do not add a duplicate History Change page_view if you rely on `GtmRouteChange`.
 * - Stape: ecommerce + lead/select_content/auth twins use `*_stape` by default;
 *   if the web container uses a single "Ecommerce events" regex tag, add separate
 *   GA4 Event tags for `generate_lead`, `select_content`, `login`, `sign_up`
 *   (and optional `*_stape`) so they are not dropped as non-ecommerce.
 */
export function GoogleTagManagerRoot() {
  const loaderQuery =
    gtmScriptQuery && gtmScriptQuery.length > 0 ? gtmScriptQuery : gtmId;
  const stapeScriptUrl =
    gtmScriptBase && loaderQuery
      ? `${gtmScriptBase.replace(/\/$/, "")}?${loaderQuery}`
      : undefined;

  return (
    <>
      {gtmId ? (
        <>
          <noscript>
            <iframe
              src={
                gtmNoscriptPage
                  ? `${gtmNoscriptPage.replace(/\/$/, "")}?id=${encodeURIComponent(gtmId)}`
                  : `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`
              }
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
          {stapeScriptUrl ? (
            <GoogleTagManager gtmScriptUrl={stapeScriptUrl} />
          ) : (
            <GoogleTagManager gtmId={gtmId} />
          )}
          <GtmRouteChange />
        </>
      ) : null}
      <ConsentModeHydration />
    </>
  );
}
