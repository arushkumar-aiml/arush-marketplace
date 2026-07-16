import type { Metadata, Viewport } from "next";
import { AuthProvider } from "../lib/useAuth";
import { ThemeProvider } from "../lib/useTheme";
import { LocaleProvider } from "../lib/useLocale";
import PWARegister from "../components/PWARegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adeel AI — Arush Marketplace",
  description: "AI-native freelance marketplace by Arush Labs",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Arush Marketplace",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PWARegister />
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>{children}</AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
