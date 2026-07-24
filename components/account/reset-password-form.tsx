"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordMutation } from "@/lib/tanstack/auth-queries";

type ResetPasswordFormProps = {
  login: string;
  keyToken: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ResetPasswordForm({ login, keyToken }: ResetPasswordFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const resetPasswordMutation = useResetPasswordMutation();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!login || !keyToken) {
      setSubmitState("error");
      setStatusMessage("Lenken mangler nødvendig informasjon.");
      return;
    }

    if (newPassword.length < 8) {
      setSubmitState("error");
      setStatusMessage("Passordet må være minst 8 tegn.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitState("error");
      setStatusMessage("Passordene må være like.");
      return;
    }

    setSubmitState("submitting");
    setStatusMessage("");

    try {
      const message = await resetPasswordMutation.mutateAsync({
        login,
        key: keyToken,
        newPassword,
      });
      setSubmitState("success");
      setStatusMessage(message);
      form.reset();
    } catch (error) {
      setSubmitState("error");
      setStatusMessage(
        error instanceof Error && error.message
          ? error.message
          : "Kunne ikke oppdatere passord akkurat nå."
      );
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="reset-new-password">Nytt passord</Label>
        <Input
          id="reset-new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reset-confirm-password">Gjenta nytt passord</Label>
        <Input
          id="reset-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <Button type="submit" disabled={resetPasswordMutation.isPending} className="w-full">
        {resetPasswordMutation.isPending ? "Oppdaterer..." : "Oppdater passord"}
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

