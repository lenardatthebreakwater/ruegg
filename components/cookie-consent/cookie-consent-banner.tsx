"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ALLOW_ALL_COOKIE_CONSENT,
  COOKIE_CONSENT_NAME,
  DEFAULT_COOKIE_CONSENT,
  consentCookieString,
  type CookieConsentValue,
} from "@/lib/cookie-consent";
import { useMountEffect } from "@/lib/hooks/effect-last";
import { CookieConsentSettingsDialog } from "@/components/cookie-consent/cookie-consent-settings-dialog";
import { cookieConsentBannerContent } from "@/components/cookie-consent/cookie-consent-content";
import { pushConsentToGtm } from "@/lib/analytics/push-consent-to-gtm";

type CookieConsentBannerProps = {
  className?: string;
};

function hasConsentCookie(): boolean {
  if (typeof document === "undefined") return false;
  const cookieName = `${COOKIE_CONSENT_NAME}=`;
  return document.cookie.split(";").some((cookiePart) => cookiePart.trim().startsWith(cookieName));
}

export function CookieConsentBanner({ className }: CookieConsentBannerProps) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [consentSelection, setConsentSelection] = useState<CookieConsentValue>(
    ALLOW_ALL_COOKIE_CONSENT
  );
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useMountEffect(() => {
    setOpen(!hasConsentCookie());
  });

  if (!open) {
    return null;
  }

  function persistAndClose(value: CookieConsentValue) {
    document.cookie = consentCookieString(value);
    pushConsentToGtm(value);
    setSettingsOpen(false);
    setOpen(false);
  }

  return (
    <div
      className={cn(
        "fixed left-4 z-50 w-[min(100vw-2rem,22rem)]",
        isHomepage ? "bottom-20 sm:bottom-4" : "bottom-4",
        className
      )}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <Card size="sm" className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle id="cookie-consent-title" className="text-base">
            {cookieConsentBannerContent.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p
            id="cookie-consent-desc"
            className="text-sm leading-relaxed text-foreground/80 dark:text-muted-foreground"
          >
            {cookieConsentBannerContent.description}
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
          <Button
            type="button"
            size="sm"
            className="min-w-[5rem]"
            onClick={() => persistAndClose(ALLOW_ALL_COOKIE_CONSENT)}
          >
            Tillat
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-w-[5rem]"
            onClick={() => setSettingsOpen(true)}
          >
            Innstillinger
          </Button>
        </CardFooter>
      </Card>
      <CookieConsentSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        consent={consentSelection}
        onConsentChange={setConsentSelection}
        onReject={() => persistAndClose(DEFAULT_COOKIE_CONSENT)}
        onAllowSelection={() => persistAndClose(consentSelection)}
        onAllowAll={() => persistAndClose(ALLOW_ALL_COOKIE_CONSENT)}
      />
    </div>
  );
}
