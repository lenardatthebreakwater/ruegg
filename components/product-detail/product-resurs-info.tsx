"use client";

import Link from "next/link";
import { ArrowUpRight, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EDITORIAL_SECONDARY_TEXT_CLASS } from "@/components/editorial";
import { cn } from "@/lib/utils";

type ProductResursInfoProps = {
  monthlyAmountLabel: string | null;
  className?: string;
};

function ResursInfoBody() {
  return (
    <div className={cn("space-y-4 text-xs", EDITORIAL_SECONDARY_TEXT_CLASS)}>
      <p>
        Ønsker du å handle med Resurs bank? Legg produktene du ønsker i handlekurven og gå
        til checkout som vanlig.
      </p>
      <p>
        Velg &quot;Resurs bank&quot; som din betalingsmetode og fullfør alle stegene. Her er
        noen eksempler på hvordan nedbetalingen kan se ut, inkludert effektiv rente:
      </p>

      <div className="space-y-2">
        <p className="font-semibold text-foreground">Eksempel 1: Handle for 10 000 kr</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Nedbetalingstid: 24 måneder</li>
          <li>Månedsbeløp: (10 000 kr ÷ 24) + 79 kr = 495,67 kr per måned</li>
          <li>Totalkostnad: 495,67 kr × 24 måneder = 11 896 kr</li>
          <li>Effektiv rente: 14,9 %</li>
        </ul>
      </div>

      <div className="space-y-2">
        <p className="font-semibold text-foreground">Eksempel 2: Handle for 20 000 kr</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Nedbetalingstid: 24 måneder</li>
          <li>Månedsbeløp: (20 000 kr ÷ 24) + 79 kr = 912,33 kr per måned</li>
          <li>Totalkostnad: 912,33 kr × 24 måneder = 21 896 kr</li>
          <li>Effektiv rente: 7,7 %</li>
        </ul>
      </div>

      <p>
        Merk: Effektiv rente varierer avhengig av lånebeløp og nedbetalingstid. Beregningene
        over er basert på standard forutsetninger.
      </p>

      <Button asChild variant="link" className="h-auto gap-1 p-0">
        <Link
          href="/resurs-bank/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Klikk her for å se vilkår
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}

/** Same Button hover (scale + shine) as ATC / Spør en ekspert / variation pills. */
const resursTriggerClassName =
  "h-auto w-full justify-start gap-2.5 rounded-xl border-primary/20 bg-primary/[0.03] px-3 py-2.5 text-left font-normal whitespace-normal shadow-xs ring-1 ring-foreground/5 hover:bg-primary/[0.06] dark:border-primary/25 dark:bg-card/80 dark:hover:bg-primary/10";

const RESURS_LOGO_SRC = "/images/payment/resurs.svg";
const RESURS_LOGO_DARK_SRC = "/images/payment/resurs-dark.svg";

function ResursTriggerContent({ monthlyAmountLabel }: { monthlyAmountLabel: string }) {
  return (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/15 bg-primary/[0.04] dark:bg-primary/10">
        {/* eslint-disable-next-line @next/next/no-img-element -- local brand SVGs; light/dark wordmark swap */}
        <img
          src={RESURS_LOGO_SRC}
          alt=""
          width={40}
          height={24}
          className="h-5 w-auto max-w-[1.85rem] object-contain dark:hidden"
          decoding="async"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- local brand SVGs; light/dark wordmark swap */}
        <img
          src={RESURS_LOGO_DARK_SRC}
          alt=""
          width={40}
          height={24}
          className="hidden h-5 w-auto max-w-[1.85rem] object-contain dark:block"
          decoding="async"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold leading-tight text-foreground">
          {monthlyAmountLabel}
        </span>
        <span className={cn("block text-[11px]", EDITORIAL_SECONDARY_TEXT_CLASS)}>
          0% rente • 0 etablering • via Resurs
        </span>
      </span>
      <CircleHelp
        className={cn("ml-auto size-4 shrink-0", EDITORIAL_SECONDARY_TEXT_CLASS)}
      />
    </>
  );
}

export function ProductResursInfo({ monthlyAmountLabel, className }: ProductResursInfoProps) {
  if (!monthlyAmountLabel) return null;

  return (
    <>
      <div className={cn("hidden md:block", className)}>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className={resursTriggerClassName}>
              <ResursTriggerContent monthlyAmountLabel={monthlyAmountLabel} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Delbetaling med Resurs Bank</DialogTitle>
              <DialogDescription className="sr-only">
                Informasjon om delbetaling med Resurs Bank.
              </DialogDescription>
            </DialogHeader>
            <ResursInfoBody />
          </DialogContent>
        </Dialog>
      </div>

      <div className={cn("md:hidden", className)}>
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className={resursTriggerClassName}>
              <ResursTriggerContent monthlyAmountLabel={monthlyAmountLabel} />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Delbetaling med Resurs Bank</SheetTitle>
              <SheetDescription className="sr-only">
                Informasjon om delbetaling med Resurs Bank.
              </SheetDescription>
            </SheetHeader>
            <div className="px-1 pb-2">
              <ResursInfoBody />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
