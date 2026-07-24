import { CONSENT_MODE_DEFAULTS } from "@/lib/analytics/consent-mode-map";

/**
 * Inline script in the initial HTML so Consent Mode defaults run before GTM scripts
 * (client `GoogleTagManager`) load. Server Component — no `next/script` needed.
 */
export function ConsentModeBootstrap() {
  const consentJson = JSON.stringify(CONSENT_MODE_DEFAULTS);

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', ${consentJson});
`,
      }}
    />
  );
}
