import { PhoneIcon, MailIcon } from "lucide-react";

import { ContactMethodLink } from "@/components/analytics/contact-method-link";
import { ContactForm } from "@/components/shadcn-studio/blocks/contact-us-page-15/contact-form";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { StaticPicture } from "@/components/media/static-picture";
import { SectionIntro } from "@/components/section-intro";
import { MotionPreset } from "@/components/ui/motion-preset";
import { IconBadge } from "@/components/ui/icon-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  hasPublicEmail,
  hasPublicPhone,
  type SiteContactInfo,
} from "@/lib/site-contact";
import { PAGE_SECTION_PY, HOME_PAGE_GRID_GAP } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

/** Local contact hero image from `public/images/contact/`. */
const CONTACT_HERO_IMAGE = "/images/contact/contact-hero.webp";

/** Shared vertical rhythm between stacked blocks in each column. */
const COLUMN_STACK_GAP = HOME_PAGE_GRID_GAP;

type ContactUsPage15Props = {
  contactInfo: SiteContactInfo;
  className?: string;
  /** When true, hero image is hidden below the `lg` breakpoint (e.g. homepage mobile). */
  hideContactHeroImageOnMobile?: boolean;
  /** GTM / WP form_id for this placement. */
  formId?: string;
  /** GTM / WP form_name for this placement. */
  formName?: string;
  /** Prefill message textarea (e.g. Min peis montering). */
  defaultMessage?: string;
  /** Optional product context submitted with the form. */
  productName?: string;
  /**
   * Nested layout (e.g. Min peis expand): skip ContainedLayout + page section
   * padding / bottom border so the block fits the parent content width.
   */
  embedded?: boolean;
};

export default function ContactUsPage15({
  contactInfo,
  className,
  hideContactHeroImageOnMobile = false,
  formId,
  formName,
  defaultMessage,
  productName,
  embedded = false,
}: ContactUsPage15Props) {
  const grid = (
    <div
      className={cn(
        "grid min-w-0 lg:grid-cols-2 lg:items-stretch",
        HOME_PAGE_GRID_GAP
      )}
    >
      {/* Left: intro + form — min-w-0 so the grid track can shrink without
          clipping the full-width Turnstile iframe on the right. */}
      <div
        className={cn("flex min-h-0 min-w-0 w-full flex-col", COLUMN_STACK_GAP)}
      >
        {/* Clip X on intro only — not the form (Turnstile needs overflow room). */}
        <div className="w-full min-w-0 shrink-0 overflow-x-clip">
          <MotionPreset
            className="w-full"
            fade
            // Vertical only: slide-right translateX on w-full expanded
            // document scrollWidth (~14px) and enabled sideways pan from the hero.
            slide={{ direction: "up", offset: 24 }}
            blur
            transition={{ duration: 0.4 }}
          >
            <SectionIntro
              title="Har du et spørsmål eller trenger hjelp?"
              description="Vi er her for å hjelpe deg! Har du spørsmål, tilbakemeldinger eller trenger mer informasjon? Fyll ut skjemaet nedenfor, så tar vi kontakt med deg så fort vi kan."
              align="left"
              className="max-w-none pt-0 pb-0"
            />
          </MotionPreset>
        </div>

        <Card className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-visible border border-border bg-card shadow-xs">
          <CardContent className="flex min-w-0 flex-1 flex-col overflow-visible p-6 pt-6">
            <ContactForm
              recipientEmail={contactInfo.email}
              formId={formId}
              formName={formName}
              defaultMessage={defaultMessage}
              productName={productName}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right: image + contact */}
      <div className={cn("flex min-h-0 w-full flex-col lg:h-full", COLUMN_STACK_GAP)}>
        <MotionPreset
          className={cn(
            "min-h-0 w-full flex-1 flex-col",
            hideContactHeroImageOnMobile ? "hidden lg:flex" : "flex"
          )}
          fade
          slide={{ direction: "up", offset: 100 }}
          blur
          delay={0.2}
          transition={{ duration: 0.6 }}
        >
          <div className="relative min-h-[14rem] w-full flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <StaticPicture
              src={CONTACT_HERO_IMAGE}
              alt="Moderne stue med peis"
              className="absolute inset-0 size-full object-cover object-center"
            />
          </div>
        </MotionPreset>

        {hasPublicPhone() || hasPublicEmail() ? (
          <MotionPreset
            className="w-full shrink-0"
            fade
            slide={{ direction: "up", offset: 60 }}
            blur
            delay={0.35}
            transition={{ duration: 0.55 }}
          >
            <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-xs">
              {hasPublicPhone() ? (
                <ContactMethodLink
                  href={`tel:${contactInfo.phoneHref}`}
                  placement="contact_sidebar"
                  linkText={contactInfo.phoneDisplay}
                  className="flex items-center gap-4 rounded-lg bg-muted/60 px-5 py-4 transition-colors hover:bg-muted"
                >
                  <IconBadge icon={PhoneIcon} />
                  <div className="text-left">
                    <h3 className="text-base font-semibold text-foreground">
                      Telefonnummer
                    </h3>
                    <p className="text-muted-foreground">
                      {contactInfo.phoneDisplay}
                    </p>
                  </div>
                </ContactMethodLink>
              ) : null}

              {hasPublicEmail() ? (
                <ContactMethodLink
                  href={`mailto:${contactInfo.email}`}
                  placement="contact_sidebar"
                  linkText={contactInfo.email}
                  className="flex items-center gap-4 rounded-lg bg-muted/60 px-5 py-4 transition-colors hover:bg-muted"
                >
                  <IconBadge icon={MailIcon} />
                  <div className="text-left">
                    <h3 className="text-base font-semibold text-foreground">
                      Epost
                    </h3>
                    <p className="text-muted-foreground break-all">
                      {contactInfo.email}
                    </p>
                  </div>
                </ContactMethodLink>
              ) : null}
            </div>
          </MotionPreset>
        ) : null}
      </div>
    </div>
  );

  return (
    <section
      className={cn(
        "relative",
        !embedded && "border-b border-neutral-200/70 dark:border-white/10",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <StaticPicture
          src={CONTACT_HERO_IMAGE}
          alt=""
          className="absolute inset-0 size-full scale-125 object-cover opacity-80 blur-[88px] saturate-125"
        />
      </div>
      {/* No backdrop-filter: it composites badly with the Turnstile iframe and
          clips the widget’s right edge. The hero image is already blurred. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-white/70 dark:bg-neutral-950/55"
      />

      {embedded ? (
        <div className="relative z-10 px-4 py-6 sm:px-5 sm:py-8">{grid}</div>
      ) : (
        <ContainedLayout
          as="div"
          className={cn("relative z-10", PAGE_SECTION_PY)}
        >
          {grid}
        </ContainedLayout>
      )}
    </section>
  );
}
