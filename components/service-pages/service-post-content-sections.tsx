import { ContainedLayout } from "@/components/layout/contained-layout";
import type { ServicePostContentSection } from "@/lib/data/service-pages";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";

type ServicePostContentSectionsProps = {
  sections: ServicePostContentSection[];
};

export function ServicePostContentSections({
  sections,
}: ServicePostContentSectionsProps) {
  const visibleSections = sections.filter(
    (section) => section.title.trim().length > 0 || section.description.trim().length > 0
  );
  if (visibleSections.length === 0) return null;

  return (
    <section className={`border-b border-border bg-background ${PAGE_SECTION_PY}`}>
      <ContainedLayout as="div">
        <div className="mx-auto max-w-3xl space-y-10">
          {visibleSections.map((section) => (
            <article key={section.id} className="space-y-3">
              {section.title ? (
                <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {section.title}
                </h2>
              ) : null}
              {section.description ? (
                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {section.description}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </ContainedLayout>
    </section>
  );
}
