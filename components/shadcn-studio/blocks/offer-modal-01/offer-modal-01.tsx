"use client";

import { useState, type ReactNode } from "react";

import { Lightbulb, Mail, Percent, Users } from "lucide-react";

import { IconBadge } from "@/components/ui/icon-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { StaticPicture } from "@/components/media/static-picture";

type OfferModalProps = {
  trigger?: ReactNode;
  defaultOpen?: boolean;
  /** When set, the trigger is wrapped with a hover tooltip (Norwegian for storefront). */
  triggerTooltip?: string;
};

export default function OfferModal({
  defaultOpen = false,
  trigger,
  triggerTooltip,
}: OfferModalProps) {
  const [open, setOpen] = useState(defaultOpen);

  const triggerBranch =
    trigger == null ? null : triggerTooltip != null && triggerTooltip !== "" ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          {triggerTooltip}
        </TooltipContent>
      </Tooltip>
    ) : (
      <DialogTrigger asChild>{trigger}</DialogTrigger>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerBranch}

      <DialogContent
        overlayClassName="duration-500 ease-out"
        className={cn(
          "flex flex-col gap-0 overflow-hidden border-0 p-0 lg:max-h-[min(560px,90vh)] lg:w-[calc(100%-3rem)] lg:max-w-5xl lg:flex-row lg:items-stretch",
          "[&_[data-slot=dialog-close]]:flex [&_[data-slot=dialog-close]]:size-7 [&_[data-slot=dialog-close]]:items-center [&_[data-slot=dialog-close]]:justify-center [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:bg-primary/10",
          // Override default dialog entrance (diagonal zoom @ 200ms): slower left slide only.
          "duration-500 ease-out",
          "data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100",
          "data-[state=open]:slide-in-from-left-8 data-[state=open]:slide-in-from-top-0",
          "data-[state=closed]:slide-out-to-left-8 data-[state=closed]:slide-out-to-top-0"
        )}
      >
        <div className="relative hidden min-h-0 w-[42%] shrink-0 overflow-hidden bg-muted lg:block">
          <StaticPicture
            src="/images/shared/offer-modal/offer-modal-side.webp"
            alt=""
            className="absolute inset-0 size-full object-cover object-center"
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-4 px-6 py-8 text-center sm:py-10 lg:basis-[58%] lg:py-8">
          <div className="flex max-w-md flex-col gap-2">
            <DialogTitle className="text-xl font-semibold sm:text-2xl lg:text-3xl">
              Meld deg på og få 20 % på første ordre
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground sm:text-base">
              Korte mailer med rabatter, tips og nyheter. Ikke støy i innboksen.
            </DialogDescription>
          </div>

          <ul
            className="flex w-full max-w-sm flex-col gap-2.5 text-left text-sm text-foreground"
            aria-label="Dette får du som abonnent"
          >
            <li className="flex items-center gap-3">
              <IconBadge icon={Percent} />
              <span className="font-medium leading-tight">Egne rabatter</span>
            </li>
            <li className="flex items-center gap-3">
              <IconBadge icon={Lightbulb} />
              <span className="font-medium leading-tight">Tips og råd</span>
            </li>
            <li className="flex items-center gap-3">
              <IconBadge icon={Users} />
              <span className="font-medium leading-tight">Noe for alle</span>
            </li>
          </ul>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-md justify-center gap-1.5"
          >
            <div className="w-full max-w-72 space-y-2">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="E-postadresse"
                  className="peer h-10 pr-9"
                  required
                  aria-label="E-postadresse"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 text-muted-foreground peer-disabled:opacity-50">
                  <Mail className="size-4" aria-hidden />
                </div>
              </div>
            </div>
            <Button type="submit" size="lg" className="uppercase">
              Meld meg på
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Checkbox id="accept-terms" className="size-6" />
            <Label htmlFor="accept-terms">
              Ikke vis denne meldingen igjen
            </Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
