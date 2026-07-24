/** Fallback when the items API omits `reservedelerTaxonomy`. */
export function guessReservedelerTaxonomy(brandSlug: string): string | null {
  const normalized = brandSlug.trim().toLocaleLowerCase("nb-NO");
  const map: Record<string, string> = {
    aduro: "pa_aduro-deler",
    asgard: "pa_aduro-deler",
    jydepejsen: "pa_jydepejsen-deler",
    dovre: "pa_dovre-deler",
    nordpeis: "pa_nordpeis-deler",
  };
  return map[normalized] ?? null;
}
