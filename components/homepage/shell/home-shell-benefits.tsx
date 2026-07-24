import { Flame, HandHeart, Home, MapPinned } from "lucide-react";

import { ShellReveal } from "@/components/homepage/shell/shell-reveal";
import { ShellSectionFrame } from "@/components/homepage/shell/shell-section-frame";

const BENEFITS = [
  {
    title: "Riktig peis til rommet",
    body: "Vi hjelper deg velge modell etter bolig, behov og stil.",
    icon: Home,
  },
  {
    title: "Sveitsisk håndverk",
    body: "Materialer og finish bygget for lang levetid.",
    icon: Flame,
  },
  {
    title: "Personlig veiledning",
    body: "Råd før du bestemmer deg, uten kjøpspress.",
    icon: HandHeart,
  },
  {
    title: "Oppfølging i Norge",
    body: "Kontakt og støtte gjennom hele prosessen.",
    icon: MapPinned,
  },
] as const;

/** Benefits band - staggered reveal, hairline rows (not equal card grid). */
export function HomeShellBenefits() {
  return (
    <ShellSectionFrame
      id="fordeler"
      title="Hvorfor Rüegg"
      description="Kvalitet, råd og oppfølging for hjem og prosjekt."
    >
      <ul className="grid gap-0 border-t border-[color:var(--ruegg-swiss-border)] md:grid-cols-2">
        {BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <ShellReveal key={benefit.title} delay={index * 0.06}>
              <li
                className="flex gap-4 border-b border-[color:var(--ruegg-swiss-border)] py-8 md:px-6 md:odd:border-r"
              >
                <span
                  data-icon-badge
                  className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[color:var(--ruegg-swiss-cream)] text-[color:var(--ruegg-swiss-ink)]"
                  aria-hidden
                >
                  <Icon className="size-5" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-medium text-[color:var(--ruegg-swiss-ink)]">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-[color:var(--ruegg-swiss-muted)] sm:text-base">
                    {benefit.body}
                  </p>
                </div>
              </li>
            </ShellReveal>
          );
        })}
      </ul>
    </ShellSectionFrame>
  );
}
