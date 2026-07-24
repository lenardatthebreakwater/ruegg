import Image from "next/image";
import type { BlogSection } from "@/lib/blog/types";
import { demoteHeadings } from "@/lib/html/demote-headings";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { cn } from "@/lib/utils";

type BlogPostSectionsProps = {
  sections: BlogSection[];
  /** When true, skip outer ContainedLayout (parent provides the grid column). */
  flush?: boolean;
};

export function BlogPostSections({
  sections,
  flush = false,
}: BlogPostSectionsProps) {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-16 md:space-y-24">
      {sections.map((section, index) => (
        <BlogPostSection
          key={section.slot}
          section={section}
          breakoutImage={index % 3 === 1}
          flush={flush}
        />
      ))}
    </div>
  );
}

function BlogPostSection({
  section,
  breakoutImage,
  flush,
}: {
  section: BlogSection;
  breakoutImage: boolean;
  flush: boolean;
}) {
  const prose = (
    <>
      {section.heading ? (
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {section.heading}
        </h2>
      ) : null}
      {section.html ? (
        <div
          className={cn(
            "prose prose-neutral dark:prose-invert mt-4 max-w-none text-muted-foreground",
            "prose-headings:font-display prose-headings:text-foreground",
            "prose-p:text-muted-foreground prose-li:text-muted-foreground",
            "prose-li:marker:text-primary",
            "prose-strong:text-foreground prose-a:text-primary",
            section.heading ? "" : "mt-0"
          )}
          dangerouslySetInnerHTML={{ __html: demoteHeadings(section.html) }}
        />
      ) : null}
    </>
  );

  const imageFigure = section.image ? (
    <figure className="relative aspect-[3/2] overflow-hidden rounded-2xl">
      <Image
        src={section.image.url}
        alt={section.image.alt ?? section.heading ?? ""}
        fill
        className="object-cover"
        sizes={
          breakoutImage
            ? "(max-width: 1024px) 100vw, 1024px"
            : "(max-width: 768px) 100vw, 65ch"
        }
      />
    </figure>
  ) : null;

  if (flush) {
    return (
      <section className={cn(!breakoutImage && "max-w-[65ch]")}>
        {prose}
        {imageFigure ? <div className="mt-8">{imageFigure}</div> : null}
      </section>
    );
  }

  return (
    <section>
      <ContainedLayout className="max-w-[65ch]">{prose}</ContainedLayout>
      {imageFigure ? (
        <ContainedLayout
          className={cn("mt-8", breakoutImage ? "max-w-5xl" : "max-w-[65ch]")}
        >
          {imageFigure}
        </ContainedLayout>
      ) : null}
    </section>
  );
}
