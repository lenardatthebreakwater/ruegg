"use client";

import { useRef, useState } from "react";
import { SendIcon } from "lucide-react";

import { ContactFileDropzone } from "@/components/contact/contact-file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LazyTurnstileWidget } from "@/components/security/lazy-turnstile-widget";
import type { TurnstileWidgetHandle } from "@/components/security/turnstile-widget";
import { pushGenerateLeadEvent } from "@/lib/analytics/push-generate-lead-event";
import {
  TURNSTILE_MISSING_MESSAGE,
  TURNSTILE_TOKEN_FIELD,
  getTurnstileSiteKey,
} from "@/lib/security/verify-turnstile";

type ContactFormProps = {
  recipientEmail: string;
  /** Shown in WordPress / e-post when set (e.g. product page expert flow). */
  productName?: string;
  /** Prefill the message textarea (uncontrolled `defaultValue`). */
  defaultMessage?: string;
  /** Shown in D1 / e-post + GTM `form_name`; default "Kontakt oss" if omitted. */
  formName?: string;
  /** Distinguish placement in WP / GTM (`form_id`). */
  formId?: string;
  onSuccess?: () => void;
};

type SubmitState = "idle" | "submitting" | "success" | "error";
const DEFAULT_CONTACT_FORM_ID = "contact-form";
const DEFAULT_CONTACT_FORM_NAME = "Kontakt oss";
const CONTACT_ATTACHMENTS_INPUT_ID = "contact-form-attachments";

export function ContactForm({
  recipientEmail,
  productName,
  defaultMessage,
  formName,
  formId = DEFAULT_CONTACT_FORM_ID,
  onSuccess,
}: ContactFormProps) {
  const resolvedFormName = formName?.trim() || DEFAULT_CONTACT_FORM_NAME;
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const turnstileEnabled = Boolean(getTurnstileSiteKey());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    // Managed by ContactFileDropzone state — do not trust a native file input.
    fd.delete("attachments");
    for (const file of attachments) {
      fd.append("attachments", file, file.name);
    }

    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    fd.set("recipientEmail", recipientEmail);
    fd.set("formId", formId);
    fd.set("formName", resolvedFormName);
    if (productName) {
      fd.set("productName", productName);
    }
    if (typeof window !== "undefined") {
      fd.set("pageUrl", window.location.href);
      fd.set("pageTitle", document.title);
    }

    if (!name || !email || !message) {
      setSubmitState("error");
      setStatusMessage("Vennligst fyll inn navn, e-post og melding.");
      return;
    }

    if (turnstileEnabled) {
      const turnstileToken = turnstileRef.current?.getToken() ?? "";
      if (!turnstileToken) {
        setSubmitState("error");
        setStatusMessage(TURNSTILE_MISSING_MESSAGE);
        return;
      }
      fd.set(TURNSTILE_TOKEN_FIELD, turnstileToken);
    }

    setSubmitState("submitting");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        body: fd,
      });

      const json = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !json.ok) {
        throw new Error(json.error ?? "Kunne ikke sende melding.");
      }

      form.reset();
      setAttachments([]);
      turnstileRef.current?.reset();
      setSubmitState("success");
      setStatusMessage("Takk! Meldingen din er sendt.");
      pushGenerateLeadEvent({
        formId,
        formName: resolvedFormName,
        productName,
      });
      onSuccess?.();
    } catch (error) {
      turnstileRef.current?.reset();
      setSubmitState("error");
      setStatusMessage(
        error instanceof Error && error.message
          ? error.message
          : "Noe gikk galt. Prøv igjen om litt."
      );
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="contact-name">Navn</Label>
        <Input
          type="text"
          id="contact-name"
          name="name"
          autoComplete="name"
          placeholder="Navn"
          className="h-10"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">Epost</Label>
        <Input
          type="email"
          id="contact-email"
          name="email"
          autoComplete="email"
          placeholder="Epost"
          className="h-10"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-phone">Telefonnummer</Label>
        <Input
          type="tel"
          id="contact-phone"
          name="phone"
          autoComplete="tel"
          placeholder="Telefonnummer"
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Melding</Label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder="Melding"
          className="min-h-24 resize-none"
          defaultValue={defaultMessage}
          required
        />
      </div>

      <div className="space-y-2">
        <ContactFileDropzone
          id={CONTACT_ATTACHMENTS_INPUT_ID}
          label="Vedlegg"
          files={attachments}
          onChange={setAttachments}
          disabled={submitState === "submitting"}
        />
      </div>

      {turnstileEnabled ? <LazyTurnstileWidget ref={turnstileRef} /> : null}

      <Button
        type="submit"
        size="lg"
        disabled={submitState === "submitting"}
        className="w-full rounded-lg text-base font-medium has-[>svg]:px-6"
      >
        {submitState === "submitting" ? "Sender..." : "Send"}
        <SendIcon />
      </Button>
      {statusMessage ? (
        <p
          className={
            submitState === "success"
              ? "text-sm text-emerald-700"
              : "text-sm text-red-700"
          }
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
