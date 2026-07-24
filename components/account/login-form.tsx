"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SessionUser } from "@/lib/auth/types";
import { useLoginMutation } from "@/lib/tanstack/auth-queries";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/security/turnstile-widget";
import { pushLoginEvent } from "@/lib/analytics/push-auth-event";
import {
  TURNSTILE_MISSING_MESSAGE,
  getTurnstileSiteKey,
} from "@/lib/security/verify-turnstile";

type LoginFormProps = {
  onSuccess: (user: SessionUser) => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const loginMutation = useLoginMutation();
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const turnstileEnabled = Boolean(getTurnstileSiteKey());

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setStatusMessage("Vennligst fyll inn e-post og passord.");
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
      const user = await loginMutation.mutateAsync({
        email,
        password,
        turnstileToken: turnstileToken || undefined,
      });
      form.reset();
      turnstileRef.current?.reset();
      pushLoginEvent("email");
      onSuccess(user);
      setStatusMessage("");
    } catch (error) {
      turnstileRef.current?.reset();
      setStatusMessage(
        error instanceof Error && error.message
          ? error.message
          : "Kunne ikke logge inn akkurat nå."
      );
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="login-email">E-post</Label>
        <Input id="login-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Passord</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {turnstileEnabled ? <TurnstileWidget ref={turnstileRef} /> : null}
      <Button type="submit" disabled={loginMutation.isPending} className="w-full">
        {loginMutation.isPending ? "Logger inn..." : "Logg inn"}
      </Button>
      {statusMessage ? (
        <p className="text-sm text-red-700" role="status" aria-live="polite">
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
