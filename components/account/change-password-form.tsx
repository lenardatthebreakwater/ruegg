"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/account/account-auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const router = useRouter();
  const { clearAuthenticatedUser } = useAuth();
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setIsError(true);
      setStatusMessage("Fyll inn alle feltene.");
      return;
    }
    if (newPassword.length < 8) {
      setIsError(true);
      setStatusMessage("Passordet må være minst 8 tegn.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setStatusMessage("De nye passordene er ikke like.");
      return;
    }

    setPending(true);
    setStatusMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        message?: string;
      } | null;

      if (!response.ok || !data?.ok) {
        setIsError(true);
        setStatusMessage(data?.error ?? "Kunne ikke oppdatere passordet.");
        return;
      }

      form.reset();
      clearAuthenticatedUser();
      router.replace("/min-konto/");
      router.refresh();
    } catch {
      setIsError(true);
      setStatusMessage("Kunne ikke oppdatere passordet akkurat nå.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="current-password">Nåværende passord</Label>
        <Input
          id="current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">Nytt passord</Label>
        <Input
          id="new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Bekreft nytt passord</Label>
        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Oppdaterer..." : "Oppdater passord"}
      </Button>
      {statusMessage ? (
        <p
          className={
            isError ? "text-sm text-red-700" : "text-sm text-muted-foreground"
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
