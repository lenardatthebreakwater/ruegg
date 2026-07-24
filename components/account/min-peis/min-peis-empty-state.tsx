import Link from "next/link";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildReservedelerHref } from "@/lib/products/paths";

export function MinPeisEmptyState() {
  return (
    <div className="flex flex-col items-start gap-5 py-2">
      <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Flame className="size-6" aria-hidden />
      </span>
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-foreground">
          Ingen peis registrert ennå
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Når du har fullført en bestilling med peis eller ovn, dukker den opp
          her — med tilbehør, dokumenter og tips til videre bruk.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/shop/">Utforsk peiser</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={buildReservedelerHref()}>Reservedeler</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/kontakt-oss/">Kontakt oss</Link>
        </Button>
      </div>
    </div>
  );
}
