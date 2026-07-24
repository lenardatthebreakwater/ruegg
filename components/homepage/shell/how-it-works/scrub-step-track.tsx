"use client";

import { useGsapScrollProgress } from "@/lib/hooks/use-gsap-scroll-progress";
import { cn } from "@/lib/utils";

import { StepBody } from "./step-body";

const TONE_PANEL: Record<"paper" | "cream" | "deep", string> = {
  paper: "bg-[color:var(--ruegg-swiss-paper)]",
  cream: "bg-[color:var(--ruegg-swiss-cream)]",
  deep: "border-[color:var(--ruegg-swiss-deep)] bg-[color:var(--ruegg-swiss-deep)]",
};

type ScrubStepTrackProps = {
  index: number;
  title: string;
  body: string;
  tone: "paper" | "cream" | "deep";
  visual: "carousel" | "advice" | "assembly";
  reduce: boolean;
};

/**
 * Sticky cover-stack + tall scrub track.
 * Outer track feeds 0→1 progress; inner panel sticks and gets covered by the next step.
 * No scale transforms (those broke the handoff).
 */
export function ScrubStepTrack({
  index,
  title,
  body,
  tone,
  visual,
  reduce,
}: ScrubStepTrackProps) {
  const { setTrackRef, progress } = useGsapScrollProgress(!reduce);

  const panelTone = cn(
    "border-t border-[color:var(--ruegg-swiss-border)]",
    TONE_PANEL[tone],
  );

  if (reduce) {
    return (
      <li className={cn("list-none py-16 md:py-20", panelTone)}>
        <StepBody
          index={index}
          title={title}
          body={body}
          tone={tone}
          visual={visual}
          progress={progress}
        />
      </li>
    );
  }

  return (
    <li ref={setTrackRef} className="relative h-[170lvh] list-none">
      <article
        className={cn(
          "sticky top-0 flex h-[100lvh] items-center overflow-hidden",
          panelTone,
        )}
        style={{ zIndex: index + 1 }}
      >
        <StepBody
          index={index}
          title={title}
          body={body}
          tone={tone}
          visual={visual}
          progress={progress}
        />
      </article>
    </li>
  );
}
