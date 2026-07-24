export type CanonicalArchiveAttribute = {
  key: string;
  label: string;
};

export function normalizeArchiveToken(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("nb-NO")
    .replace(/å/g, "a")
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/aa/g, "a");
}

export function getCanonicalArchiveAttribute(
  label: string
): CanonicalArchiveAttribute | null {
  const normalizedLabel = normalizeArchiveToken(label);

  const mappings: Array<{
    matches: (value: string) => boolean;
    result: CanonicalArchiveAttribute;
  }> = [
    {
      matches: (value) =>
        value.includes(normalizeArchiveToken("Røykrør Ø")) ||
        value.includes(normalizeArchiveToken("Diameter på røykrør")),
      result: {
        key: "diameter-pa-roykror",
        label: "Diameter på røykrør",
      },
    },
    {
      matches: (value) =>
        value === normalizeArchiveToken("Askeskuff") ||
        value === normalizeArchiveToken("Har Askeskuff"),
      result: {
        key: "har-askeskuff",
        label: "Har Askeskuff",
      },
    },
    {
      matches: (value) => value === normalizeArchiveToken("Matlaging"),
      result: {
        key: "matlaging",
        label: "Matlaging",
      },
    },
    {
      matches: (value) => value === normalizeArchiveToken("Peisglass"),
      result: {
        key: "peisglass",
        label: "Peisglass",
      },
    },
    {
      matches: (value) => value.includes(normalizeArchiveToken("Røykuttak")),
      result: {
        key: "roykuttak",
        label: "Røykuttak",
      },
    },
    {
      // Woo global attribute e.g. name: pa_varmelagrende-peis, label: Varmelagrende
      matches: (value) => value.includes(normalizeArchiveToken("Varmelagrende")),
      result: {
        key: "varmelagrende",
        label: "Varmelagrende",
      },
    },
  ];

  const mapping = mappings.find((candidate) => candidate.matches(normalizedLabel));
  return mapping?.result ?? null;
}
