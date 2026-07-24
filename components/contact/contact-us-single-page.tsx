import type { ComponentType } from "react";
import {
  Flame,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  type LucideProps,
} from "lucide-react";
import { ContactCardCtaLink } from "@/components/analytics/contact-card-cta-link";
import { EditorialAccentPill } from "@/components/editorial";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { PageBreadcrumbs } from "@/components/site/page-breadcrumbs";
import { StorefrontPageShell } from "@/components/site/storefront-page-shell";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { SectionIntro } from "@/components/section-intro";
import { ContactForm } from "@/components/shadcn-studio/blocks/contact-us-page-15/contact-form";
import { MotionPreset } from "@/components/ui/motion-preset";
import { IconBadge } from "@/components/ui/icon-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CONTACT_FORM_PLACEMENTS } from "@/lib/analytics/contact-form-placements";
import {
  hasPublicEmail,
  hasPublicPhone,
  SITE_CONTACT,
} from "@/lib/site-contact";

type IconComponent = ComponentType<LucideProps>;

type ContactInfoCard = {
  icon: IconComponent;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
};

function buildContactInfoCards(): ContactInfoCard[] {
  const cards: ContactInfoCard[] = [];

  if (hasPublicPhone()) {
    cards.push({
      icon: PhoneIcon,
      title: "Ring oss",
      description: "Vi hjelper deg gjerne på telefon",
      ctaText: SITE_CONTACT.phoneDisplay,
      ctaLink: `tel:${SITE_CONTACT.phoneHref}`,
    });
  }

  if (hasPublicEmail()) {
    cards.push({
      icon: MailIcon,
      title: "Send e-post",
      description: "Vi svarer vanligvis innen 1 virkedag",
      ctaText: SITE_CONTACT.email,
      ctaLink: `mailto:${SITE_CONTACT.email}`,
    });
  }

  cards.push({
    icon: MapPinIcon,
    title: "Adresse",
    description: SITE_CONTACT.addressDisplay,
    ctaText: "Se i Google Maps",
    ctaLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_CONTACT.addressDisplay)}`,
  });

  cards.push({
    icon: MailIcon,
    title: "Kontaktskjema",
    description: "Fyll ut skjemaet — vi tar kontakt så fort vi kan.",
    ctaText: "Gå til skjema",
    ctaLink: "#kontakt-skjema",
  });

  return cards;
}

type ContactUsSinglePageProps = {
  breadcrumbs?: BreadcrumbItem[];
};

export function ContactUsSinglePage({ breadcrumbs }: ContactUsSinglePageProps) {
  const contactInfoCards = buildContactInfoCards();
  const mapsEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(SITE_CONTACT.addressDisplay)}&z=15&hl=no&output=embed`;

  return (
    <StorefrontPageShell>
      <PageBreadcrumbs items={breadcrumbs} />
      <main className="flex flex-1 flex-col">
        <section className="border-b border-border bg-gradient-to-b from-primary/[0.05] to-transparent py-12 md:py-16">
          <ContainedLayout as="div">
            <MotionPreset
              className="mx-auto max-w-3xl"
              fade
              blur
              slide={{ direction: "up", offset: 24 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/85 px-4 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm dark:bg-background/80">
                  <Flame
                    className="size-4 shrink-0 text-amber-600 dark:text-amber-500"
                    aria-hidden
                  />
                  <span>Ta kontakt med Rüegg</span>
                </span>
              </div>
              <EditorialAccentPill className="mx-auto" />
              <SectionIntro
                heading="h1"
                size="hero"
                align="center"
                title="Kontakt oss"
                description="Har du spørsmål om peiser, vedovner, peisinnsatser eller montering? Send oss en melding, så hjelper vi deg med riktig løsning."
                className="pt-0 pb-0"
                descriptionClassName="mx-auto max-w-2xl"
              />
            </MotionPreset>
          </ContainedLayout>
        </section>

        <section className="py-12 md:py-16">
          <ContainedLayout as="div" className="space-y-10">
            <MotionPreset
              fade
              blur
              slide={{ direction: "up", offset: 40 }}
              transition={{ duration: 0.55 }}
            >
              <Card
                id="kontakt-skjema"
                className="overflow-visible border border-border shadow-xs scroll-mt-24"
              >
                <CardContent className="grid min-w-0 gap-6 overflow-visible pt-6 md:grid-cols-2">
                  <div className="min-w-0">
                    <ContactForm
                      recipientEmail={SITE_CONTACT.email}
                      formId={CONTACT_FORM_PLACEMENTS.contactPage.formId}
                      formName={CONTACT_FORM_PLACEMENTS.contactPage.formName}
                    />
                  </div>

                  <div className="min-w-0">
                    <iframe
                      className="size-full min-h-[420px] rounded-xl border border-border"
                      src={mapsEmbedSrc}
                      title="Rüegg i Google Maps"
                    />
                  </div>
                </CardContent>
              </Card>
            </MotionPreset>

            <div
              className={`grid gap-5 md:grid-cols-2 ${contactInfoCards.length >= 3 ? "xl:grid-cols-3" : ""}`}
            >
              {contactInfoCards.map((contact, index) => (
                <MotionPreset
                  key={contact.title}
                  className="h-full"
                  fade
                  blur
                  slide={{ direction: "up", offset: 28 }}
                  delay={index * 0.08}
                  transition={{ duration: 0.45 }}
                >
                  <Card className="h-full border border-border py-0 shadow-xs">
                    <CardContent className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
                      <IconBadge icon={contact.icon} />

                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-foreground">
                          {contact.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {contact.description}
                        </p>
                      </div>

                      <Button
                        asChild
                        variant="redOutline"
                        className="w-full justify-center text-sm"
                      >
                        <ContactCardCtaLink
                          href={contact.ctaLink}
                          label={contact.ctaText}
                        >
                          {contact.ctaText}
                        </ContactCardCtaLink>
                      </Button>
                    </CardContent>
                  </Card>
                </MotionPreset>
              ))}
            </div>
          </ContainedLayout>
        </section>
      </main>
    </StorefrontPageShell>
  );
}
