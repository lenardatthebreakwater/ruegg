"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SessionUser } from "@/lib/auth/types";
import { useSignupMutation } from "@/lib/tanstack/auth-queries";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/security/turnstile-widget";
import { pushSignUpEvent } from "@/lib/analytics/push-auth-event";
import {
  TURNSTILE_MISSING_MESSAGE,
  getTurnstileSiteKey,
} from "@/lib/security/verify-turnstile";

type SignupFormProps = {
  onSuccess: (user: SessionUser) => void;
};

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const signupMutation = useSignupMutation();
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const turnstileEnabled = Boolean(getTurnstileSiteKey());

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || password.length < 8) {
      setStatusMessage("Skriv inn gyldig e-post og passord på minst 8 tegn.");
      return;
    }

    const turnstileToken = turnstileEnabled
      ? turnstileRef.current?.getToken() ?? ""
      : "";
    if (turnstileEnabled && !turnstileToken) {
      setStatusMessage(TURNSTILE_MISSING_MESSAGE);
      return;
    }

    setStatusMessage("");

    try {
      const user = await signupMutation.mutateAsync({
        firstName,
        lastName,
        email,
        password,
        turnstileToken: turnstileToken || undefined,
      });
      form.reset();
      turnstileRef.current?.reset();
      pushSignUpEvent("email");
      onSuccess(user);
      setStatusMessage("");
    } catch (error) {
      turnstileRef.current?.reset();
      setStatusMessage(
        error instanceof Error && error.message
          ? error.message
          : "Kunne ikke opprette konto akkurat nå."
      );
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="signup-first-name">Fornavn</Label>
          <Input id="signup-first-name" name="firstName" autoComplete="given-name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-last-name">Etternavn</Label>
          <Input id="signup-last-name" name="lastName" autoComplete="family-name" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">E-post</Label>
        <Input id="signup-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Passord</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      {turnstileEnabled ? <TurnstileWidget ref={turnstileRef} /> : null}
      <Button type="submit" disabled={signupMutation.isPending} className="w-full">
        {signupMutation.isPending ? "Oppretter konto..." : "Opprett konto"}
      </Button>
      {statusMessage ? (
        <p className="text-sm text-red-700" role="status" aria-live="polite">
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
