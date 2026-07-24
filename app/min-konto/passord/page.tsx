import type { Metadata } from "next";
import { ChangePasswordPanel } from "@/components/account/change-password-panel";
import { RequireAuth } from "@/components/account/require-auth";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildAccountBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Endre passord",
    description: "Endre passordet på kontoen din hos Peisbutikken.",
    path: "/min-konto/passord/",
    robots: { index: false, follow: false },
  });
}

export default function MinKontoPassordPage() {
  const pagePath = "/min-konto/passord/";
  const breadcrumbs = buildAccountBreadcrumbs("Endre passord");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <RequireAuth>
          <ChangePasswordPanel />
        </RequireAuth>
      </SimpleStaticPageShell>
    </>
  );
}
