"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { ContactFormDialog } from "@/components/contact/contact-form-dialog";
import { Button } from "@/components/ui/button";
import { CONTACT_FORM_PLACEMENTS } from "@/lib/analytics/contact-form-placements";
import { isContactIntentCta } from "@/lib/contact/is-contact-intent-cta";

type ArchiveBottomCtaProps = {
  linkText: string;
  linkUrl: string | null;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
};

/** Generic WP/fallback labels → friendlier expert invite (matches PDP). */
const GENERIC_CONTACT_LABELS = new Set([
  "kontakt oss",
  "kontakt",
  "ta kontakt",
]);

function resolveHref(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "#";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
}

function resolveContactCtaLabel(label: string): string {
  const normalized = label
    .trim()
    .toLocaleLowerCase("nb-NO")
    .replace(/\s+/g, " ");
  if (GENERIC_CONTACT_LABELS.has(normalized)) {
    return "Spør en ekspert";
  }
  return label.trim();
}

/**
 * Archive JetEngine bottom CTA. Contact-intent labels/hrefs open the same
 * expert contact dialog as PDP «Spør en ekspert» (stay on page).
 */
export function ArchiveBottomCta({
  linkText,
  linkUrl,
  variant = "ctaGlow",
  size = "lg",
  className,
}: ArchiveBottomCtaProps) {
  const label = linkText.trim();
  if (!label) return null;

  if (isContactIntentCta(linkUrl, label)) {
    const displayLabel = resolveContactCtaLabel(label);
    return (
      <ContactFormDialog
        title="Spør en ekspert"
        description="Vi svarer deg så raskt vi kan. Fortell oss hva du lurer på — du kan fortsette å bla i produktene etterpå."
        formName={CONTACT_FORM_PLACEMENTS.archiveBottom.formName}
        formId={CONTACT_FORM_PLACEMENTS.archiveBottom.formId}
        trigger={
          <Button type="button" variant={variant} size={size} className={className}>
            <MessageSquare data-icon="inline-start" />
            {displayLabel}
          </Button>
        }
      />
    );
  }

  const href = linkUrl?.trim() ? resolveHref(linkUrl) : null;
  if (!href) return null;

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href={href}>{label}</Link>
    </Button>
  );
}
