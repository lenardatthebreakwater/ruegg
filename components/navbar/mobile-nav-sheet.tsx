"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgePercent,
  ChevronRight,
  Cylinder,
  Flame,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  Sparkles,
  Tags,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { ContactMethodLink } from "@/components/analytics/contact-method-link";
import { TrackedCtaLink } from "@/components/analytics/tracked-cta-link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SITE_CONTACT } from "@/lib/site-contact";
import { cn } from "@/lib/utils";
import {
  NAV_MENUS,
  NAV_STANDALONE_LINKS,
  buildNavItemHref,
  formatNavLabelForArchive,
  type NavMenuItemDef,
  type NavStandaloneLinkDef,
} from "./nav-menu-data";

/** "VIS ALLE TILBEHØR" → "Vis alle tilbehør" for CTA rows. */
function toSentenceCase(label: string): string {
  const lower = label.toLocaleLowerCase("nb-NO");
  return lower.charAt(0).toLocaleUpperCase("nb-NO") + lower.slice(1);
}

const MENU_ICONS: Record<string, LucideIcon> = {
  peis: Flame,
  tilbehor: Package,
  pipe: Cylinder,
  reservedeler: Wrench,
  merker: Tags,
  inspirasjon: Sparkles,
  tilbud: BadgePercent,
};

/** Mobile-only quick links appended after the shared standalone links. */
const MOBILE_EXTRA_LINKS: NavStandaloneLinkDef[] = [
  { key: "tilbud", label: "Tilbud", href: "/tilbud/" },
];

function withTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

/** True when the current pathname is at or under the given app path. */
function isPathActive(href: string, pathname: string): boolean {
  if (!href.startsWith("/") || href.includes("#")) return false;
  return withTrailingSlash(pathname).startsWith(withTrailingSlash(href));
}

function isPathExact(href: string, pathname: string): boolean {
  if (!href.startsWith("/") || href.includes("#")) return false;
  return withTrailingSlash(pathname) === withTrailingSlash(href);
}

/** Icon tile shared by nav rows and footer contact rows. */
function NavIconTile({
  icon: Icon,
  active = false,
}: {
  icon: LucideIcon;
  active?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg border text-primary transition-colors",
        active
          ? "border-primary/30 bg-primary/10"
          : "border-border/60 bg-muted/60 group-hover:border-primary/30 group-hover:bg-primary/10"
      )}
    >
      <Icon className="size-4" aria-hidden />
    </span>
  );
}

