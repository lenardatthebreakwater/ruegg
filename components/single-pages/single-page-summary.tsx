import Link from "next/link";
import { Flame } from "lucide-react";
import { EditorialAccentPill } from "@/components/editorial";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { SectionIntro } from "@/components/section-intro";
import { SimpleStaticPageShell } from "@/components/site/simple-static-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MotionPreset } from "@/components/ui/motion-preset";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { PAGE_SECTION_PY, SECTION_INTRO_BLOCK_MARGIN } from "@/lib/page-rhythm";
import type { SinglePageSummaryData } from "@/lib/data/single-pages";
import { SinglePageCardGrid } from "./single-page-card-grid";
import { SinglePageStructuredSections } from "./single-page-structured-sections";

type SinglePageSummaryProps = {
  data: SinglePageSummaryData;
  breadcrumbs?: BreadcrumbItem[];
};

export function SinglePageSummary({ data, breadcrumbs }: SinglePageSummaryProps) {
  return (
    <SimpleStaticPageShell breadcrumbs={breadcrumbs}>
      <section
        className={`${PAGE_SECTION_PY} border-b border-border bg-gradient-to-b from-primary/[0.05] to-transparent`}
      >
        <ContainedLayout as="div" className="flex flex-col gap-4">
          <MotionPreset
            className="flex justify-center"
            fade
            blur
            slide={{ direction: "up", offset: 24 }}
            transition={{ duration: 0.45 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/85 px-4 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm dark:bg-background/80">
              <Flame
                className="size-4 shrink-0 text-amber-600 dark:text-amber-500"
                aria-hidden
              />
              {data.heroBadge}
            </span>
          </MotionPreset>
          <MotionPreset
            fade
            blur
            slide={{ direction: "up", offset: 28 }}
            delay={0.08}
            transition={{ duration: 0.5 }}
          >
            <EditorialAccentPill className="mx-auto" />
            <SectionIntro
              heading="h1"
              size="hero"
              align="center"
              title={data.title}
              description={data.lead}
              className="pt-0 pb-0"
              descriptionClassName="mx-auto max-w-2xl"
            />
          </MotionPreset>
        </ContainedLayout>
      </section>

      <section className={PAGE_SECTION_PY}>
        <ContainedLayout as="div" className="flex flex-col gap-10">
          <MotionPreset
            className={SECTION_INTRO_BLOCK_MARGIN}
            fade
            blur
            slide={{ direction: "up", offset: 28 }}
            transition={{ duration: 0.45 }}
          >
            <SectionIntro
              title="Viktigst å vite"
              description="Her er hovedpunktene du trenger for å få rask oversikt."
              align="left"
              className="pt-0 pb-0"
            />
          </MotionPreset>
          <SinglePageCardGrid items={data.keyCards} />
          <SinglePageStructuredSections
            shippingSummary={data.shippingSummary}
            accordionSections={data.accordionSections}
            videos={data.videos}
          />
          {data.supportCard ? (
            <MotionPreset
              fade
              blur
              slide={{ direction: "up", offset: 32 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border border-border shadow-xs">
                <CardHeader>
                  <CardTitle>{data.supportCard.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {data.supportCard.description}
                  </p>
                  <Button asChild variant="ctaGlow">
                    <Link href={data.supportCard.ctaHref}>{data.supportCard.ctaLabel}</Link>
                  </Button>
                </CardContent>
              </Card>
            </MotionPreset>
          ) : null}
        </ContainedLayout>
      </section>
    </SimpleStaticPageShell>
  );
}
