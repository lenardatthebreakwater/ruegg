"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CookieConsentValue } from "@/lib/cookie-consent";
import {
  cookieConsentCategoryLabels,
  cookieConsentDialogContent,
} from "@/components/cookie-consent/cookie-consent-content";

type CookieConsentSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consent: CookieConsentValue;
  onConsentChange: (nextValue: CookieConsentValue) => void;
  onReject: () => void;
  onAllowSelection: () => void;
  onAllowAll: () => void;
};

type OptionalCookieCategory = "preferences" | "statistics" | "marketing";

function OptionalCategorySwitch({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Card className="rounded-lg border border-border bg-card shadow-xs">
      <CardContent className="flex flex-col items-center gap-3 px-4 py-4 text-center">
        <p className="text-sm font-medium">{label}</p>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label={label}
        />
      </CardContent>
    </Card>
  );
}

export function CookieConsentSettingsDialog({
  open,
  onOpenChange,
  consent,
  onConsentChange,
  onReject,
  onAllowSelection,
  onAllowAll,
}: CookieConsentSettingsDialogProps) {
  function updateOptionalCategory(category: OptionalCookieCategory, checked: boolean) {
    onConsentChange({
      ...consent,
      necessary: true,
      [category]: checked,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(100vw-2rem,64rem)] max-w-4xl gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Cookie-innstillinger</DialogTitle>
        <DialogDescription className="sr-only">
          Administrer hvilke cookie-kategorier du vil tillate.
        </DialogDescription>

        <Tabs defaultValue="consent" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-none border-b bg-transparent p-0">
            <TabsTrigger value="consent" className="rounded-none py-4">
              {cookieConsentDialogContent.tabs.consent}
            </TabsTrigger>
            <TabsTrigger value="details" className="rounded-none py-4">
              {cookieConsentDialogContent.tabs.details}
            </TabsTrigger>
            <TabsTrigger value="about" className="rounded-none py-4">
              {cookieConsentDialogContent.tabs.about}
            </TabsTrigger>
          </TabsList>

          <div className="h-[30rem] overflow-hidden">
            <TabsContent value="consent" className="h-full overflow-y-auto p-0">
              <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                  <p className="text-2xl font-semibold">{cookieConsentDialogContent.consent.heading}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {cookieConsentDialogContent.consent.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="rounded-lg border border-border bg-card shadow-xs">
                    <CardContent className="flex flex-col items-center gap-3 px-4 py-4 text-center">
                      <p className="text-sm font-medium">
                        {cookieConsentCategoryLabels.necessary}
                      </p>
                      <Switch
                        checked
                        disabled
                        aria-label={cookieConsentCategoryLabels.necessary}
                      />
                    </CardContent>
                  </Card>
                  <OptionalCategorySwitch
                    label={cookieConsentCategoryLabels.preferences}
                    checked={consent.preferences}
                    onCheckedChange={(checked) =>
                      updateOptionalCategory("preferences", checked)
                    }
                  />
                  <OptionalCategorySwitch
                    label={cookieConsentCategoryLabels.statistics}
                    checked={consent.statistics}
                    onCheckedChange={(checked) =>
                      updateOptionalCategory("statistics", checked)
                    }
                  />
                  <OptionalCategorySwitch
                    label={cookieConsentCategoryLabels.marketing}
                    checked={consent.marketing}
                    onCheckedChange={(checked) =>
                      updateOptionalCategory("marketing", checked)
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="h-full overflow-y-auto px-6 py-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{cookieConsentDialogContent.details.heading}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {cookieConsentDialogContent.details.intro}
                  </p>
                </div>
                <div className="grid gap-3">
                  {cookieConsentDialogContent.details.categories.map((category) => (
                    <Card
                      key={category.key}
                      className="rounded-lg border border-border bg-card shadow-xs"
                    >
                      <CardContent className="space-y-2 px-4 py-4">
                        <p className="text-sm font-semibold">
                          {cookieConsentCategoryLabels[category.key]}
                        </p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="about" className="h-full overflow-y-auto px-6 py-8">
              <div className="space-y-4">
                <p className="text-lg font-semibold">{cookieConsentDialogContent.about.heading}</p>
                <div className="space-y-3">
                  {cookieConsentDialogContent.about.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <Link
                  href={cookieConsentDialogContent.about.privacyLinkHref}
                  className="inline-flex text-sm font-medium underline underline-offset-4"
                >
                  {cookieConsentDialogContent.about.privacyLinkLabel}
                </Link>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="grid grid-cols-1 gap-2 border-t p-4 sm:grid-cols-3">
          <Button type="button" variant="outline" onClick={onReject}>
            {cookieConsentDialogContent.actions.reject}
          </Button>
          <Button type="button" variant="outline" onClick={onAllowSelection}>
            {cookieConsentDialogContent.actions.allowSelection}
          </Button>
          <Button type="button" onClick={onAllowAll}>
            {cookieConsentDialogContent.actions.allowAll}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
