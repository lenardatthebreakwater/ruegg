import type { Metadata } from "next";
import { AddressesForm } from "@/components/account/addresses-form";
import { RequireAuth } from "@/components/account/require-auth";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildAccountBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Adresser",
    description: "Administrer faktura- og leveringsadresse hos Peisbutikken.",
    path: "/min-konto/adresser/",
    robots: { index: false, follow: false },
  });
}

export default function MinKontoAdresserPage() {
  const pagePath = "/min-konto/adresser/";
  const breadcrumbs = buildAccountBreadcrumbs("Adresser");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <RequireAuth>
          <AddressesForm />
        </RequireAuth>
      </SimpleStaticPageShell>
    </>
  );
}