/** Staggered slide-in for top-level rows when the sheet opens. */
function MobileNavReveal({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.06 + index * 0.035, duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function MobileNavSubItem({
  menuKey,
  item,
}: {
  menuKey: string;
  item: NavMenuItemDef;
}) {
  const pathname = usePathname();
  const href = buildNavItemHref(item);
  const highlighted = Boolean(item.showAll || item.megaMenuCta);
  const active = !highlighted && isPathExact(href, pathname);
  const label = highlighted
    ? toSentenceCase(item.label)
    : formatNavLabelForArchive(item.label);

  return (
    <SheetClose asChild key={`${menuKey}-${item.label}`}>
      <Link
        href={href}
        prefetch={false}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
          highlighted && "hover:bg-primary/10",
          active && "bg-primary/[0.06]",
          !highlighted &&
            !active &&
            "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {/* Inner spans keep brand color even though the accordion applies its
            own hover color directly on nested anchors. */}
        {highlighted ? (
          <span className="flex items-center gap-1.5 font-medium text-primary">
            {label}
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
        ) : active ? (
          <span className="font-medium text-primary">{label}</span>
        ) : (
          label
        )}
      </Link>
    </SheetClose>
  );
}

function MobileNavStandaloneLink({
  link,
  index,
}: {
  link: NavStandaloneLinkDef;
  index: number;
}) {
  const pathname = usePathname();
  const Icon = MENU_ICONS[link.key] ?? ChevronRight;
  const active = isPathActive(link.href, pathname);

  return (
    <MobileNavReveal index={index}>
      <SheetClose asChild>
        <Link
          href={link.href}
          prefetch={false}
          aria-current={active ? "page" : undefined}
          className="group flex items-center gap-3 rounded-lg px-2 py-2 text-[15px] font-medium text-foreground transition-colors hover:bg-muted"
        >
          <NavIconTile icon={Icon} active={active} />
          <span className={cn(active && "text-primary")}>{link.label}</span>
          <ChevronRight
            className="ml-auto size-4 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </SheetClose>
    </MobileNavReveal>
  );
}

const MOBILE_NAV_FOOTER_ACTION_CLASS =
  "group flex w-full min-h-11 min-w-0 items-center gap-2 rounded-lg py-1.5 transition-colors hover:bg-muted";

function MobileNavFooter() {
  const ringLabel = `Ring oss, ${SITE_CONTACT.phoneDisplay}`;
  const visitLabel = "Besøk oss, Bærum";

  return (
    <div className="shrink-0 border-t border-border/60 p-5 pt-4">
      <SheetClose asChild>
        <Button asChild variant="ctaGlow" className="w-full">
          <TrackedCtaLink
            href="/kontakt-oss/"
            contentType="nav"
            contentId="mobile_kontakt"
            linkText="Kontakt oss"
            prefetch={false}
          >
            <Mail className="size-4" aria-hidden />
            Kontakt oss
          </TrackedCtaLink>
        </Button>
      </SheetClose>

      <div className="mt-3 grid grid-cols-2 gap-1">
        <ContactMethodLink
          href={`tel:${SITE_CONTACT.phoneHref}`}
          placement="mobile_nav"
          linkText={ringLabel}
          aria-label={ringLabel}
          className={MOBILE_NAV_FOOTER_ACTION_CLASS}
        >
          <NavIconTile icon={Phone} />
          <span className="flex min-w-0 flex-col" aria-hidden="true">
            <span className="text-sm font-medium text-foreground">Ring oss</span>
            <span className="text-xs leading-snug text-muted-foreground">
              {SITE_CONTACT.phoneDisplay}
            </span>
          </span>
        </ContactMethodLink>
        <SheetClose asChild>
          <TrackedCtaLink
            href="/#visit-us"
            contentType="nav"
            contentId="mobile_visit_us"
            linkText={visitLabel}
            aria-label={visitLabel}
            prefetch={false}
            className={MOBILE_NAV_FOOTER_ACTION_CLASS}
          >
            <NavIconTile icon={MapPin} />
            <span className="flex min-w-0 flex-col" aria-hidden="true">
              <span className="text-sm font-medium text-foreground">
                Besøk oss
              </span>
              <span className="text-xs leading-snug text-muted-foreground">
                Bærum
              </span>
            </span>
          </TrackedCtaLink>
        </SheetClose>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
        <span className="text-xs text-muted-foreground">Fargetema</span>
        <ThemeToggle className="size-9 shadow-none" />
      </div>
    </div>
  );
}

export function MobileNavSheet() {
  const pathname = usePathname();
  const standaloneLinks = [...NAV_STANDALONE_LINKS, ...MOBILE_EXTRA_LINKS];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Åpne meny"
          className="text-neutral-800 hover:bg-black/5 dark:text-neutral-100 dark:hover:bg-white/10 lg:hidden"
        >
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="flex w-[85vw] max-w-sm flex-col gap-0 border-border/60 bg-background p-0"
      >
        {/* Brand accent, echoes the account/blog panel top bar. */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent"
        />

        <SheetHeader className="shrink-0 border-b border-border/60 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Flame className="size-5" aria-hidden />
            </span>
            <SheetTitle className="flex flex-col leading-none">
              <span className="font-display text-xl font-semibold tracking-tight text-foreground">
                Peisbutikken
              </span>
              <span className="mt-1.5 text-[0.6rem] font-medium tracking-[0.3em] text-muted-foreground uppercase">
                Meny
              </span>
            </SheetTitle>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto size-9 rounded-full text-muted-foreground hover:text-foreground"
                aria-label="Lukk meny"
              >
                <X className="size-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <nav
          aria-label="Mobilnavigasjon"
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3 [scrollbar-gutter:stable]"
        >
          <Accordion type="single" collapsible className="gap-0.5">
            {NAV_MENUS.map((menu, index) => {
              const Icon = MENU_ICONS[menu.key] ?? ChevronRight;
              const menuActive = menu.items.some((item) =>
                isPathActive(buildNavItemHref(item), pathname)
              );
              return (
                <MobileNavReveal key={menu.key} index={index}>
                  <AccordionItem value={menu.key} className="border-b-0">
                    <AccordionTrigger className="group items-center rounded-lg px-2 py-2 text-[15px] font-medium text-foreground hover:bg-muted hover:no-underline">
                      <span className="flex items-center gap-3">
                        <NavIconTile icon={Icon} active={menuActive} />
                        <span className={cn(menuActive && "text-primary")}>
                          {menu.label}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-2 [&_a]:no-underline">
                      <div className="ml-6.5 flex flex-col gap-0.5 border-l border-border/70 pl-3.5">
                        {menu.items.map((item) => (
                          <MobileNavSubItem
                            key={`${menu.key}-${item.label}`}
                            menuKey={menu.key}
                            item={item}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </MobileNavReveal>
              );
            })}
          </Accordion>

          <div className="mt-0.5 flex flex-col gap-0.5">
            {standaloneLinks.map((link, index) => (
              <MobileNavStandaloneLink
                key={link.key}
                link={link}
                index={NAV_MENUS.length + index}
              />
            ))}
          </div>
        </nav>

        <MobileNavFooter />
      </SheetContent>
    </Sheet>
  );
}
