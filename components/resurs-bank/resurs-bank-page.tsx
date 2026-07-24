import { ContactSection } from "@/components/homepage/contact-section";
import { PageBreadcrumbs } from "@/components/site/page-breadcrumbs";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import { SectionIntro } from "@/components/section-intro";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { ServiceHeroSection } from "@/components/service-pages/service-hero-section";
import { SinglePageCardGrid } from "@/components/single-pages/single-page-card-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MotionPreset } from "@/components/ui/motion-preset";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import {
  resursBankEksemplerDisclaimer,
  resursBankEksemplerSection,
  resursBankEksempelCards,
  resursBankFordelerCards,
  resursBankFordelerSection,
  resursBankHero,
  resursBankIntroSections,
  resursBankOmSection,
  resursBankSoknadSection,
  resursBankSoknadSteps,
  resursBankViktigCards,
  resursBankViktigSection,
} from "@/lib/data/resurs-bank-page";
import {
  PAGE_SECTION_PY,
  SECTION_INTRO_BLOCK_MARGIN,
} from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";
import { ResursApplicationTrustBanner } from "./resurs-application-trust-banner";
import { ResursRichParagraph } from "./resurs-article-sections";

type ResursBankPageProps = {
  breadcrumbs?: BreadcrumbItem[];
};

export function ResursBankPage({ breadcrumbs }: ResursBankPageProps) {
  return (
    <StorefrontPageShell>
      <PageBreadcrumbs items={breadcrumbs} />
      <main className="flex flex-1 flex-col">
        <ServiceHeroSection hero={resursBankHero} />

        {resursBankIntroSections.map((section) => (
          <section
            key={section.id}
            className={`${PAGE_SECTION_PY} border-b border-border`}
          >
            <ContainedLayout as="div">
              <MotionPreset
                className={SECTION_INTRO_BLOCK_MARGIN}
                fade
                blur
                slide={{ direction: "up", offset: 28 }}
                transition={{ duration: 0.45 }}
              >
                <SectionIntro
                  title={section.title}
                  description={
                    <>
                      {section.paragraphs.map((paragraph, pi) => (
                        <ResursRichParagraph key={pi} segments={paragraph} />
                      ))}
                    </>
                  }
                  align="left"
                  heading="h2"
                  className="max-w-none pt-0 pb-0"
                  descriptionClassName="max-w-none [&_p+p]:mt-4"
                />
              </MotionPreset>
            </ContainedLayout>
          </section>
        ))}

        <section className={`${PAGE_SECTION_PY} border-b border-border`}>
          <ContainedLayout as="div" className="flex flex-col gap-10">
            <MotionPreset
              className={SECTION_INTRO_BLOCK_MARGIN}
              fade
              blur
              slide={{ direction: "up", offset: 28 }}
              transition={{ duration: 0.45 }}
            >
              <SectionIntro
                title={resursBankFordelerSection.title}
                description={resursBankFordelerSection.description}
                align="left"
                heading="h2"
                className="max-w-none pt-0 pb-0"
                descriptionClassName="max-w-none"
              />
            </MotionPreset>
            <SinglePageCardGrid items={resursBankFordelerCards} />
          </ContainedLayout>
        </section>

        <section className={`${PAGE_SECTION_PY} border-b border-border`}>
          <ContainedLayout as="div" className="flex flex-col gap-10">
            <MotionPreset
              className={SECTION_INTRO_BLOCK_MARGIN}
              fade
              blur
              slide={{ direction: "up", offset: 28 }}
              transition={{ duration: 0.45 }}
            >
              <SectionIntro
                title={resursBankEksemplerSection.title}
                description={resursBankEksemplerSection.description}
                align="left"
                heading="h2"
                className="max-w-none pt-0 pb-0"
                descriptionClassName="max-w-none"
              />
            </MotionPreset>
            <div className="grid gap-5 lg:grid-cols-3">
              {resursBankEksempelCards.map((card, index) => (
                <MotionPreset
                  key={card.id}
                  className="h-full"
                  fade
                  blur
                  slide={{ direction: "up", offset: 28 }}
                  delay={index * 0.07}
                  transition={{ duration: 0.45 }}
                >
                  <Card className="h-full border border-border shadow-xs">
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
                        {card.lines.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </MotionPreset>
              ))}
            </div>
            <p className="text-sm italic text-muted-foreground">
              {resursBankEksemplerDisclaimer}
            </p>
          </ContainedLayout>
        </section>

        <section className={`${PAGE_SECTION_PY} border-b border-border`}>
          <ContainedLayout as="div" className="flex flex-col gap-10">
            <MotionPreset
              className={SECTION_INTRO_BLOCK_MARGIN}
              fade
              blur
              slide={{ direction: "up", offset: 28 }}
              transition={{ duration: 0.45 }}
            >
              <SectionIntro
                title={resursBankSoknadSection.title}
                description={resursBankSoknadSection.description}
                align="left"
                heading="h2"
                className="max-w-none pt-0 pb-0"
                descriptionClassName="max-w-none"
              />
            </MotionPreset>
            <ResursApplicationTrustBanner steps={resursBankSoknadSteps} embedded />
          </ContainedLayout>
        </section>

        <section className={cn(PAGE_SECTION_PY, "border-b border-border")}>
          <ContainedLayout as="div" className="flex flex-col gap-10">
            <MotionPreset
              className={SECTION_INTRO_BLOCK_MARGIN}
              fade
              blur
              slide={{ direction: "up", offset: 28 }}
              transition={{ duration: 0.45 }}
            >
              <SectionIntro
                title={resursBankViktigSection.title}
                description={resursBankViktigSection.description}
                align="left"
                heading="h2"
                className="max-w-none pt-0 pb-0"
                descriptionClassName="max-w-none"
              />
            </MotionPreset>
            <SinglePageCardGrid items={resursBankViktigCards} />
          </ContainedLayout>
        </section>

        <section className={`${PAGE_SECTION_PY} border-b border-border`}>
          <ContainedLayout as="div">
            <MotionPreset
              className={SECTION_INTRO_BLOCK_MARGIN}
              fade
              blur
              slide={{ direction: "up", offset: 28 }}
              transition={{ duration: 0.45 }}
            >
              <SectionIntro
                title={resursBankOmSection.title}
                description={
                  <>
                    {resursBankOmSection.paragraphs.map((paragraph, pi) => (
                      <ResursRichParagraph key={pi} segments={paragraph} />
                    ))}
                  </>
                }
                align="left"
                heading="h2"
                className="max-w-none pt-0 pb-0"
                descriptionClassName="max-w-none [&_p+p]:mt-4"
              />
            </MotionPreset>
          </ContainedLayout>
        </section>

        <ContactSection />
      </main>
    </StorefrontPageShell>
  );
}
