import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "@/components/session-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PWAProvider } from "@/components/pwa/pwa-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IskolarBlock - Blockchain Scholar Management",
  description: "Empowering Isko at Iska Through Blockchain Transparency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <SessionProvider>
          <PWAProvider />
          <SpeedInsights />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
