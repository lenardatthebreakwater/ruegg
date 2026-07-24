"use client";

import ErrorPage02 from "@/components/shadcn-studio/blocks/error-page-02/error-page-02";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({ reset }: GlobalErrorPageProps) {
  return (
    <html lang="no">
      <body>
        <ErrorPage02
          eyebrow="Kritisk feil"
          title="Vi fikk ikke lastet siden"
          description="Prøv igjen eller gå tilbake til forsiden."
          primaryLabel="Til forsiden"
          primaryHref="/"
          secondaryLabel="Prøv igjen"
          onSecondaryClick={reset}
        />
      </body>
    </html>
  );
}
