"use client";

import * as React from "react";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import {
  ProductImageGallery,
  type GalleryImage,
} from "@/components/product-detail/product-image-gallery";
import {
  EDITORIAL_SECONDARY_TEXT_CLASS,
  MetaRubricLabel,
} from "@/components/editorial";
import { SectionIntro } from "@/components/section-intro";
import { SECTION_INTRO_BLOCK_MARGIN } from "@/lib/page-rhythm";
import {
  PDP_BORDERED_PANEL_CLASS,
  PDP_PANEL_TOGGLE_BUTTON_CLASS,
} from "@/components/product-detail/pdp-panel-styles";
import { demoteHeadings } from "@/lib/html/demote-headings";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types/product";

export function hasProductFullSpecification(product: Product): boolean {
  const hasStructured =
    (product.attributes && product.attributes.length > 0) ||
    !!product.weight ||
    !!product.dimensions;
  const hasRichText = !!product.technicalInfo?.trim();
  const hasDocuments = (product.documents?.length ?? 0) > 0;
  return hasStructured || hasRichText || hasDocuments;
}

function TechnicalInfoBlock({ content }: { content: string }) {
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(content);
  if (looksLikeHtml) {
    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none text-foreground/85 prose-headings:text-foreground prose-p:text-foreground/85 prose-strong:text-foreground"
        dangerouslySetInnerHTML={{ __html: demoteHeadings(content) }}
      />
    );
  }
  return (
    <div className={cn("text-sm whitespace-pre-wrap", EDITORIAL_SECONDARY_TEXT_CLASS)}>
      {content}
    </div>
  );
}

