import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileNav from "@/components/layout/MobileNav";
import MiniPlayer from "@/components/player/MiniPlayer";
import ExpandedPlayer from "@/components/player/ExpandedPlayer";
import AutoplayToast from "@/components/player/AutoplayToast";
import PlayerSpacer from "@/components/layout/PlayerSpacer";
import SiteFooter from "@/components/layout/SiteFooter";
import ServiceWorkerRegistration from "@/components/layout/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SHINOTECA — Archivo musical comunitario",
    template: "%s · SHINOTECA",
  },
  description:
    "Archivo musical comunitario dedicado a canciones antiguas de Shino Flow, compartidas con autorización.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <Sidebar />
          <div className="flex min-h-full flex-col lg:pl-64">
            <MobileHeader />
            <Topbar />
            <main className="flex-1 pb-16 lg:pb-0">
              {children}
              <SiteFooter />
              <PlayerSpacer />
            </main>
          </div>
          <MiniPlayer />
          <MobileNav />
          <ExpandedPlayer />
          <AutoplayToast />
          <ServiceWorkerRegistration />
        </Providers>
      </body>
    </html>
  );
}
