import { ShellReveal } from "@/components/homepage/shell/shell-reveal";
import { ContainedLayout } from "@/components/layout/contained-layout";
import { SHELL_CONTENT_MAX } from "@/lib/page-rhythm";

const TRUST_ITEMS = [
  { label: "Sveitsisk kvalitet", note: "Samme Rüegg som ruegg.swiss" },
  { label: "Siden 1955", note: "Over 70 års peiserfaring" },
  { label: "Håndverk og design", note: "Materialer bygget for levetid" },
  { label: "Råd i Norge", note: "Lokal oppfølging fra start til slutt" },
] as const;

/** Compact trust strip - real claims only, no fake counters. */
export function HomeShellTrustBar() {
  return (
    <section
      id="trust"
      aria-label="Tillit"
      className="border-b border-[color:var(--ruegg-swiss-border)] bg-[color:var(--ruegg-swiss-paper)] py-10 md:py-12"
    >
      <ContainedLayout as="div" className={SHELL_CONTENT_MAX}>
        <ShellReveal>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-8">
            {TRUST_ITEMS.map((item) => (
              <li key={item.label} className="text-left md:text-center">
                <p className="text-sm font-medium text-[color:var(--ruegg-swiss-ink)]">
                  {item.label}
                </p>
                <p className="mt-1 text-sm text-[color:var(--ruegg-swiss-muted)]">
                  {item.note}
                </p>
              </li>
            ))}
          </ul>
        </ShellReveal>
      </ContainedLayout>
    </section>
  );
}
