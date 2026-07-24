import { EditorialPageHeader } from "@/components/editorial";
import { POPULAERE_SOK_HUBS } from "@/lib/populaere-sok/menu-data";

import { PopulaereSokHubCard } from "./populaere-sok-hub-card";

export function PopulaereSokMenuSection() {
  return (
    <>
      <EditorialPageHeader
        title="Populære søk"
        headingId="populaere-sok-heading"
        contentClassName="container mx-auto max-w-7xl px-4"
      />
      <section
        className="container mx-auto max-w-7xl px-4 py-10 md:py-14"
        aria-labelledby="populaere-sok-heading"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAERE_SOK_HUBS.map((hub) => (
            <PopulaereSokHubCard key={hub.id} hub={hub} />
          ))}
        </div>
      </section>
    </>
  );
}
