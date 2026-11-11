import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const titre = "Bilan — Le bilan de tes clients part tout seul, le 1er du mois";
const description =
  "Tu saisis les chiffres en une minute. Bilan met en page le rapport à tes couleurs et l'envoie à ton client le 1er du mois.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: titre,
  description,
  openGraph: {
    title: titre,
    description,
    type: "website",
    locale: "fr_FR",
    siteName: "Bilan",
  },
  twitter: {
    card: "summary_large_image",
    title: titre,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F3EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${instrument.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
