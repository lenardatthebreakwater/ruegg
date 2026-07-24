import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

export function generateMetadata(): Metadata {
  return buildPageMetadata({
    title: "Peismontering i ditt område",
    description: "Se lokale sider for peismontering i ditt område.",
    path: "/category/peismontering/",
  });
}

export default function LokalmonteringIndexPage() {
  redirect("/category/peismontering/");
}
