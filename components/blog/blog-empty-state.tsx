import Link from "next/link";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";

export function BlogEmptyState() {
  return (
    <section className={PAGE_SECTION_PY}>
      <ContainedLayout>
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Flame className="size-6" aria-hidden />
          </span>
          <div>
            <p className="font-display text-xl font-semibold tracking-tight text-foreground">
              Ingen artikler i denne kategorien ennå
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Prøv en annen kategori, eller se alle artiklene våre.
            </p>
          </div>
          <Button asChild variant="redOutline" className="mt-1">
            <Link href="/blog/">Se alle artikler</Link>
          </Button>
        </div>
      </ContainedLayout>
    </section>
  );
}
