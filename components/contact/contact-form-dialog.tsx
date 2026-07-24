"use client";

import * as React from "react";

import { ContactForm } from "@/components/shadcn-studio/blocks/contact-us-page-15/contact-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SITE_CONTACT } from "@/lib/site-contact";
import { cn } from "@/lib/utils";

type ContactFormDialogProps = {
  title: string;
  description?: React.ReactNode;
  formName: string;
  formId: string;
  /**
   * Hint only — `/api/contact/submit` never trusts client recipient.
   * Server routes by `formId` allowlist (or CONTACT_RECIPIENT_OVERRIDE).
   */
  recipientEmail?: string;
  productName?: string;
  defaultMessage?: string;
  /** Rendered as `DialogTrigger asChild` (usually a Button). */
  trigger: React.ReactElement;
  className?: string;
};

/**
 * Shared contact / expert form in a shadcn Dialog (PDP «Spør en ekspert», archive CTAs, etc.).
 */
export function ContactFormDialog({
  title,
  description,
  formName,
  formId,
  recipientEmail = SITE_CONTACT.email,
  productName,
  defaultMessage,
  trigger,
  className,
}: ContactFormDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[min(90vh,720px)] max-w-xl overflow-y-auto sm:max-w-xl",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <ContactForm
          recipientEmail={recipientEmail}
          productName={productName}
          defaultMessage={defaultMessage}
          formName={formName}
          formId={formId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
