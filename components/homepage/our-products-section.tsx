"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { StaticPicture } from "@/components/media/static-picture";
import { SectionIntro } from "@/components/section-intro";
import { Button } from "@/components/ui/button";
import type { HomepageProductCard } from "@/lib/data/homepage";
import { PAGE_SECTION_PY, SECTION_INTRO_BLOCK_MARGIN, HOME_PAGE_GRID_GAP } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

type OurProductsSectionProps = {
  products: HomepageProductCard[];
};

const productRevealEase = "cubic-bezier(0.22, 1, 0.36, 1)";

const productCardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

function isMdOrWider(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches
  );
}

export function OurProductsSection({ products }: OurProductsSectionProps) {
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null,
  );

  function handleCardClick(event: MouseEvent<HTMLElement>, productId: string) {
    if (isMdOrWider()) return;
    if ((event.target as HTMLElement).closest("a")) return;
    setExpandedProductId((current) =>
      current === productId ? null : productId,
    );
  }

  return (
    <section id="vare-produkter" className={cn("border-b border-border", PAGE_SECTION_PY)}>
      <ContainedLayout as="div">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className={SECTION_INTRO_BLOCK_MARGIN}
        >
          <SectionIntro
            title="Våre produkter"
            description="Hos oss finner du et stort utvalg av peisovner, vedovner og andre produkter til peis, ovn og pipe."
            align="center"
          />
        </motion.div>

        <div className={cn("grid sm:grid-cols-2 lg:grid-cols-3", HOME_PAGE_GRID_GAP)}>
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              custom={index}
              variants={productCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              data-expanded={
                expandedProductId === product.id ? "true" : undefined
              }
              aria-expanded={expandedProductId === product.id}
              onClick={(e) => handleCardClick(e, product.id)}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-border shadow-sm md:cursor-default"
            >
              <div className="relative aspect-[4/3] w-full">
                <StaticPicture
                  src={product.imageUrl}
                  alt={product.imageAlt}
                  className="absolute inset-0 size-full object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-black/10 dark:from-black/45 dark:via-black/20 dark:to-black/15"
                />
              </div>

              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[4.5rem] overflow-hidden border-t border-neutral-200/70 bg-white/70 px-4 py-3 text-center shadow-sm backdrop-blur-md transition-[height] duration-700 group-hover:flex group-hover:h-full group-hover:flex-col group-hover:items-center group-hover:justify-center group-hover:gap-3 dark:border-white/10 dark:bg-neutral-950/55 max-md:group-data-[expanded=true]:flex max-md:group-data-[expanded=true]:h-full max-md:group-data-[expanded=true]:flex-col max-md:group-data-[expanded=true]:items-center max-md:group-data-[expanded=true]:justify-center max-md:group-data-[expanded=true]:gap-3"
                style={{ transitionTimingFunction: productRevealEase }}
              >
                  <h3
                    className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-xl font-bold leading-tight text-neutral-900 transition-[transform,opacity] duration-700 group-hover:static group-hover:translate-y-0 dark:text-neutral-100 max-md:group-data-[expanded=true]:static max-md:group-data-[expanded=true]:translate-y-0"
                    style={{ transitionTimingFunction: productRevealEase }}
                  >
                    {product.title}
                  </h3>
                  <div
                    className="grid w-full grid-rows-[0fr] translate-y-5 opacity-0 transition-[grid-template-rows,transform,opacity] duration-700 group-hover:grid-rows-[1fr] group-hover:translate-y-0 group-hover:opacity-100 max-md:group-data-[expanded=true]:grid-rows-[1fr] max-md:group-data-[expanded=true]:translate-y-0 max-md:group-data-[expanded=true]:opacity-100"
                    style={{ transitionTimingFunction: productRevealEase }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="flex flex-col items-center gap-3 pt-3">
                        <p className="w-full text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                          {product.description}
                        </p>
                        <Button
                          asChild
                          className="pointer-events-auto w-fit gap-2"
                        >
                          <Link href={product.ctaHref}>
                            {product.ctaLabel}
                            <ArrowRight data-icon="inline-end" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
              </div>
            </motion.article>
          ))}
        </div>
      </ContainedLayout>
    </section>
  );
}
