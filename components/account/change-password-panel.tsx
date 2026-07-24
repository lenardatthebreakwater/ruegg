"use client";

import { AccountAuthCard } from "@/components/account/account-auth-card";
import { ChangePasswordForm } from "@/components/account/change-password-form";

export function ChangePasswordPanel() {
  return (
    <AccountAuthCard
      title="Endre passord"
      titleAs="h1"
      description="Skriv inn nåværende passord og velg et nytt. Du blir logget ut etter at passordet er oppdatert."
    >
      <ChangePasswordForm />
    </AccountAuthCard>
  );
}
