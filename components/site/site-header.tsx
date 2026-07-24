import { SiteNavbar } from "@/components/navbar/site-navbar";

export async function SiteHeader() {
  return <SiteNavbar />;
}

/** For client loading boundaries and other contexts where async Server Components cannot run. */
export function SiteHeaderLoading() {
  return <SiteNavbar />;
}
