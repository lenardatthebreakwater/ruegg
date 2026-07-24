import type { Metadata } from "next";
import { OrdersList } from "@/components/account/orders-list";
import { RequireAuth } from "@/components/account/require-auth";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildAccountBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Ordrer",
    description: "Se ordrene dine hos Peisbutikken.",
    path: "/min-konto/ordrer/",
    robots: { index: false, follow: false },
  });
}

export default function MinKontoOrdrerPage() {
  const pagePath = "/min-konto/ordrer/";
  const breadcrumbs = buildAccountBreadcrumbs("Ordrer");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <RequireAuth>
          <OrdersList />
        </RequireAuth>
      </SimpleStaticPageShell>
    </>
  );
}
