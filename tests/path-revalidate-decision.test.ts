import { describe, expect, it } from "vitest";
import {
  decidePathRevalidate,
  normalizeRevalidatePath,
  revalidatePathVariants,
} from "@/lib/cache/path-revalidate-decision";

describe("normalizeRevalidatePath", () => {
  it("adds a leading slash and strips trailing slash", () => {
    expect(normalizeRevalidatePath("lagersalg/")).toBe("/lagersalg");
    expect(normalizeRevalidatePath("/lagersalg/")).toBe("/lagersalg");
  });

  it("rejects absolute URLs and traversal", () => {
    expect(normalizeRevalidatePath("https://evil.example/lagersalg")).toBeNull();
    expect(normalizeRevalidatePath("/foo/../bar")).toBeNull();
    expect(normalizeRevalidatePath("/lagersalg?x=1")).toBeNull();
  });
});

describe("revalidatePathVariants", () => {
  it("returns slash and slashless forms for app routes", () => {
    expect(revalidatePathVariants("/lagersalg")).toEqual([
      "/lagersalg",
      "/lagersalg/",
    ]);
  });
});

describe("decidePathRevalidate", () => {
  it("rejects empty payloads", () => {
    const decision = decidePathRevalidate({});
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.status).toBe(400);
  });

  it("maps /lagersalg to the category archive tag without shared products:archive", () => {
    const decision = decidePathRevalidate({ path: "/lagersalg" });
    expect(decision).toEqual({
      ok: true,
      paths: ["/lagersalg"],
      tags: ["products:archive:lagersalg"],
    });
  });

  it("maps /ombyggingssalg to peisoutlet category tag", () => {
    const decision = decidePathRevalidate({ path: "/ombyggingssalg/" });
    expect(decision).toEqual({
      ok: true,
      paths: ["/ombyggingssalg"],
      tags: ["products:archive:peisoutlet"],
    });
  });

  it("maps /produktkategori/{slug} and keeps /shop on the shop scope tag", () => {
    const decision = decidePathRevalidate({
      paths: ["/produktkategori/vedovn", "/shop"],
    });
    expect(decision.ok).toBe(true);
    if (!decision.ok) return;
    expect(decision.paths).toEqual(["/produktkategori/vedovn", "/shop"]);
    expect(decision.tags).toEqual([
      "products:archive:vedovn",
      "products:archive:shop",
    ]);
  });

  it("allows unknown paths with revalidatePath only", () => {
    const decision = decidePathRevalidate({ path: "/om-oss" });
    expect(decision).toEqual({
      ok: true,
      paths: ["/om-oss"],
      tags: [],
    });
  });
});
