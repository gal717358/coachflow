import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

// Rubik supports both Hebrew and Latin glyphs.
const rubik = Rubik({
  variable: "--font-sans",
  subsets: ["latin", "hebrew"],
});

export const metadata: Metadata = {
  title: "מערכת מאמנים",
  description: "מקור האמת היחיד של הסטודיו לכל מתאמן.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${rubik.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
