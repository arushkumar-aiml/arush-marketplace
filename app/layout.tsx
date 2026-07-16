import type { Metadata } from "next";
import { AuthProvider } from "../lib/useAuth";
import { ThemeProvider } from "../lib/useTheme";
import { LocaleProvider } from "../lib/useLocale";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adeel AI — Arush Marketplace",
  description: "AI-native freelance marketplace by Arush Labs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>{children}</AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}