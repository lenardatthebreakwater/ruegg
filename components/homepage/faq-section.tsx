"use client";

import { motion, type Variants } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccentCard } from "@/components/editorial";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { SectionIntro, type SectionIntroAlign } from "@/components/section-intro";
import type { FAQItem } from "@/lib/data/homepage";
import { PAGE_SECTION_PY, SECTION_INTRO_BLOCK_MARGIN, HOME_PAGE_GRID_GAP } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

const FAQ_COLUMN_COUNT = 6;
const faqColumnMotion: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: "easeOut" },
  },
};

type FAQColumnLayout = "auto" | "single";

type FAQSectionProps = {
  items: FAQItem[];
  title?: string;
  description?: string;
  align?: SectionIntroAlign;
  /** `"single"` always uses one accordion column (all items). Default matches homepage split when there are more than six items. */
  columnLayout?: FAQColumnLayout;
};

export function FAQSection({
  items,
  title = "Ofte stilte spørsmål",
  description = "Svar på de vanligste spørsmålene om peiser, montering og levering.",
  align = "center",
  columnLayout = "auto",
}: FAQSectionProps) {
  const faqItems =
    columnLayout === "single"
      ? items
      : items.slice(0, FAQ_COLUMN_COUNT * 2);
  const firstColumn =
    columnLayout === "single"
      ? faqItems
      : faqItems.slice(0, FAQ_COLUMN_COUNT);
  const secondColumn =
    columnLayout === "single" ? [] : faqItems.slice(FAQ_COLUMN_COUNT);
  const hasSecondColumn = secondColumn.length > 0;
  const leftDefault = firstColumn[0]?.id;

  return (
    <section
      className={cn("border-b border-border bg-muted/20", PAGE_SECTION_PY)}
    >
      <ContainedLayout as="div">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={SECTION_INTRO_BLOCK_MARGIN}
        >
          <SectionIntro title={title} description={description} align={align} />
        </motion.div>

        <div
          className={cn(
            "grid grid-cols-1",
            HOME_PAGE_GRID_GAP,
            hasSecondColumn ? "lg:grid-cols-2" : "lg:grid-cols-1",
          )}
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={faqColumnMotion}
          >
            <AccentCard className="w-full p-2">
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue={leftDefault}
              >
                {firstColumn.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border-border/60"
                  >
                    <AccordionTrigger className="px-5 text-base text-foreground">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 text-base text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccentCard>
          </motion.div>

          {hasSecondColumn ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={faqColumnMotion}
            >
              <AccentCard className="w-full p-2">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                >
                  {secondColumn.map((item) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      className="border-border/60"
                    >
                      <AccordionTrigger className="px-5 text-base text-foreground">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-5 text-base text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccentCard>
            </motion.div>
          ) : null}
        </div>
      </ContainedLayout>
    </section>
  );
}
