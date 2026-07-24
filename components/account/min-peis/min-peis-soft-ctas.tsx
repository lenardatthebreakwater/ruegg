import Link from "next/link";
import {
  AirVent,
  Flame,
  Hammer,
  MessageCircle,
} from "lucide-react";

export function MinPeisSoftCtas() {
  const ctas = [
    {
      href: "/montering/",
      title: "Montering",
      description: "Trygg montering av peis og ovn.",
      icon: Hammer,
    },
    {
      href: "/piperehabilitering/",
      title: "Piperehabilitering",
      description: "Bedre trekk og trygg fyring.",
      icon: AirVent,
    },
    {
      href: "/fyringsveiledning/",
      title: "Fyringsveiledning",
      description: "Korte råd for effektiv fyring.",
      icon: Flame,
    },
    {
      href: "/kontakt-oss/",
      title: "Spør en ekspert",
      description: "Vi hjelper deg gjerne videre.",
      icon: MessageCircle,
    },
  ] as const;

  return (
    <section aria-labelledby="min-peis-help-heading" className="space-y-3">
      <h2
        id="min-peis-help-heading"
        className="text-base font-medium text-foreground"
      >
        Trenger du hjelp?
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ctas.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-start gap-3 rounded-xl border border-border/70 px-3 py-3 transition-colors hover:border-primary/35 hover:bg-primary/[0.03]"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <item.icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
