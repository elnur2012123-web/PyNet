import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { getCatalog } from "@/content/server";
import { CatalogProvider, ProgressProvider } from "@/components/providers/ProgressProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { SITE_URL } from "@/lib/env";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PyNest — Learn Python from zero", template: "%s · PyNest" },
  description: "Master Python step by step with interactive lessons, real coding exercises, and PyBuddy, your personal AI tutor.",
  openGraph: { title: "PyNest — Learn Python from zero", description: "Interactive lessons, a real in-browser Python editor and an AI tutor.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f8f9fc" }, { media: "(prefers-color-scheme: dark)", color: "#0a0c14" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-white">Skip to content</a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ToastProvider>
            <CatalogProvider catalog={getCatalog()}>
              <ProgressProvider>{children}</ProgressProvider>
            </CatalogProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
