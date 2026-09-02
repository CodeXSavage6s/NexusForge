import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from '@/lib/context/theme-provider'
import Eruda from '@/lib/context/eruda'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexusforge.dev";
const siteName = "NexusForge";
const siteDescription =
  "The all-in-one workspace for freelancers to manage clients, projects, tasks, and invoices.";
const ogImage = "/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Freelance client & project management`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    siteName,
    images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [ogImage],
    // TODO: add once you have a handle, e.g. "@nexusforge"
    // site: "@nexusforge",
    // creator: "@nexusforge",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
    <Eruda>
      <ThemeProvider >
        <body className="min-h-screen flex flex-col">{children}</body>
      </ThemeProvider>
    </Eruda>
    </html>
  );
}
