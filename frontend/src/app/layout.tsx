import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import ChatWidget from "@/components/chat-widget";
import CommandPalette from "@/components/command-palette";
import MaterialCalculator from "@/components/material-calculator";
import CursorSpotlight from "@/components/cursor-spotlight";
import PWAInstallPrompt from "@/components/pwa-install-prompt";

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
    default: "EWA Logistics | Premium Construction Materials & Delivery",
    template: "%s | EWA Logistics"
  },
  description: "Nigeria's leading construction materials marketplace. Order granite, sand, and cement with secure escrow payments, real-time GPS tracking, and verified suppliers.",
  keywords: [
    "construction materials Nigeria", 
    "granite delivery Lagos", 
    "sand delivery Abuja", 
    "logistics platform", 
    "escrow payments", 
    "EWA Logistics"
  ],
  authors: [{ name: "EWA Logistics Limited", url: "https://ewalogistics.com" }],
  creator: "EWA Logistics",
  publisher: "EWA Logistics Limited",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EWA Logistics",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://ewalogistics.com",
    siteName: "EWA Logistics",
    title: "EWA Logistics | Premium Construction Materials & Delivery",
    description: "Order construction materials with secure escrow payments and real-time GPS tracking.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "EWA Logistics Platform"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EWA Logistics | Premium Construction Materials & Delivery",
    description: "Order construction materials with secure escrow payments and real-time GPS tracking.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  // ✅ Next.js automatically injects these into the <head> safely
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "EWA Logistics",
    "mobile-web-app-capable": "yes",
  }
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CursorSpotlight />
        
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
            <ChatWidget />
            <CommandPalette />
            <MaterialCalculator />
            <PWAInstallPrompt />
          </ToastProvider>
        </ThemeProvider>

        {/* ✅ CORRECT: Using Next.js Script component (Capital 'S') for Service Worker */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('✅ Service Worker registered with scope:', registration.scope);
                  },
                  function(err) {
                    console.warn('❌ Service Worker registration failed:', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}