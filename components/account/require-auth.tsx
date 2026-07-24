"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AccountAuthCard } from "@/components/account/account-auth-card";
import {
  AccountPageShell,
  type AccountContentWidth,
} from "@/components/account/account-page-shell";
import { useAuth } from "@/components/account/account-auth-provider";
import { Button } from "@/components/ui/button";

type RequireAuthProps = {
  children: ReactNode;
  /**
   * Content column width for the authenticated shell.
   * Defaults to "full" so the shared account nav matches Min peis.
   * Use "narrow" / "wide" when a page’s body should stay capped.
   */
  maxWidth?: AccountContentWidth;
  /** @deprecated Prefer `maxWidth="wide"`. */
  wide?: boolean;
};

/**
 * Client gate for logged-in account pages. The layout already seeds the
 * session from cookies; this covers the logged-out case after hydration.
 */
export function RequireAuth({
  children,
  maxWidth = "full",
  wide,
}: RequireAuthProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <AccountPageShell>
        <AccountAuthCard
          title="Logg inn for å fortsette"
          titleAs="h1"
          description="Du må være innlogget for å se denne siden."
        >
          <Button asChild>
            <Link href="/min-konto/">Gå til innlogging</Link>
          </Button>
        </AccountAuthCard>
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell maxWidth={maxWidth} wide={wide} showNav>
      {children}
    </AccountPageShell>
  );
}
