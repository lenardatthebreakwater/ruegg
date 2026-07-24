import { describe, expect, it } from "vitest";
import { validateContactFiles } from "@/lib/contact-file-utils";
import type { ContactUploadConfig } from "@/lib/contact-upload-config";
import {
  DEFAULT_CONTACT_UPLOAD_MAX_FILE_BYTES,
  DEFAULT_CONTACT_UPLOAD_MAX_TOTAL_BYTES,
  getContactUploadConfig,
} from "@/lib/contact-upload-config";

function makeConfig(overrides: Partial<ContactUploadConfig> = {}): ContactUploadConfig {
  return {
    maxFiles: 3,
    maxFileBytes: 2 * 1024 * 1024,
    maxTotalBytes: 6 * 1024 * 1024,
    allowedMimeTypes: new Set(["image/jpeg", "application/pdf"]),
    allowedExtensions: new Set([".jpg", ".pdf"]),
    ...overrides,
  };
}

function makeFile(name: string, size: number, type = "image/jpeg"): File {
  const bytes = new Uint8Array(size);
  return new File([bytes], name, { type });
}

describe("contact upload caps", () => {
  it("exposes tightened default file/total budgets", () => {
    expect(DEFAULT_CONTACT_UPLOAD_MAX_FILE_BYTES).toBe(2 * 1024 * 1024);
    expect(DEFAULT_CONTACT_UPLOAD_MAX_TOTAL_BYTES).toBe(6 * 1024 * 1024);
    const config = getContactUploadConfig();
    expect(config.maxFileBytes).toBe(DEFAULT_CONTACT_UPLOAD_MAX_FILE_BYTES);
    expect(config.maxTotalBytes).toBeLessThanOrEqual(8 * 1024 * 1024);
  });

  it("rejects a single file over the per-file cap", () => {
    const result = validateContactFiles(
      [makeFile("plan.jpg", 2 * 1024 * 1024 + 1)],
      makeConfig()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("for stor");
      expect(result.error).toContain("per fil");
    }
  });

  it("rejects when combined size exceeds the total cap", () => {
    // Each file is under the per-file cap; only the aggregate should fail.
    const result = validateContactFiles(
      [
        makeFile("a.jpg", 2 * 1024 * 1024),
        makeFile("b.jpg", 2 * 1024 * 1024),
        makeFile("c.jpg", 2 * 1024 * 1024),
      ],
      makeConfig({
        maxFileBytes: 2 * 1024 * 1024,
        maxTotalBytes: 5 * 1024 * 1024,
      })
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Samlet størrelse");
      expect(result.error).toContain("totalt");
    }
  });

  it("accepts files within both per-file and total caps", () => {
    const result = validateContactFiles(
      [
        makeFile("a.jpg", 1024 * 1024),
        makeFile("b.pdf", 1024 * 1024, "application/pdf"),
      ],
      makeConfig()
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.files).toHaveLength(2);
  });
});
