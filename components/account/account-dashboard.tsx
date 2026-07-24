"use client";

import { LogOut } from "lucide-react";
import {
  AccountCreditCardIcon,
  AccountFlameIcon,
  AccountKeyRoundIcon,
  AccountMapPinIcon,
  AccountPackageIcon,
  type AnimatedIconComponent,
} from "@/components/account/account-animated-icon";
import { AccountAuthCard } from "@/components/account/account-auth-card";
import { AccountGravatarAvatar } from "@/components/account/account-gravatar-avatar";
import { AccountQuickLinkCard } from "@/components/account/account-quick-link-card";
import { AccountSuggestionsCard } from "@/components/account/account-suggestions-card";
import { useAuth } from "@/components/account/account-auth-provider";
import {
  EditorialEyebrow,
  EditorialHeading,
} from "@/components/editorial";
import { Button } from "@/components/ui/button";

type QuickLink = {
  href: string;
  title: string;
  description: string;
  icon: AnimatedIconComponent;
};

const QUICK_LINKS: ReadonlyArray<QuickLink> = [
  {
    href: "/min-konto/min-peis/",
    title: "Min Peis",
    description: "Peisen din, tilbehør og dokumenter samlet.",
    icon: AccountFlameIcon,
  },
  {
    href: "/min-konto/ordrer/",
    title: "Ordrer",
    description: "Se status, detaljer og betal ubetalte ordrer.",
    icon: AccountPackageIcon,
  },
  {
    href: "/min-konto/adresser/",
    title: "Adresser",
    description: "Oppdater faktura- og leveringsadresse.",
    icon: AccountMapPinIcon,
  },
  {
    href: "/min-konto/betalingsmetoder/",
    title: "Betaling",
    description: "Administrer lagrede betalingsmetoder.",
    icon: AccountCreditCardIcon,
  },
  {
    href: "/min-konto/passord/",
    title: "Passord",
    description: "Endre passordet på kontoen din.",
    icon: AccountKeyRoundIcon,
  },
];

export function AccountDashboard() {
  const { user, logoutPending, logout } = useAuth();

  if (!user) return null;

  const greetingName = user.firstName || user.displayName || "der";
  const fullName =
    user.displayName ||
    `${user.firstName} ${user.lastName}`.trim() ||
    "—";

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div>
        <EditorialEyebrow className="mb-5">Min konto</EditorialEyebrow>
        <div className="flex items-start gap-3.5">
          <AccountGravatarAvatar
            key={user.email}
            email={user.email}
            alt={`Profilbilde for ${greetingName}`}
            className="mt-1"
          />
          <div className="min-w-0 space-y-2">
            <EditorialHeading size="account" className="leading-none">
              Hei, {greetingName}
            </EditorialHeading>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              Hyggelig at du stakk innom. Her finner du ordrene dine, adresser
              og Min Peis — og alt annet som hører til kontoen din hos
              Peisbutikken.
            </p>
          </div>
        </div>
      </div>

      <AccountAuthCard
        title="Kontodetaljer"
        titleAs="h2"
        description="Opplysninger knyttet til innloggingen din."
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <dl className="grid min-w-0 flex-1 gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-muted-foreground">Navn</dt>
              <dd className="font-medium text-foreground">{fullName}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-muted-foreground">E-post</dt>
              <dd className="font-medium text-foreground">{user.email}</dd>
            </div>
          </dl>

          <Button
            className="self-end sm:shrink-0"
            onClick={logout}
            disabled={logoutPending}
            variant="outline"
          >
            <LogOut data-icon="inline-start" aria-hidden />
            {logoutPending ? "Logger ut..." : "Logg ut"}
          </Button>
        </div>
      </AccountAuthCard>

      <section aria-label="Hurtigvalg" className="grid gap-3 sm:grid-cols-2">
        {QUICK_LINKS.map((item) => (
          <AccountQuickLinkCard
            key={item.href}
            href={item.href}
            title={item.title}
            description={item.description}
            icon={item.icon}
          />
        ))}
        <AccountSuggestionsCard />
      </section>
    </div>
  );
}
