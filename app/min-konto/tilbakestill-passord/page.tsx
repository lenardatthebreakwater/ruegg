import type { Metadata } from "next";
import Link from "next/link";
import { AccountAuthCard } from "@/components/account/account-auth-card";
import { AccountPageShell } from "@/components/account/account-page-shell";
import { ResetPasswordForm } from "@/components/account/reset-password-form";
import {
  EditorialEyebrow,
  EditorialHeading,
} from "@/components/editorial";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { buildAccountBreadcrumbs } from "@/lib/navigation/manual-breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/schema";

type ResetPasswordPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Tilbakestill passord",
    description: "Sett et nytt passord for kontoen din.",
    path: "/min-konto/tilbakestill-passord/",
    robots: { index: false, follow: false },
  });
}

function getParamValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function TilbakestillPassordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const login = getParamValue(searchParams?.login).trim();
  const keyToken = getParamValue(searchParams?.key).trim();
  const hasRequiredParams = Boolean(login && keyToken);
  const pagePath = "/min-konto/tilbakestill-passord/";
  const breadcrumbs = buildAccountBreadcrumbs("Tilbakestill passord");
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs, pagePath);

  return (
    <>
      <JsonLdScript data={breadcrumbSchema} />
      <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
        <AccountPageShell>
          <div className="space-y-2">
            <EditorialEyebrow>Min konto</EditorialEyebrow>
            <EditorialHeading size="account">Nytt passord</EditorialHeading>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Velg et trygt passord for kontoen din hos Peisbutikken.
            </p>
          </div>
          <AccountAuthCard
            title="Tilbakestill passord"
            description="Skriv inn nytt passord for kontoen din."
          >
            {hasRequiredParams ? (
              <ResetPasswordForm login={login} keyToken={keyToken} />
            ) : (
              <p className="text-sm text-destructive" role="alert">
                Lenken mangler nødvendig informasjon. Be om en ny
                tilbakestillingslenke.
              </p>
            )}
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
