"use client";

import {
  Check,
  MessageSquare,
  Phone,
} from "lucide-react";
import { ContactMethodLink } from "@/components/analytics/contact-method-link";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import {
  EDITORIAL_SECONDARY_TEXT_CLASS,
  MetaRubricLabel,
} from "@/components/editorial";
import { PDP_BORDERED_PANEL_CLASS } from "@/components/product-detail/pdp-panel-styles";
import { SectionIntro } from "@/components/section-intro";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { productDetailFaq } from "@/lib/data/product-detail-faq";
import { SITE_CONTACT, hasPublicPhone } from "@/lib/site-contact";
import { cn } from "@/lib/utils";

const faqChecklistItems = [
  "Hjelp med å velge riktig modell og størrelse",
  "Vurdering av skorstein og installasjon",
  "Prisestimat inkludert montering",
  "Svar på alle dine spørsmål",
] as const;

function FaqCheckIcon() {
  return (
    <span
      aria-hidden
      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50"
    >
      <Check
        className="size-3.5 text-emerald-600 dark:text-emerald-400"
        strokeWidth={2.5}
        aria-hidden
      />
    </span>
  );
}

export function ProductContactFaqSection() {
  const defaultOpenItem = productDetailFaq[0]?.id;
  const showPhone = hasPublicPhone();

  return (
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-12">
      <div className="flex h-full flex-col justify-between">
        <div>
        <SectionIntro
          title="Vanlige spørsmål før kjøp"
          align="left"
          className="max-w-none pt-0 pb-3"
          descriptionClassName={EDITORIAL_SECONDARY_TEXT_CLASS}
          renderTitle={(title) => (
            <span className="flex flex-col items-start gap-2">
              <MetaRubricLabel as="span">Hjelp</MetaRubricLabel>
              <span>{title}</span>
            </span>
          )}
          description={
            <p>
              En peis er en stor investering. Vi har hjulpet mange kunder med å finne riktig
              løsning, og samlet svar på spørsmålene vi oftest får før bestilling.
            </p>
          }
        />
        <ul className="space-y-3 pb-5">
          {faqChecklistItems.map((item) => (
            <li key={item} className="flex items-center gap-3 text-foreground">
              <FaqCheckIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {showPhone ? (
            <Button size="lg" asChild>
              <ContactMethodLink
                href={`tel:${SITE_CONTACT.phoneHref}`}
                placement="pdp_faq"
                linkText={SITE_CONTACT.phoneDisplay}
              >
                <Phone data-icon="inline-start" />
                Ring oss: {SITE_CONTACT.phoneDisplay}
              </ContactMethodLink>
            </Button>
          ) : null}
          <Button size="lg" variant={showPhone ? "outline" : undefined} asChild>
            <TrackedCtaLink
              href="/kontakt-oss/"
              contentType="pdp_faq"
              contentId="kontakt_oss"
              linkText="Kontakt oss"
            >
              <MessageSquare data-icon="inline-start" />
              Kontakt oss
            </TrackedCtaLink>
          </Button>
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpenItem}
        className={cn(PDP_BORDERED_PANEL_CLASS, "w-full p-2")}
      >
        {productDetailFaq.map((item) => {
          return (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-primary/10"
            >
              <AccordionTrigger className="px-5 text-base text-foreground">
                {item.question}
              </AccordionTrigger>
              <AccordionContent
                className={cn("px-5 text-base", EDITORIAL_SECONDARY_TEXT_CLASS)}
              >
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
