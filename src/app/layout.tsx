import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { MusicPlayer } from "@/components/ui/MusicPlayer";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import "./globals.css";

export const metadata: Metadata = {
  title: "AFCON 2025 Predictor | Africa Cup of Nations Predictions",
  description: "Predict AFCON 2025 match results, compete with friends, and climb the leaderboard. Join thousands of football fans predicting the Africa Cup of Nations!",
  keywords: ["AFCON 2025", "Africa Cup of Nations", "football predictions", "soccer", "leaderboard", "sports betting"],
  authors: [{ name: "AFCON Predictor Team" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AFCON 2025",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "AFCON 2025 Predictor",
    description: "Predict AFCON 2025 match results and compete with friends!",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <MusicPlayer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--card-bg)',
                color: 'var(--foreground)',
                border: '1px solid var(--card-border)',
              },
              success: {
                iconTheme: {
                  primary: '#10b959',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
