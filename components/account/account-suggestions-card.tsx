"use client";

import {
  ANIMATED_ICON_PROPS,
  AccountMessageIcon,
  useAnimatedIcon,
} from "@/components/account/account-animated-icon";
import {
  AccountQuickLinkCardBody,
  CARD_CLASSNAME,
} from "@/components/account/account-quick-link-card";
import { ContactFormDialog } from "@/components/contact/contact-form-dialog";
import { CONTACT_FORM_PLACEMENTS } from "@/lib/analytics/contact-form-placements";
import { SITE_CONTACT } from "@/lib/site-contact";
import { cn } from "@/lib/utils";

/**
 * Sixth My Account quick-link card — opens «Kom med Forslag» contact dialog.
 */
export function AccountSuggestionsCard() {
  const { ref, triggerProps } = useAnimatedIcon();

  return (
    <ContactFormDialog
      title="Kom med Forslag"
      description="Har du idéer til hvordan Min side eller Peisbutikken kan bli bedre? Vi leser alt med glede — skriv gjerne med vennlige ord hva som fungerer, hva som mangler, eller hva vi burde endre."
      formId={CONTACT_FORM_PLACEMENTS.accountSuggestions.formId}
      formName={CONTACT_FORM_PLACEMENTS.accountSuggestions.formName}
      recipientEmail={SITE_CONTACT.suggestionsEmail}
      trigger={
        <button
          type="button"
          className={cn(CARD_CLASSNAME, "w-full text-left")}
          {...triggerProps}
        >
          <AccountQuickLinkCardBody
            title="Kom med Forslag"
            description="Del idéer til Min side eller butikken — vi leser gjerne."
            icon={<AccountMessageIcon ref={ref} {...ANIMATED_ICON_PROPS} />}
          />
        </button>
      }
    />
  );
}
