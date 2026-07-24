"use client";

import { motion } from "motion/react";
import ContactUsPage15 from "@/components/shadcn-studio/blocks/contact-us-page-15/contact-us-page-15";
import { CONTACT_FORM_PLACEMENTS } from "@/lib/analytics/contact-form-placements";
import { SITE_CONTACT } from "@/lib/site-contact";
import { cn } from "@/lib/utils";

type ContactSectionProps = {
  /** Override GTM / WP form_id (defaults to shared section placement). */
  formId?: string;
  /** Override GTM / WP form_name (defaults to shared section placement). */
  formName?: string;
  /** Prefill message textarea. */
  defaultMessage?: string;
  /** Optional product context submitted with the form. */
  productName?: string;
  /**
   * Nested layout (account / expand panels): skip ContainedLayout and page
   * section chrome.
   */
  embedded?: boolean;
  className?: string;
};

/** Homepage (and reusable) contact block — full layout and form. */
export function ContactSection({
  formId = CONTACT_FORM_PLACEMENTS.section.formId,
  formName = CONTACT_FORM_PLACEMENTS.section.formName,
  defaultMessage,
  productName,
  embedded = false,
  className,
}: ContactSectionProps) {
  return (
    <motion.div
      id={embedded ? undefined : "kontakt"}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={cn(
        // Do not clip X here — Turnstile can extend past the form card.
        // Horizontal overflow is fixed at the intro MotionPreset instead.
        !embedded && "scroll-mt-24",
        className,
      )}
    >
      <ContactUsPage15
        contactInfo={SITE_CONTACT}
        hideContactHeroImageOnMobile
        formId={formId}
        formName={formName}
        defaultMessage={defaultMessage}
        productName={productName}
        embedded={embedded}
      />
    </motion.div>
  );
}
