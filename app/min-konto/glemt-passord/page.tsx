import type { Metadata } from "next";
import Link from "next/link";
import { AccountAuthCard } from "@/components/account/account-auth-card";
import { AccountPageShell } from "@/components/account/account-page-shell";
import { ForgotPasswordForm } from "@/components/account/forgot-password-form";
import {
  EditorialEyebrow,
  EditorialHeading,
} from "@/components/editorial";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildAccountBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Glemt passord",
    description: "Be om lenke for å tilbakestille passordet ditt.",
    path: "/min-konto/glemt-passord/",
    robots: { index: false, follow: false },
  });
}

export default function GlemtPassordPage() {
  const pagePath = "/min-konto/glemt-passord/";
  const breadcrumbs = buildAccountBreadcrumbs("Glemt passord");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <AccountPageShell>
          <div className="space-y-2">
            <EditorialEyebrow>Min konto</EditorialEyebrow>
            <EditorialHeading size="account">Glemt passord</EditorialHeading>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Vi sender deg en lenke for å sette et nytt passord.
            </p>
          </div>
          <AccountAuthCard
            title="Tilbakestill via e-post"
            description="Skriv inn e-posten knyttet til kontoen din."
          >
            <ForgotPasswordForm />
            <p className="mt-5 text-sm text-muted-foreground">
              Tilbake til{" "}
              <Link
                href="/min-konto/"
                className="font-medium text-foreground underline underline-offset-4"
              >
                innlogging
              </Link>
              .
            </p>
          </AccountAuthCard>
        </AccountPageShell>
      </SimpleStaticPageShell>
    </>
  );
}
