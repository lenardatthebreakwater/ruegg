"use client";

import type { MotionValue } from "motion/react";

import { ContainedLayout } from "@/components/layout/contained-layout";
import { SHELL_CONTENT_MAX } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

import { StepAdviceAlign } from "./step-advice-align";
import { StepAssemblyPeis } from "./step-assembly-peis";
import { StepModelCarousel } from "./step-model-carousel";

type StepBodyProps = {
  index: number;
  title: string;
  body: string;
  tone: "paper" | "cream" | "deep";
  visual: "carousel" | "advice" | "assembly";
  progress: MotionValue<number>;
};

export function StepBody({
  index,
  title,
  body,
  tone,
  visual,
  progress,
}: StepBodyProps) {
  return (
    <ContainedLayout as="div" className={SHELL_CONTENT_MAX}>
      <div className="grid items-center gap-10 py-10 md:grid-cols-2 md:gap-14 md:py-0">
        <div>
          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-end md:gap-10">
            <p
              className={cn(
                "font-display text-7xl font-medium tracking-tight md:text-8xl",
                tone === "deep"
                  ? "text-[color:var(--ruegg-swiss-taupe)]/50"
                  : "text-[color:var(--ruegg-swiss-ink)]/15",
              )}
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </p>
            <div className="max-w-xl pb-2">
              <h3
                className={cn(
                  "font-display text-3xl font-medium tracking-tight md:text-4xl",
                  tone === "deep"
                    ? "text-[color:var(--ruegg-swiss-paper)]"
                    : "text-[color:var(--ruegg-swiss-ink)]",
                )}
              >
                {title}
              </h3>
              <p
                className={cn(
                  "mt-4 max-w-[45ch] text-base leading-relaxed md:text-lg",
                  tone === "deep"
                    ? "text-[color:var(--ruegg-swiss-taupe)]"
                    : "text-[color:var(--ruegg-swiss-muted)]",
                )}
              >
                {body}
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-[14rem] items-center overflow-hidden",
            visual === "advice" ? "justify-center" : "justify-center md:justify-end",
          )}
        >
          {visual === "carousel" && <StepModelCarousel progress={progress} />}
          {visual === "advice" && <StepAdviceAlign progress={progress} />}
          {visual === "assembly" && (
            <StepAssemblyPeis progress={progress} onDeep={tone === "deep"} />
          )}
        </div>
      </div>
    </ContainedLayout>
  );
}
