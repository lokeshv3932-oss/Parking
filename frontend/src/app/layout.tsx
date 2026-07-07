import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Symmes Fleet Parking & Repair | Fairfield, OH",
  description:
    "Secure monthly truck, trailer, and fleet vehicle parking with 24/7 surveillance and an on-site mechanic in Fairfield, Ohio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-brand-black dark:text-white">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
