import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SearchProvider } from "@/components/search/search-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieConsentBanner } from "@/components/cookie-consent/cookie-consent-banner";
import { SiteBottomBar } from "@/components/site/site-bottom-bar";
import { ProductPrefetchProvider } from "@/components/products/product-prefetch-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { getMetadataBase } from "@/lib/seo/metadata";
import { ConsentModeBootstrap } from "@/components/analytics/consent-mode-bootstrap";
import { GoogleTagManagerRoot } from "@/components/analytics/google-tag-manager-root";
import { ChatwayWidget } from "@/components/chat/chatway-widget";
import { NavigationScrollToTop } from "@/components/navigation/navigation-scroll-to-top";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Rüegg | Peiser og vedovner",
    template: "%s | Rüegg",
  },
  description:
    "Utforsk peiser, vedovner og tilbehør fra Rüegg. Kontakt oss for personlig veiledning og trygge merkevarer.",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="no"
      className="font-sans"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        {/* Warm the two heaviest above-fold Jakarta faces (latin). latin-ext loads via unicode-range when needed. */}
        <link
          rel="preload"
          href="/fonts/plus-jakarta-sans-latin-400-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/plus-jakarta-sans-latin-600-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased"
        )}
      >
        <ConsentModeBootstrap />
        <GoogleTagManagerRoot />
        <ChatwayWidget />
        <NavigationScrollToTop />
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider delayDuration={400}>
              <CartProvider>
                <ProductPrefetchProvider>
                  <SearchProvider>
                    {children}
                    <CookieConsentBanner />
                    <SiteBottomBar />
                  </SearchProvider>
                </ProductPrefetchProvider>
              </CartProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
