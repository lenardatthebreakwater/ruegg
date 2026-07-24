import Link from "next/link";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildReservedelerHref } from "@/lib/products/paths";

type MinPeisReservedelerEmptyProps = {
  peisName: string;
  /** Optional deep link when a catalog model matched but no parts loaded. */
  storefrontItemHref?: string | null;
};

export function MinPeisReservedelerEmpty({
  peisName,
  storefrontItemHref,
}: MinPeisReservedelerEmptyProps) {
  return (
    <div className="flex flex-col items-start gap-5 rounded-xl border border-border/70 px-4 py-6 sm:px-5">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Wrench className="size-6" aria-hidden />
      </span>
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-foreground">
          Ingen reservedeler funnet
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Vi fant dessverre ingen reservedeler som matcher {peisName} akkurat
          nå. Du kan søke i hele reservedeler-katalogen, eller ta kontakt så
          hjelper vi deg videre.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={storefrontItemHref || buildReservedelerHref()}>
            {storefrontItemHref
              ? "Åpne i reservedeler"
              : "Se alle reservedeler"}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/kontakt-oss/">Kontakt oss</Link>
        </Button>
      </div>
    </div>
  );
}
