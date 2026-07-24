"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordMutation } from "@/lib/tanstack/auth-queries";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/security/turnstile-widget";
import {
  TURNSTILE_MISSING_MESSAGE,
  getTurnstileSiteKey,
} from "@/lib/security/verify-turnstile";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ForgotPasswordForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const forgotPasswordMutation = useForgotPasswordMutation();
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const turnstileEnabled = Boolean(getTurnstileSiteKey());

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
      setSubmitState("error");
      setStatusMessage("Vennligst skriv inn e-postadressen din.");
      return;
    }

    const turnstileToken = turnstileEnabled
      ? turnstileRef.current?.getToken() ?? ""
      : "";
    if (turnstileEnabled && !turnstileToken) {
      setSubmitState("error");
      setStatusMessage(TURNSTILE_MISSING_MESSAGE);
      return;
    }

    setSubmitState("submitting");
    setStatusMessage("");

    try {
      const message = await forgotPasswordMutation.mutateAsync({
        email,
        turnstileToken: turnstileToken || undefined,
      });
      setSubmitState("success");
      setStatusMessage(message);
      form.reset();
      turnstileRef.current?.reset();
    } catch {
      turnstileRef.current?.reset();
      setSubmitState("error");
      setStatusMessage("Kunne ikke sende forespørselen. Prøv igjen om litt.");
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="forgot-password-email">E-post</Label>
        <Input
          id="forgot-password-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      {turnstileEnabled ? <TurnstileWidget ref={turnstileRef} /> : null}
      <Button type="submit" disabled={forgotPasswordMutation.isPending} className="w-full">
        {forgotPasswordMutation.isPending ? "Sender..." : "Send tilbakestillingslenke"}
      </Button>
      {statusMessage ? (
        <p
          className={
            submitState === "success" ? "text-sm text-emerald-700" : "text-sm text-red-700"
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
