import { ShellReveal } from "@/components/homepage/shell/shell-reveal";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { SHELL_CONTENT_MAX } from "@/lib/page-rhythm";

/** Short reassurance - advice/follow-up, not money-back shop speak. */
export function HomeShellGuarantee() {
  return (
    <section
      id="trygghet"
      aria-labelledby="trygghet-heading"
      className="border-b border-[color:var(--ruegg-swiss-border)] bg-[color:var(--ruegg-swiss-taupe)]/15 py-14 md:py-16"
    >
      <ContainedLayout as="div" className={SHELL_CONTENT_MAX}>
        <ShellReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="trygghet-heading"
              className="font-display text-xl font-medium tracking-tight text-[color:var(--ruegg-swiss-ink)] sm:text-2xl"
            >
              Trygghet underveis
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[color:var(--ruegg-swiss-muted)]">
              Vi gir ærlig råd før du bestemmer deg, og følger opp etter
              montasje. Slik at du skal føle deg trygg i hele prosessen.
            </p>
          </div>
        </ShellReveal>
      </ContainedLayout>
    </section>
  );
}
