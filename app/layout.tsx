import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "@/components/session-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PWARegister } from "@/components/pwa-register";
import { PWAMeta } from "@/components/pwa-meta";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IskolarBlock - Blockchain Scholar Management",
  description: "Empowering Isko at Iska Through Blockchain Transparency",
  manifest: "/manifest.json",
  themeColor: "#f97316",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IskolarBlock",
  },
  icons: {
    icon: "/iskolarblock.png",
    apple: "/iskolarblock.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
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
        <PWAMeta />
        <SessionProvider>
          <SpeedInsights />
          <PWARegister />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
