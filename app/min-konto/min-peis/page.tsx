import type { Metadata } from "next";
import { MinPeisList } from "@/components/account/min-peis/min-peis-list";
import { RequireAuth } from "@/components/account/require-auth";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildAccountBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Min peis",
    description: "Se peisen din hos Peisbutikken.",
    path: "/min-konto/min-peis/",
    robots: { index: false, follow: false },
  });
}

export default function MinKontoMinPeisPage() {
  const pagePath = "/min-konto/min-peis/";
  const breadcrumbs = buildAccountBreadcrumbs("Min peis");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <RequireAuth maxWidth="full">
          <MinPeisList />
        </RequireAuth>
      </SimpleStaticPageShell>
    </>
  );
}
