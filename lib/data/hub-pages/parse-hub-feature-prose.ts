import type { HubFeatureSectionBlock } from "./types";

/**
 * Parses a single template string into preamble + titled sections.
 *
 * - Everything before the first line that starts with `# ` is the preamble (optional).
 * - Each line `# Section title` starts a block; the body runs until the next `# ` line or EOF.
 * - Within a body, split paragraphs with a blank line (`\\n\\n`).
 */
export function parseHubFeatureProse(raw: string): {
  preamble: string;
  sections: HubFeatureSectionBlock[];
} {
  const trimmed = raw.trim();
  const parts = trimmed.split(/^# (.+)$/m);
  const preamble = parts[0]?.trim() ?? "";
  const sections: HubFeatureSectionBlock[] = [];

  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i]?.trim() ?? "";
    const description = parts[i + 1]?.trim() ?? "";
    if (title) {
      sections.push({ title, description });
    }
  }

  return { preamble, sections };
}
