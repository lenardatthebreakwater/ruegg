"use client";

import { motion } from "motion/react";
import { BestSellingProductsCarousel } from "@/components/products/best-selling-products-carousel";
import { ProductCarouselSkeleton } from "@/components/products/product-carousel-skeleton";
import { ContainedLayout } from "@/components/layout/contained-layout";
import type { SectionIntroAlign } from "@/components/section-intro";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import type { Product } from "@/lib/types/product";
import { cn } from "@/lib/utils";

type BestSellingSectionProps = {
  products: Product[];
  title?: string;
  description?: string;
  align?: SectionIntroAlign;
  loading?: boolean;
};

export function BestSellingSection({
  products,
  title = "Bestselgere",
  description,
  align = "left",
  loading = false,
}: BestSellingSectionProps) {
  return (
    <section className={cn("border-b border-border", PAGE_SECTION_PY)}>
      <ContainedLayout as="div">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        >
          {loading ? (
            <ProductCarouselSkeleton
              title={title}
              hasDescription={Boolean(description)}
            />
          ) : (
            <BestSellingProductsCarousel
              products={products}
              title={title}
              description={description}
              align={align}
            />
          )}
        </motion.div>
      </ContainedLayout>
    </section>
  );
}
