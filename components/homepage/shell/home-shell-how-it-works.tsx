"use client";

import { useReducedMotion } from "motion/react";

import { ContainedLayout } from "@/components/layout/contained-layout";
import { SHELL_CONTENT_MAX } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

import { ScrubStepTrack } from "./how-it-works/scrub-step-track";

const STEPS = [
  {
    title: "Velg modell",
    body: "Utforsk peistyper og finn kandidater som passer hjemmet eller prosjektet ditt.",
    tone: "paper" as const,
    visual: "carousel" as const,
  },
  {
    title: "Få råd og tilbud",
    body: "Ta kontakt. Vi hjelper med valg, dimensjonering og et uforpliktende tilbud.",
    tone: "cream" as const,
    visual: "advice" as const,
  },
  {
    title: "Montering",
    body: "Vi følger opp med montering og praktiske neste steg, slik at du føler deg trygg.",
    tone: "deep" as const,
    visual: "assembly" as const,
  },
] as const;

/** Sticky step stack with scroll-scrubbed visuals. */
export function HomeShellHowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section
      id="slik-fungerer-det"
      aria-labelledby="slik-fungerer-det-heading"
      className="border-b border-[color:var(--ruegg-swiss-border)] bg-[color:var(--ruegg-swiss-paper)]"
    >
      <ContainedLayout
        as="div"
        className={cn(SHELL_CONTENT_MAX, "pt-20 md:pt-28 lg:pt-32")}
      >
        <div className="max-w-2xl pb-10 md:pb-14">
          <h2
            id="slik-fungerer-det-heading"
            className="font-display text-2xl font-medium tracking-tight text-[color:var(--ruegg-swiss-ink)] sm:text-3xl"
          >
            Slik fungerer det
          </h2>
          <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-[color:var(--ruegg-swiss-muted)]">
            Fra modell til montering. Tre steg, uten handlekurv.
          </p>
        </div>
      </ContainedLayout>

      <ol className="relative m-0 list-none p-0">
        {STEPS.map((item, index) => (
          <ScrubStepTrack
            key={item.title}
            index={index}
            title={item.title}
            body={item.body}
            tone={item.tone}
            visual={item.visual}
            reduce={Boolean(reduce)}
          />
        ))}
      </ol>
    </section>
  );
}
