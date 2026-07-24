import { ContainedLayout } from "@/components/layout/contained-layout";
import { SectionIntro } from "@/components/section-intro";
import type { HubProseBlock } from "@/lib/data/hub-pages/types";
import { PAGE_SECTION_PY } from "@/lib/page-rhythm";
import { cn } from "@/lib/utils";

type HubProseSectionProps = {
  block: HubProseBlock;
  className?: string;
};

export function HubProseSection({ block, className }: HubProseSectionProps) {
  const { title, paragraphs, bulletItems } = block;

  return (
    <section
      className={cn("border-b border-border", PAGE_SECTION_PY, className)}
      aria-labelledby="hub-prose-heading"
    >
      <ContainedLayout>
        <SectionIntro
          id="hub-prose-heading"
          heading="h2"
          size="section"
          align="left"
          title={title}
          description={
            <>
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {bulletItems && bulletItems.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5">
                  {bulletItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </>
          }
        />
      </ContainedLayout>
    </section>
  );
}
