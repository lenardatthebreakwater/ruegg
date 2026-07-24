"use client";

import Link from "next/link";
import {
  EditorialEyebrow,
  EditorialHeading,
} from "@/components/editorial";
import { Button } from "@/components/ui/button";
import { AccountAuthCard } from "@/components/account/account-auth-card";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { AccountPageShell } from "@/components/account/account-page-shell";
import { useAuth } from "@/components/account/account-auth-provider";
import { LoginForm } from "@/components/account/login-form";
import { SignupForm } from "@/components/account/signup-form";

export function AccountShell() {
  const { user, authView, setAuthView, loginSuccess, signupSuccess } = useAuth();

  if (user) {
    return (
      <AccountPageShell maxWidth="full" showNav>
        <AccountDashboard />
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell>
      <div className="space-y-2">
        <EditorialEyebrow>Min konto</EditorialEyebrow>
        <EditorialHeading size="account">Velkommen tilbake</EditorialHeading>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Logg inn for å se ordrer, adresser og betalingsmetoder hos Peisbutikken.
        </p>
      </div>

      <div className="inline-flex w-fit rounded-lg border border-border/80 bg-muted/40 p-1">
        <Button
          type="button"
          size="sm"
          variant={authView === "login" ? "default" : "ghost"}
          onClick={() => setAuthView("login")}
        >
          Logg inn
        </Button>
        <Button
          type="button"
          size="sm"
          variant={authView === "signup" ? "default" : "ghost"}
          onClick={() => setAuthView("signup")}
        >
          Opprett konto
        </Button>
      </div>

      {authView === "login" ? (
        <AccountAuthCard
          title="Logg inn"
          titleAs="h2"
          description="Bruk e-post og passordet ditt for å få tilgang til kontoen."
        >
          <LoginForm onSuccess={loginSuccess} />
          <p className="mt-5 text-sm text-muted-foreground">
            Glemt passord?{" "}
            <Link
              href="/min-konto/glemt-passord"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Tilbakestill her
            </Link>
            .
          </p>
        </AccountAuthCard>
      ) : (
        <AccountAuthCard
          title="Opprett konto"
          titleAs="h2"
          description="Lag en konto med e-post og passord."
        >
          <SignupForm onSuccess={signupSuccess} />
        </AccountAuthCard>
      )}
    </AccountPageShell>
  );
}
