export const googleBusinessKnowledgePanelUrl =
  "https://www.google.no/search?sa=X&sca_esv=a2705ea4f2aa2464&authuser=1&biw=1471&bih=1259&sxsrf=AHTn8zp0vLeDCKBMtO9VC6H4LhisyzZtCw:1745638390264&kgmid=/g/1ptw2l1j1&q=Peisbutikken+AS&shndl=30&shem=lcuae,lste,uaasie&source=sh/x/loc/uni/m1/1";

export type SiteTopBarQuickLinkIcon = "truck" | "wrench" | "brickWall";

export type SiteTopBarQuickLink = {
  href: string;
  label: string;
  icon: SiteTopBarQuickLinkIcon;
};

export const siteTopBarQuickLinks: SiteTopBarQuickLink[] = [
  { href: "/fraktbetingelser/", label: "Hjemlevering", icon: "truck" },
  { href: "/montering/", label: "Montering", icon: "wrench" },
  { href: "/piperehabilitering/", label: "Piperehab", icon: "brickWall" },
];
