import { ContactSection } from "@/components/homepage/contact-section";
import { CONTACT_FORM_PLACEMENTS } from "@/lib/analytics/contact-form-placements";

/** Existing contact form section for homepage lead capture. */
export function HomeShellContact() {
  return (
    <ContactSection
      formId={CONTACT_FORM_PLACEMENTS.homepage.formId}
      formName={CONTACT_FORM_PLACEMENTS.homepage.formName}
    />
  );
}
