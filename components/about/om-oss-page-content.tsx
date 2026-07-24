import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EditorialPageHeader } from "@/components/editorial/editorial-page-header";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";

type OmOssPageContentProps = {
  breadcrumbs: BreadcrumbItem[];
};

export function OmOssPageContent({ breadcrumbs }: OmOssPageContentProps) {
  return (
    <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
      <EditorialPageHeader
        eyebrow="Om Rüegg"
        title="Din peisproff siden 1955"
        description="Grunnlagt av Walter Rüegg — fra peisinnsatser til internasjonale premium peisløsninger."
        contentClassName="max-w-3xl"
      />

      <section className={PAGE_SECTION_PY}>
        <ContainedLayout as="div" className="max-w-3xl space-y-6 text-base leading-relaxed text-muted-foreground">
          <p>
            Rüegg startet produksjon av peisinnsatser i 1955 og har vokst til å bli en
            internasjonal aktør i premium peissegmentet. Selskapet er kjent for
            teknologier som Rüegg RIII (lukket forbrenningssystem) og miljøvennlige
            løsninger som oppfyller strenge europeiske utslippsstandarder.
          </p>
          <p>
            Hos oss finner du et unikt utvalg av smarte og moderne peiser, vedovner og
            peisinnsatser — med veiledning tilpasset ditt hjem og dine behov.
          </p>
        </ContainedLayout>
      </section>

      <section className={`${PAGE_SECTION_PY} border-t border-border bg-muted/30`}>
        <ContainedLayout as="div" className="max-w-3xl">
          <Card className="border-border/60 bg-background/80">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Klar for å finne riktig peis?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Se hele utvalget eller ta kontakt for personlig veiledning.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="ctaGlow">
                  <Link href="/shop/">
                    Utforsk peiser
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/kontakt-oss/">Kontakt oss</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </ContainedLayout>
      </section>
    </SimpleStaticPageShell>
  );
}
