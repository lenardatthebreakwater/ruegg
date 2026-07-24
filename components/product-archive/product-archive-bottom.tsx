import Image from "next/image";
import { ArchiveBottomCta } from "@/components/product-archive/archive-bottom-cta";
import { Card } from "@/components/ui/card";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { isContactIntentCta } from "@/lib/contact/is-contact-intent-cta";
import type { TermArchiveBottomBlock } from "@/lib/graphql/types";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

/** Matches archive banner / AccentCard / shadcn Card surface chrome. */
const ARCHIVE_SURFACE =
  "overflow-hidden rounded-xl border border-border/80 ring-1 ring-foreground/5 dark:ring-border";
const ARCHIVE_SURFACE_MUTED = cn(ARCHIVE_SURFACE, "bg-muted shadow-xs");
const ARCHIVE_SURFACE_DARK =
  "overflow-hidden rounded-xl border-0 bg-foreground text-background shadow-none ring-0";

type ProductArchiveBottomProps = {
  blocks: TermArchiveBottomBlock[];
  /**
   * When `contain`, photo slots use object-contain (diagrams already do).
   * Reservedeler archives pass this so oblong images are not cropped.
   */
  imageFit?: "cover" | "contain";
  className?: string;
};

function blockByIndex(
  byIndex: Map<number, TermArchiveBottomBlock>,
  index: number
): TermArchiveBottomBlock | undefined {
  return byIndex.get(index);
}

function hasRenderableContent(block: TermArchiveBottomBlock | undefined): boolean {
  if (!block) return false;
  return Boolean(
    block.imageUrl ||
      block.inspImageUrl ||
      block.textHtml?.trim() ||
      hasArchiveCta(block.linkUrl, block.linkText)
  );
}