export function ProductSpecificationBody({ product }: { product: Product }) {
  const rows: Array<{ label: string; value: string }> = [];

  if (product.weight) rows.push({ label: "Vekt", value: `${product.weight} kg` });
  if (product.dimensions) rows.push({ label: "Dimensjoner", value: product.dimensions });

  if (product.attributes) {
    for (const attr of product.attributes) {
      rows.push({ label: attr.label, value: attr.value });
    }
  }

  const technical = product.technicalInfo?.trim();
  const documents = product.documents ?? [];
  const hasTable = rows.length > 0;
  const hasDocuments = documents.length > 0;

  if (!hasTable && !technical && !hasDocuments) {
    return (
      <p className={cn("text-sm", EDITORIAL_SECONDARY_TEXT_CLASS)}>
        Ingen teknisk informasjon tilgjengelig.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {hasTable ? (
        <div className="overflow-x-auto rounded-xl border border-primary/15 ring-1 ring-foreground/5 dark:border-primary/20">
          <table className="w-full table-fixed text-sm">
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-primary/10 last:border-b-0",
                    i % 2 === 0 ? "bg-primary/[0.03] dark:bg-primary/[0.06]" : "bg-background/80"
                  )}
                >
                  <td className="w-[42%] px-4 py-2.5 align-top font-medium text-foreground sm:w-1/3">
                    {row.label}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 align-top [overflow-wrap:anywhere]",
                      EDITORIAL_SECONDARY_TEXT_CLASS
                    )}
                  >
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {technical ? <TechnicalInfoBlock content={technical} /> : null}
      {hasDocuments ? (
        <div className={cn(PDP_BORDERED_PANEL_CLASS, "p-4")}>
          <MetaRubricLabel className="mb-3">Dokumenter</MetaRubricLabel>
          <ul className="flex list-none flex-col gap-2 p-0">
            {documents.map((doc, i) => (
              <li key={`${doc.url}-${i}`}>
                <Link
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-primary/15 px-3 py-2 text-sm text-foreground transition-colors hover:bg-primary/[0.04] dark:hover:bg-primary/10"
                >
                  {doc.url.endsWith(".pdf") ? (
                    <FileText className="size-4 shrink-0 text-primary" />
                  ) : (
                    <Download className="size-4 shrink-0 text-primary" />
                  )}
                  {doc.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

type ProductFullSpecificationSectionProps = {
  product: Product;
  images: GalleryImage[];
  className?: string;
};

/**
 * Image panel: on small viewports the card height follows the gallery; from md+ it
 * matches the spec column for a two-column layout.
 */
const COLLAPSED_IMAGE_BOX =
  "h-auto w-full min-h-0 md:h-[620px] lg:h-[700px]";

/** Spec panel: fixed preview height until “Vis mer” expands inline. */
const COLLAPSED_SPEC_BOX = "h-[520px] sm:h-[600px] md:h-[620px] lg:h-[700px]";

export function ProductFullSpecificationSection({
  product,
  images,
  className,
}: ProductFullSpecificationSectionProps) {
  const specViewportRef = React.useRef<HTMLDivElement>(null);
  const specContentRef = React.useRef<HTMLDivElement>(null);
  const [needsExpand, setNeedsExpand] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const hasSingleImage = images.length === 1;
  const hasDocuments = (product.documents?.length ?? 0) > 0;

  const sectionDescription = (() => {
    if (hasDocuments && needsExpand && !expanded) {
      return "Tekniske mål, egenskaper og nedlastbare dokumenter. Klikk «Vis mer» for å se filene og resten av spesifikasjonen.";
    }
    if (hasDocuments) {
      return "Tekniske mål, egenskaper og nedlastbare dokumenter samlet på ett sted.";
    }
    if (needsExpand && !expanded) {
      return "Alle tekniske mål, egenskaper og detaljer. Klikk «Vis mer» for å se hele oversikten.";
    }
    return "Alle tekniske mål, egenskaper og detaljer samlet på ett sted.";
  })();

  React.useLayoutEffect(() => {
    const viewport = specViewportRef.current;
    const content = specContentRef.current;
    if (!viewport || !content) return;

    const update = () => {
      // Only measure while collapsed so expand/collapse keeps a stable toggle.
      if (expanded) return;
      const tol = 1;
      setNeedsExpand(content.scrollHeight > viewport.clientHeight + tol);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(viewport);
    ro.observe(content);
    return () => ro.disconnect();
  }, [product, expanded]);

  const imageSlotShell = (child: React.ReactNode) => (
    <div
      className={cn(
        PDP_BORDERED_PANEL_CLASS,
        "relative w-full overflow-hidden",
        expanded ? "h-auto w-full min-h-0" : COLLAPSED_IMAGE_BOX
      )}
    >
      {child}
    </div>
  );

  const specSlotShell = (child: React.ReactNode) => (
    <div
      className={cn(
        PDP_BORDERED_PANEL_CLASS,
        "relative w-full",
        expanded ? "h-auto overflow-visible" : cn("overflow-hidden", COLLAPSED_SPEC_BOX)
      )}
    >
      {child}
    </div>
  );

  return (
    <section className={cn("min-w-0", className)}>
      <SectionIntro
        title="Full spesifikasjon"
        description={sectionDescription}
        align="center"
        className={SECTION_INTRO_BLOCK_MARGIN}
        descriptionClassName={EDITORIAL_SECONDARY_TEXT_CLASS}
        renderTitle={(title) => (
          <span className="flex flex-col items-center gap-2">
            <MetaRubricLabel as="span">Spesifikasjoner</MetaRubricLabel>
            <span>{title}</span>
          </span>
        )}
      />
      <div
        className={cn(
          "grid gap-6",
          images.length > 0 ? "md:grid-cols-2 md:items-start" : "grid-cols-1"
        )}
      >
        {images.length > 0
          ? imageSlotShell(
              <div
                className={cn(
                  "p-3 sm:p-4",
                  hasSingleImage
                    ? expanded
                      ? "h-auto"
                      : "h-auto md:h-full"
                    : "h-auto overflow-visible md:h-full md:overflow-y-auto"
                )}
              >
                <ProductImageGallery
                  images={images}
                  className={
                    hasSingleImage
                      ? expanded
                        ? "h-auto"
                        : "h-auto md:h-full"
                      : "h-auto md:min-h-0"
                  }
                  imageFrameClassName={
                    hasSingleImage
                      ? expanded
                        ? "aspect-[4/3]"
                        : "aspect-[4/3] md:aspect-auto md:h-full"
                      : undefined
                  }
                  preferStaticForSingleImage
                />
              </div>
            )
          : null}
        <div className="min-w-0">
          {specSlotShell(
            <div className="flex h-full min-h-0 flex-col">
              <div
                ref={specViewportRef}
                className={cn(
                  "relative min-h-0 flex-1",
                  expanded ? "overflow-visible" : "overflow-hidden"
                )}
              >
                <div ref={specContentRef} className="px-2 py-2 sm:px-3 sm:py-3">
                  <ProductSpecificationBody product={product} />
                </div>
                {needsExpand && !expanded ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card via-card/90 to-transparent" />
                ) : null}
              </div>
              {needsExpand ? (
                <button
                  type="button"
                  className={cn(PDP_PANEL_TOGGLE_BUTTON_CLASS, "shrink-0")}
                  aria-expanded={expanded}
                  onClick={() => setExpanded((current) => !current)}
                >
                  {expanded ? "Vis mindre" : "Vis mer"}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
