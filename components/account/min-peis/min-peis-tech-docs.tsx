import { Download, FileText } from "lucide-react";
import type { MinPeisDetail } from "@/lib/account/min-peis-types";

type MinPeisTechDocsProps = {
  fireplace: MinPeisDetail;
};

export function MinPeisTechDocs({ fireplace }: MinPeisTechDocsProps) {
  const attributes = fireplace.attributes ?? [];
  const documents = fireplace.documents ?? [];
  const hasMeta =
    Boolean(fireplace.dimensions?.trim()) || Boolean(fireplace.weight?.trim());
  const hasContent = attributes.length > 0 || documents.length > 0 || hasMeta;

  if (!hasContent) return null;

  return (
    <section aria-labelledby="min-peis-tech-heading" className="space-y-4">
      <h2
        id="min-peis-tech-heading"
        className="text-base font-medium text-foreground"
      >
        Teknisk info og dokumenter
      </h2>

      {(attributes.length > 0 || hasMeta) && (
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {fireplace.dimensions?.trim() ? (
            <div className="rounded-lg bg-muted/35 px-3 py-2.5">
              <dt className="text-muted-foreground">Dimensjoner</dt>
              <dd className="font-medium text-foreground">
                {fireplace.dimensions}
              </dd>
            </div>
          ) : null}
          {fireplace.weight?.trim() ? (
            <div className="rounded-lg bg-muted/35 px-3 py-2.5">
              <dt className="text-muted-foreground">Vekt</dt>
              <dd className="font-medium text-foreground">
                {fireplace.weight} kg
              </dd>
            </div>
          ) : null}
          {attributes.map((attr) => (
            <div
              key={`${attr.label}-${attr.value}`}
              className="rounded-lg bg-muted/35 px-3 py-2.5"
            >
              <dt className="text-muted-foreground">{attr.label}</dt>
              <dd className="font-medium text-foreground">{attr.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {documents.length > 0 ? (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.url}>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{doc.label}</span>
                <Download className="size-4 shrink-0 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
