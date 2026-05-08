import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GeoTag Pro - Premium Image Geolocation Tool",
  description: "Embed GPS metadata into your images instantly. Professional tool for photographers, real estate, and SEO professionals.",
  keywords: ["geotag", "gps metadata", "exif editor", "image geolocation", "seo images"],
  authors: [{ name: "GeoTag Team" }],
  openGraph: {
    title: "GeoTag Pro",
    description: "The professional way to geotag your images.",
    type: "website",
  },
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground bg-grid`}
      >
        <div className="fixed inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-violet-500/10 pointer-events-none" />
        <Providers>
          <Navbar />
          <main className="relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
