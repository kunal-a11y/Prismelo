import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SpotlightPointer } from "@/components/spotlight-pointer";
import { SiteFooter } from "@/components/site-footer";
import { NewsletterPrompt } from "@/components/community/newsletter-prompt";
import { site } from "@/lib/site";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.legalName} — Cybersecurity, Cloud & Software Engineering`,
    template: `%s — ${site.legalName}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.founder }],
  creator: site.founder,
  keywords: [
    "Prismelo",
    "cybersecurity",
    "penetration testing",
    "cloud infrastructure",
    "software development",
    "AI solutions",
    "IT consulting",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.legalName,
    title: `${site.legalName} — Cybersecurity, Cloud & Software Engineering`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.legalName} — Cybersecurity, Cloud & Software Engineering`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-black text-white antialiased">
        <noscript>
          <style>{`.reveal,.fade-in{opacity:1;transform:none}`}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
        >
          Skip to content
        </a>
        <SiteHeader />
        <SpotlightPointer />
        <main id="main">{children}</main>
        <SiteFooter />
        <NewsletterPrompt />
      </body>
    </html>
  );
}
