import type { Metadata } from "next";
import { PaymentMethodsList } from "@/components/account/payment-methods-list";
import { RequireAuth } from "@/components/account/require-auth";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildAccountBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Betalingsmetoder",
    description: "Se og administrer lagrede betalingsmetoder hos Peisbutikken.",
    path: "/min-konto/betalingsmetoder/",
    robots: { index: false, follow: false },
  });
}

export default function MinKontoBetalingsmetoderPage() {
  const pagePath = "/min-konto/betalingsmetoder/";
  const breadcrumbs = buildAccountBreadcrumbs("Betalingsmetoder");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <RequireAuth>
          <PaymentMethodsList />
        </RequireAuth>
      </SimpleStaticPageShell>
    </>
  );
}
