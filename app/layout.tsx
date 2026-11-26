import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VerapritygurlAI — Mitra Berpikir AI Anda",
  description:
    "Jelajahi VerapritygurlAI, asisten AI modern untuk berpikir, menulis, dan berkarya.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-theme="dark"
      className={`${inter.variable} ${newsreader.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-main text-text-primary font-sans selection:bg-accent-coral/30 selection:text-text-primary">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