function RichText({
  html,
  className,
  tone = "muted",
}: {
  html: string;
  className?: string;
  tone?: "muted" | "onDark" | "default";
}) {
  return (
    <div
      className={cn(
        "prose max-w-none prose-headings:font-display prose-headings:tracking-tight",
        tone === "onDark" &&
          "prose-invert prose-p:text-background/85 prose-headings:text-background prose-a:text-background",
        tone === "muted" &&
          "prose-neutral dark:prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary",
        tone === "default" &&
          "prose-neutral dark:prose-invert prose-headings:text-foreground prose-a:text-primary",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** CTA when WP provides a link, or a contact-intent label (empty URL is OK). */
function hasArchiveCta(linkUrl: string | null, linkText: string | null): boolean {
  const label = linkText?.trim();
  if (!label) return false;
  if (isContactIntentCta(linkUrl, label)) return true;
  return Boolean(linkUrl?.trim());
}

/**
 * Reservedeler / diagram archives: show the technical image as content
 * (width-driven, no dark overlay, no muted letterboxing).
 */
function DiagramBand({
  block,
  align = "start",
  withCta = false,
}: {
  block: TermArchiveBottomBlock;
  align?: "start" | "center";
  withCta?: boolean;
}) {
  const src = block.imageUrl || block.inspImageUrl;
  const hasCta =
    withCta && hasArchiveCta(block.linkUrl, block.linkText);
  const hasText = Boolean(block.textHtml?.trim());

  if (!src && !hasText && !hasCta) return null;

  return (
    <section
      className="bg-background"
      aria-label={src ? "Teknisk oversikt" : undefined}
    >
      {src && (
        <div className="w-full bg-background">
          {/*
            Intrinsic width/height only set Next aspect hint; CSS keeps
            native ratio while filling the viewport width (no letterbox).
          */}
          <Image
            src={src}
            alt="Teknisk oversikt"
            width={1600}
            height={400}
            className="h-auto w-full object-contain"
            sizes="100vw"
            priority={false}
          />
        </div>
      )}
      {(hasText || hasCta) && (
        <ContainedLayout
          as="div"
          className={cn(
            "py-10 sm:py-12",
            align === "center" && "text-center"
          )}
        >
          <div
            className={cn(
              "max-w-2xl",
              align === "center" && "mx-auto",
              align === "start" && "md:max-w-xl"
            )}
          >
            {block.textHtml && (
              <RichText html={block.textHtml} tone="muted" />
            )}
            {hasCta && block.linkText && (
              <div
                className={cn(
                  hasText && "mt-8",
                  align === "center" && "flex justify-center"
                )}
              >
                <ArchiveBottomCta
                  linkText={block.linkText}
                  linkUrl={block.linkUrl}
                />
              </div>
            )}
          </div>
        </ContainedLayout>
      )}
    </section>
  );
}

function FullBleedBand({
  block,
  imageFit,
  align = "start",
  withCta = false,
}: {
  block: TermArchiveBottomBlock;
  imageFit: "cover" | "contain";
  align?: "start" | "center";
  withCta?: boolean;
}) {
  // Contain fit = spare-part diagrams — never use the marketing haze/letterbox.
  if (imageFit === "contain") {
    return <DiagramBand block={block} align={align} withCta={withCta} />;
  }

  const bg = block.imageUrl || block.inspImageUrl;
  const hasCta =
    withCta && hasArchiveCta(block.linkUrl, block.linkText);

  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2">
        {bg ? (
          <>
            <Image
              src={bg}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority={false}
            />
            <div
              className={cn(
                "absolute inset-0",
                align === "center"
                  ? "bg-foreground/55"
                  : "bg-gradient-to-r from-foreground/80 via-foreground/55 to-foreground/25"
              )}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-foreground" />
        )}
      </div>

      <ContainedLayout
        as="div"
        className={cn(
          "relative z-10 py-16 sm:py-20 md:py-24",
          align === "center" && "text-center"
        )}
      >
        <div
          className={cn(
            "max-w-2xl",
            align === "center" && "mx-auto",
            align === "start" && "md:max-w-xl"
          )}
        >
          {block.textHtml && (
            <RichText html={block.textHtml} tone="onDark" />
          )}
          {hasCta && block.linkText && (
            <div className={cn("mt-8", align === "center" && "flex justify-center")}>
              <ArchiveBottomCta
                linkText={block.linkText}
                linkUrl={block.linkUrl}
              />
            </div>
          )}
        </div>
      </ContainedLayout>
    </section>
  );
}

function TwoColumnBand({
  left,
  right,
}: {
  left: TermArchiveBottomBlock;
  right: TermArchiveBottomBlock;
}) {
  return (
    <section className={cn(PAGE_SECTION_PY, "bg-background")}>
      <ContainedLayout as="div">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <Card
            className={cn(
              ARCHIVE_SURFACE_DARK,
              "flex flex-col justify-between gap-6 px-6 py-8 sm:px-8 sm:py-10"
            )}
          >
            {left.textHtml && <RichText html={left.textHtml} tone="onDark" />}
            {left.imageUrl && (
              <div className="relative mt-auto aspect-[16/10] w-full overflow-hidden rounded-lg">
                <Image
                  src={left.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 560px"
                />
              </div>
            )}
          </Card>
          <Card
            className={cn(
              ARCHIVE_SURFACE_MUTED,
              "flex flex-col justify-center gap-4 px-6 py-8 sm:px-8 sm:py-10"
            )}
          >
            {right.textHtml && <RichText html={right.textHtml} tone="default" />}
          </Card>
        </div>
      </ContainedLayout>
    </section>
  );
}

function ThreeColumnBand({
  first,
  second,
  third,
}: {
  first?: TermArchiveBottomBlock;
  second?: TermArchiveBottomBlock;
  third?: TermArchiveBottomBlock;
}) {
  const cells: Array<{
    block: TermArchiveBottomBlock;
    tone: "dark" | "light" | "image";
  }> = [
    first && hasRenderableContent(first)
      ? { block: first, tone: "dark" as const }
      : null,
    second && hasRenderableContent(second)
      ? { block: second, tone: "light" as const }
      : null,
    third && hasRenderableContent(third)
      ? { block: third, tone: "image" as const }
      : null,
  ].filter(
    (cell): cell is { block: TermArchiveBottomBlock; tone: "dark" | "light" | "image" } =>
      cell != null
  );

  if (!cells.length) return null;

  return (
    <section className={cn(PAGE_SECTION_PY, "bg-background")}>
      <ContainedLayout as="div">
        <div
          className={cn(
            "grid grid-cols-1 gap-4 md:gap-5",
            cells.length === 1 && "md:grid-cols-1",
            cells.length === 2 && "md:grid-cols-2",
            cells.length >= 3 && "md:grid-cols-3"
          )}
        >
          {cells.map(({ block, tone }) => {
            const bgImage =
              tone === "image"
                ? block.imageUrl || block.inspImageUrl
                : null;

            return (
              <Card
                key={block.index}
                className={cn(
                  "relative isolate min-h-[220px] gap-0 px-6 py-8 sm:px-7 sm:py-9",
                  tone === "dark" && ARCHIVE_SURFACE_DARK,
                  (tone === "light" || tone === "image") && ARCHIVE_SURFACE_MUTED
                )}
              >
                {bgImage && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    aria-hidden
                  >
                    <Image
                      src={bgImage}
                      alt=""
                      fill
                      className="object-cover opacity-35"
                      sizes="(max-width: 768px) 100vw, 360px"
                    />
                    <div className="absolute inset-0 bg-background/55" />
                  </div>
                )}
                <div className="relative z-10">
                  {block.textHtml && (
                    <RichText
                      html={block.textHtml}
                      tone={tone === "dark" ? "onDark" : "default"}
                    />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </ContainedLayout>
    </section>
  );
}

function FallbackBlockStack({
  blocks,
  imageFit,
}: {
  blocks: TermArchiveBottomBlock[];
  imageFit: "cover" | "contain";
}) {
  if (!blocks.length) return null;

  return (
    <section
      className={cn(PAGE_SECTION_PY, "bg-background")}
      aria-label="Mer om denne samlingen"
    >
      <ContainedLayout as="div" className="flex flex-col gap-10">
        {blocks.map((block) => {
          const photo = block.imageUrl;
          const diagram = block.inspImageUrl;
          const hasLink = hasArchiveCta(block.linkUrl, block.linkText);
          const hasText = Boolean(block.textHtml?.trim());
          if (!photo && !diagram && !hasText && !hasLink) return null;

          return (
            <div key={block.index} className="flex flex-col gap-5">
              {photo &&
                (imageFit === "contain" ? (
                  <div className="w-full overflow-hidden bg-background">
                    <Image
                      src={photo}
                      alt="Illustrasjonsbilde for samlingen"
                      width={1600}
                      height={400}
                      className="h-auto w-full object-contain"
                      sizes="(max-width: 768px) 100vw, 1120px"
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      ARCHIVE_SURFACE_MUTED,
                      "relative aspect-[21/9] w-full"
                    )}
                  >
                    <Image
                      src={photo}
                      alt="Illustrasjonsbilde for samlingen"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 1120px"
                    />
                  </div>
                ))}
              {diagram && diagram !== photo && (
                <div className="w-full overflow-hidden bg-background">
                  <Image
                    src={diagram}
                    alt="Teknisk oversikt"
                    width={1600}
                    height={400}
                    className="h-auto w-full object-contain"
                    sizes="(max-width: 768px) 100vw, 1120px"
                  />
                </div>
              )}
              {hasText && block.textHtml && (
                <RichText html={block.textHtml} tone="muted" />
              )}
              {hasLink && block.linkText && (
                <div>
                  <ArchiveBottomCta
                    linkText={block.linkText}
                    linkUrl={block.linkUrl}
                    variant="outline"
                    size="default"
                  />
                </div>
              )}
            </div>
          );
        })}
      </ContainedLayout>
    </section>
  );
}

/**
 * JetEngine bottom archive slots. Uses a Shopify-era section map when slots
 * 1–7 are present; otherwise falls back to a simple stacked layout (reservedeler).
 * Empty slots are omitted.
 */
export function ProductArchiveBottom({
  blocks,
  imageFit = "cover",
  className,
}: ProductArchiveBottomProps) {
  if (!blocks.length) return null;

  const byIndex = new Map(blocks.map((b) => [b.index, b]));
  const slot1 = blockByIndex(byIndex, 1);
  const slot2 = blockByIndex(byIndex, 2);
  const slot3 = blockByIndex(byIndex, 3);
  const slot4 = blockByIndex(byIndex, 4);
  const slot5 = blockByIndex(byIndex, 5);
  const slot6 = blockByIndex(byIndex, 6);
  const slot7 = blockByIndex(byIndex, 7);

  const structuredIndexes = new Set<number>();
  const useStructured =
    hasRenderableContent(slot1) ||
    hasRenderableContent(slot2) ||
    hasRenderableContent(slot3) ||
    hasRenderableContent(slot4) ||
    hasRenderableContent(slot5) ||
    hasRenderableContent(slot6) ||
    hasRenderableContent(slot7);

  if (!useStructured) {
    return (
      <div className={className}>
        <FallbackBlockStack blocks={blocks} imageFit={imageFit} />
      </div>
    );
  }

  if (hasRenderableContent(slot1)) structuredIndexes.add(1);
  if (hasRenderableContent(slot2) || hasRenderableContent(slot3)) {
    structuredIndexes.add(2);
    structuredIndexes.add(3);
  }
  if (
    hasRenderableContent(slot4) ||
    hasRenderableContent(slot5) ||
    hasRenderableContent(slot6)
  ) {
    structuredIndexes.add(4);
    structuredIndexes.add(5);
    structuredIndexes.add(6);
  }
  if (hasRenderableContent(slot7)) structuredIndexes.add(7);

  const leftover = blocks.filter((b) => !structuredIndexes.has(b.index));

  return (
    <div className={cn("flex flex-col", className)}>
      {hasRenderableContent(slot1) && slot1 && (
        <FullBleedBand block={slot1} imageFit={imageFit} align="start" />
      )}

      {hasRenderableContent(slot2) &&
        hasRenderableContent(slot3) &&
        slot2 &&
        slot3 && <TwoColumnBand left={slot2} right={slot3} />}

      {!(hasRenderableContent(slot2) && hasRenderableContent(slot3)) &&
        (hasRenderableContent(slot2) || hasRenderableContent(slot3)) && (
          <FallbackBlockStack
            blocks={[slot2, slot3].filter(
              (b): b is TermArchiveBottomBlock => hasRenderableContent(b)
            )}
            imageFit={imageFit}
          />
        )}

      {(hasRenderableContent(slot4) ||
        hasRenderableContent(slot5) ||
        hasRenderableContent(slot6)) && (
        <ThreeColumnBand first={slot4} second={slot5} third={slot6} />
      )}

      {hasRenderableContent(slot7) && slot7 && (
        <FullBleedBand
          block={slot7}
          imageFit={imageFit}
          align="center"
          withCta
        />
      )}

      {leftover.length > 0 && (
        <FallbackBlockStack blocks={leftover} imageFit={imageFit} />
      )}
    </div>
  );
}
