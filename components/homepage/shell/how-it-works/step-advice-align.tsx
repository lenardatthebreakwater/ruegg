"use client";

import Image from "next/image";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

const ADVISOR_IMAGE = "/images/homepage/shell/advice-advisor.avif";
const ADVISOR_ALT =
  "Rüegg-rådgiver i polo-skjorte — klar til å hjelpe med peisvalg og tilbud";

type StepAdviceAlignProps = {
  progress: MotionValue<number>;
};

/** Single advisor portrait, centered in the visual column. */
export function StepAdviceAlign({ progress }: StepAdviceAlignProps) {
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 0.7], ["8%", "0%"]);
  const scale = useTransform(progress, [0, 0.7], [1.04, 1]);
  const opacity = useTransform(progress, [0, 0.2, 0.7], [0.35, 1, 1]);

  if (reduce) {
    return (
      <div className="mx-auto w-[14rem] md:w-[16rem]" aria-hidden>
        <AdvisorPortrait />
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto w-[14rem] overflow-hidden md:w-[16rem]"
      style={{ opacity, y, scale }}
      aria-hidden
    >
      <AdvisorPortrait />
    </motion.div>
  );
}

function AdvisorPortrait() {
  return (
    <div className="relative overflow-hidden rounded-sm border border-[color:var(--ruegg-swiss-border)] bg-[color:var(--ruegg-swiss-cream)] shadow-[0_12px_40px_-24px_rgba(57,54,35,0.45)]">
      <Image
        src={ADVISOR_IMAGE}
        alt={ADVISOR_ALT}
        width={256}
        height={340}
        className="h-[17rem] w-full object-cover object-[center_12%] md:h-[19rem]"
        sizes="256px"
      />
      <p className="absolute inset-x-0 bottom-0 bg-[color:var(--ruegg-swiss-ink)]/70 px-2 py-1.5 text-center text-[10px] uppercase tracking-[0.14em] text-[color:var(--ruegg-swiss-paper)]">
        Rådgiver
      </p>
    </div>
  );
}
