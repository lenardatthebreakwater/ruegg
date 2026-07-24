import Image from "next/image";

import { ShellReveal } from "@/components/homepage/shell/shell-reveal";
import { ShellSectionFrame } from "@/components/homepage/shell/shell-section-frame";

const PROJECTS = [
  {
    title: "Peisinnsats i stue, Oslo",
    image: "/images/homepage/shell/referanse-oslo-living.webp",
  },
  {
    title: "Frittstående peisovn, Asker",
    image: "/images/homepage/shell/referanse-asker-stove.webp",
  },
  {
    title: "Utepeis på terrasse, Bergen",
    image: "/images/homepage/shell/referanse-bergen-outdoor.avif",
  },
  {
    title: "Arkitektprosjekt, Vestfold",
    image: "/images/homepage/shell/referanse-vestfold-architect.webp",
  },
] as const;

/** Project references - image-led, no fake reviews. */
export function HomeShellSocialProof() {
  return (
    <ShellSectionFrame
      id="referanser"
      title="Referanser"
      description="Installasjoner og prosjekter. Flere kundehistorier kommer."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {PROJECTS.map((project, index) => (
          <ShellReveal key={project.title} delay={index * 0.06}>
            <figure className="overflow-hidden rounded-[10px]">
              <div className="relative aspect-[16/11] bg-[color:var(--ruegg-swiss-taupe)]/30">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-sm text-[color:var(--ruegg-swiss-muted)]">
                {project.title}
              </figcaption>
            </figure>
          </ShellReveal>
        ))}
      </div>
    </ShellSectionFrame>
  );
}
