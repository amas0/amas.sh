import { ColorModeToggle } from "@/components/color-mode-toggle";
import { MainNav } from "@/components/main-nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/config";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "amas.sh",
  description: "A website",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" enableSystem defaultTheme="dark">
          <TooltipProvider>
            <div className="space-y-4 max-w-3xl mx-auto flex flex-col h-full min-h-screen p-4 md:py-8">
              <header className="mb-4">
                <div className="flex items-center justify-between">
                  <MainNav />
                  <div className="flex flex-1 items-center justify-end space-x-2">
                    <nav className="flex items-center space-x-4">
                      <Link
                        className="no-underline"
                        href={config.socials.github}
                      >
                        <Image src="/github.svg" alt="GitHub" width={20} height={20}
                          className="filter dark:invert transition-filter duration-300" />
                      </Link>
                      <Link
                        className="no-underline"
                        href={config.socials.bsky}
                      >
                        <Image src="/bluesky.svg" alt="Bluesky" width={20} height={20}
                          className="filter dark:invert transition-filter duration-300" />
                      </Link>
                    </nav>
                    <ColorModeToggle />
                  </div>
                </div>
              </header>
              {children}
            </div>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
