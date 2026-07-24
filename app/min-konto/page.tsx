import type { Metadata } from "next";
import { AccountShell } from "@/components/account/account-shell";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildAccountBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Min konto",
    description: "Din konto hos Peisbutikken.",
    path: "/min-konto/",
    robots: { index: false, follow: false },
  });
}

export default async function MinKontoPage() {
  const pagePath = "/min-konto/";
  const breadcrumbs = buildAccountBreadcrumbs("Min konto");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <AccountShell />
      </SimpleStaticPageShell>
    </>
  );
}
