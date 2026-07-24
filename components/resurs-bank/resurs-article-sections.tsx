import type { RichParagraph } from "@/lib/data/resurs-bank-page";

/** Renders one paragraph with optional bold segments (original page emphasis). */
export function ResursRichParagraph({ segments }: { segments: RichParagraph }) {
  return (
    <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
      {segments.map((seg, index) =>
        seg.bold ? (
          <strong key={index} className="font-semibold text-foreground">
            {seg.text}
          </strong>
        ) : (
          <span key={index}>{seg.text}</span>
        )
      )}
    </p>
  );
}
