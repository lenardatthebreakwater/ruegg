"use client";

import { motion } from "motion/react";
import {
  Store,
  Calendar,
  ImageIcon,
  Star,
  PencilRuler,
  type LucideIcon,
} from "lucide-react";
import { StaticPicture } from "@/components/media/static-picture";
import { IconBadge } from "@/components/ui/icon-badge";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { SectionIntro, type SectionIntroAlign } from "@/components/section-intro";
import type { WhyChooseUsItem } from "@/lib/data/homepage";
import { PAGE_SECTION_PY, SECTION_INTRO_BLOCK_MARGIN, HOME_PAGE_GRID_GAP } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

const iconMap: Record<WhyChooseUsItem["iconKey"], LucideIcon> = {
  store: Store,
  years: Calendar,
  installations: ImageIcon,
  rating: Star,
  sketches: PencilRuler,
};

const whyChooseUsCardBackgroundImage =
  "/images/homepage/feature-strip-wood-stove.webp";

const whyChooseUsCardShellClasses =
  "border border-white/20 ring-1 ring-white/10 dark:border-white/10";

type WhyChooseUsSectionProps = {
  items: WhyChooseUsItem[];
  title?: string;
  description?: string;
  align?: SectionIntroAlign;
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35 },
  }),
};

export function WhyChooseUsSection({
  items,
  title = "Hvorfor Rüegg er det beste valget for din vedovn eller peis",
  description = "Sveitsisk kvalitet, moderne design og personlig veiledning.",
  align = "center",
}: WhyChooseUsSectionProps) {
  return (
    <section className={cn("border-b border-border", PAGE_SECTION_PY)}>
      <ContainedLayout as="div">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={SECTION_INTRO_BLOCK_MARGIN}
        >
          <SectionIntro title={title} description={description} align={align} />
        </motion.div>
        <div className={cn("grid sm:grid-cols-2 lg:grid-cols-3", HOME_PAGE_GRID_GAP)}>
          {items.map((point, i) => {
            const Icon = iconMap[point.iconKey];
            return (
              <motion.div
                key={point.id}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className={cn(
                  "relative flex gap-4 overflow-hidden rounded-xl p-6 shadow-sm transition-shadow hover:shadow-md",
                  whyChooseUsCardShellClasses,
                )}
              >
                <StaticPicture
                  src={whyChooseUsCardBackgroundImage}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 z-0 size-full scale-125 object-cover opacity-80 blur-[88px] saturate-125"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 z-[1] bg-white/88 backdrop-blur-md dark:bg-neutral-950/80"
                />
                <div className="relative z-10 flex gap-4">
                  <IconBadge icon={Icon} />
                  <div>
                    <h3 className="font-semibold text-neutral-950 dark:text-neutral-50">
                      {point.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {point.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ContainedLayout>
    </section>
  );
}
