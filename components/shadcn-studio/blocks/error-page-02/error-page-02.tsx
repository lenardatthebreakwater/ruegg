import Link from "next/link";
import Error02Illustration from "@/assets/svg/error-02-illustration";
import { EditorialHeading } from "@/components/editorial";
import { Button } from "@/components/ui/button";

type ErrorPage02Props = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref?: string;
  onPrimaryClick?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondaryClick?: () => void;
};

function ErrorPage02({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryHref,
  onPrimaryClick,
  secondaryLabel,
  secondaryHref,
  onSecondaryClick,
}: ErrorPage02Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12 px-8 py-8 sm:py-16 lg:py-24">
      <Error02Illustration className="h-[clamp(300px,50vh,500px)] max-sm:h-75" />

      <div className="max-w-2xl text-center">
        {eyebrow ? <p className="mb-2 text-base font-medium text-muted-foreground">{eyebrow}</p> : null}
        <EditorialHeading size="page" className="mb-3">
          {title}
        </EditorialHeading>
        <p className="mb-6 text-muted-foreground">{description}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryHref ? (
            <Button size="lg" className="rounded-lg text-base" asChild>
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
          ) : (
            <Button size="lg" className="rounded-lg text-base" onClick={onPrimaryClick}>
              {primaryLabel}
            </Button>
          )}

          {secondaryLabel && secondaryHref ? (
            <Button variant="outline" size="lg" className="rounded-lg text-base" asChild>
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : secondaryLabel ? (
            <Button variant="outline" size="lg" className="rounded-lg text-base" onClick={onSecondaryClick}>
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ErrorPage02;
