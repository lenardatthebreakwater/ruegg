"use client";

import { useId, useRef, useState } from "react";
import {
  FileImage,
  FileText,
  UploadCloud,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CONTACT_UPLOAD_ACCEPT_ATTR,
  CONTACT_UPLOAD_FORMAT_HINT,
  DEFAULT_CONTACT_UPLOAD_EXTENSIONS,
  DEFAULT_CONTACT_UPLOAD_MAX_FILE_BYTES,
  DEFAULT_CONTACT_UPLOAD_MAX_FILES,
} from "@/lib/contact-upload-config";

type ContactFileDropzoneProps = {
  files: File[];
  onChange: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
  maxFiles?: number;
  maxFileBytes?: number;
  /** Stable id for the hidden file input (and its associated label). */
  id?: string;
  /** Visible label text; always rendered as a real `<label htmlFor>`. */
  label?: string;
};

function getLowerExtension(filename: string): string {
  const match = filename.toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : "";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAllowedExtension(filename: string): boolean {
  const extension = getLowerExtension(filename);
  return (
    extension.length > 0 &&
    (DEFAULT_CONTACT_UPLOAD_EXTENSIONS as readonly string[]).includes(extension)
  );
}

function fileKey(file: File): string {
  return `${file.name}::${file.size}::${file.lastModified}`;
}

function isPdf(file: File): boolean {
  return (
    file.type === "application/pdf" ||
    getLowerExtension(file.name) === ".pdf"
  );
}

/**
 * Large multi-file drag-and-drop zone for contact forms.
 * Files accumulate across drops/picks until the max is reached.
 */
export function ContactFileDropzone({
  files,
  onChange,
  className,
  disabled = false,
  maxFiles = DEFAULT_CONTACT_UPLOAD_MAX_FILES,
  maxFileBytes = DEFAULT_CONTACT_UPLOAD_MAX_FILE_BYTES,
  id,
  label = "Vedlegg",
}: ContactFileDropzoneProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const dragDepthRef = useRef(0);

  const maxMb = Math.round(maxFileBytes / (1024 * 1024));
  const remainingSlots = Math.max(0, maxFiles - files.length);
  const atLimit = remainingSlots === 0;

  function mergeIncoming(incoming: FileList | File[]) {
    const candidates = Array.from(incoming);
    if (candidates.length === 0) return;

    const existingKeys = new Set(files.map(fileKey));
    const next = [...files];
    const rejected: string[] = [];

    for (const file of candidates) {
      if (next.length >= maxFiles) {
        rejected.push(`Maks ${maxFiles} filer.`);
        break;
      }
      if (!isAllowedExtension(file.name)) {
        rejected.push(`«${file.name}» har en filtype som ikke er tillatt.`);
        continue;
      }
      if (file.size <= 0) {
        rejected.push(`«${file.name}» er tom.`);
        continue;
      }
      if (file.size > maxFileBytes) {
        rejected.push(`«${file.name}» er for stor (maks ${maxMb} MB).`);
        continue;
      }
      const key = fileKey(file);
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);
      next.push(file);
    }

    if (next.length !== files.length) {
      onChange(next);
    }
    setError(rejected[0] ?? "");
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
    setError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function clearAll() {
    onChange([]);
    setError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragDepthRef.current += 1;
    setIsDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDragging(false);
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = 0;
    setIsDragging(false);
    if (disabled || atLimit) return;
    mergeIncoming(e.dataTransfer.files);
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Native label required — aria-label alone fails some PageSpeed/axe checks. */}
      <label
        htmlFor={inputId}
        className="flex items-center gap-2 text-sm font-medium leading-none"
      >
        {label}
      </label>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || atLimit}
        aria-controls={inputId}
        onKeyDown={(e) => {
          if (disabled || atLimit) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => {
          if (disabled || atLimit) return;
          inputRef.current?.click();
        }}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={cn(
          "relative flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/[0.06]"
            : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
          (disabled || atLimit) && "cursor-not-allowed opacity-60 hover:border-border hover:bg-muted/30"
        )}
      >
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-full",
            isDragging ? "bg-primary/15 text-primary" : "bg-background text-primary shadow-sm"
          )}
        >
          <UploadCloud className="size-6" aria-hidden />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {isDragging
              ? "Slipp filene her"
              : atLimit
                ? `Maks ${maxFiles} filer nådd`
                : "Dra og slipp filer her"}
          </p>
          <p className="text-sm text-muted-foreground">
            {atLimit ? (
              "Fjern en fil for å legge til flere"
            ) : (
              <>
                eller{" "}
                <span className="font-medium text-primary underline-offset-2 hover:underline">
                  velg fra enheten
                </span>
              </>
            )}
          </p>
        </div>
        <p id={`${inputId}-hint`} className="max-w-sm text-xs text-muted-foreground">
          {CONTACT_UPLOAD_FORMAT_HINT}. Opptil {maxFiles} filer, maks {maxMb}{" "}
          MB per fil.
        </p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={CONTACT_UPLOAD_ACCEPT_ATTR}
          disabled={disabled || atLimit}
          className="sr-only"
          aria-label="Last opp vedlegg"
          aria-describedby={`${inputId}-hint`}
          onChange={(e) => {
            if (e.target.files) {
              mergeIncoming(e.target.files);
            }
            // Allow selecting the same file again after remove.
            e.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {files.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              Vedlegg ({files.length}/{maxFiles})
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground"
              onClick={clearAll}
              disabled={disabled}
            >
              Fjern alle
            </Button>
          </div>
          <ul className="space-y-2" aria-label="Vedlagte filer">
            {files.map((file, index) => {
              const Icon = isPdf(file) ? FileText : FileImage;
              return (
                <li
                  key={fileKey(file)}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Fjern ${file.name}`}
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
