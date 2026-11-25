import { T } from "@/components/i18n/T";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { getCatalog } from "@/content/server";
import { CatalogProvider, ProgressProvider } from "@/components/providers/ProgressProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { UpdatesProvider } from "@/components/updates/UpdatesProvider";
import { UpdatePopup } from "@/components/updates/UpdatePopup";
import { SITE_URL } from "@/lib/env";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getLocale } from "@/i18n/server";
import { LOCALES } from "@/i18n/locales";

const sans = Inter({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PyNest — Learn Python from zero", template: "%s · PyNest" },
  description: "Master Python step by step with interactive lessons, real coding exercises, and PyBuddy, your personal AI tutor.",
  openGraph: { title: "PyNest — Learn Python from zero", description: "Interactive lessons, a real in-browser Python editor and an AI tutor.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f8f9fc" }, { media: "(prefers-color-scheme: dark)", color: "#0a0c14" }],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={LOCALES.find((l) => l.id === locale)?.htmlLang ?? "en"} suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans">
        <LocaleProvider locale={locale}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-white"><T k="Skip to content" /></a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ToastProvider>
            <CatalogProvider catalog={getCatalog()}>
              <ProgressProvider>
                <UpdatesProvider>
                  {children}
                  <UpdatePopup />
                </UpdatesProvider>
              </ProgressProvider>
            </CatalogProvider>
          </ToastProvider>
        </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
