"use client";

// TODO: wire error reporting (Sentry / Workers Observability)
import ErrorPage02 from "@/components/shadcn-studio/blocks/error-page-02/error-page-02";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <ErrorPage02
      eyebrow="Noe gikk galt"
      title="En uventet feil oppstod"
      description="Prøv igjen. Hvis feilen fortsetter kan du gå tilbake til forsiden."
      primaryLabel="Til forsiden"
      primaryHref="/"
      secondaryLabel="Prøv igjen"
      onSecondaryClick={reset}
    />
  );
}
