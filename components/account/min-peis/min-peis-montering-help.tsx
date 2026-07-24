"use client";

import { useState } from "react";
import { ChevronDown, Hammer } from "lucide-react";
import { ContactSection } from "@/components/homepage/contact-section";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconBadge } from "@/components/ui/icon-badge";
import { isWithinMonteringHelpWindow } from "@/lib/account/min-peis-montering-window";
import { CONTACT_FORM_PLACEMENTS } from "@/lib/analytics/contact-form-placements";
import { cn } from "@/lib/utils";

type MinPeisMonteringHelpProps = {
  peisName: string;
  ownedSinceDate: string;
};

function buildMonteringDefaultMessage(peisName: string): string {
  return `Hei! Jeg trenger hjelp med montering av ${peisName} som jeg nylig kjøpte av dere.`;
}

export function MinPeisMonteringHelp({
  peisName,
  ownedSinceDate,
}: MinPeisMonteringHelpProps) {
  const [open, setOpen] = useState(false);

  if (!isWithinMonteringHelpWindow(ownedSinceDate)) {
    return null;
  }

  return (
    <section
      aria-labelledby="min-peis-montering-help-heading"
      className="overflow-hidden rounded-xl border border-primary/20 bg-primary/[0.04]"
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-6">
          <div className="flex min-w-0 items-start gap-3">
            <IconBadge
              icon={Hammer}
              className="mt-0.5 size-9 rounded-lg sm:size-10"
              iconClassName="size-4 sm:size-5"
            />
            <div className="space-y-1">
              <h2
                id="min-peis-montering-help-heading"
                className="text-base font-medium text-foreground"
              >
                Trenger du hjelp med montering?
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Du har nylig fått peisen — send oss en melding her, så hjelper
                vi deg videre uten å forlate Min peis.
              </p>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant={open ? "outline" : "default"}
              size="sm"
              className="shrink-0 self-start sm:self-center"
              aria-expanded={open}
            >
              {open ? "Skjul skjema" : "Få hjelp med montering"}
              <ChevronDown
                data-icon="inline-end"
                className={cn(
                  "transition-transform duration-200",
                  open && "rotate-180"
                )}
                aria-hidden
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="border-t border-primary/15">
            <ContactSection
              formId={CONTACT_FORM_PLACEMENTS.minPeisMontering.formId}
              formName={CONTACT_FORM_PLACEMENTS.minPeisMontering.formName}
              defaultMessage={buildMonteringDefaultMessage(peisName)}
              productName={peisName}
              embedded
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
