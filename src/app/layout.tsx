import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppearanceProvider } from "@/hooks/useAppearanceSettings";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { Toaster } from "@/components/ui/sonner";
import { PwaManager } from "@/components/pwa";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RepoDeck · GitHub repository viewer",
  description: "A focused, responsive way to browse GitHub repositories.",
  applicationName: "RepoDeck",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RepoDeck",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AppearanceProvider>
            <SWRProvider>
              {children}
              <PwaManager />
              <Toaster />
            </SWRProvider>
          </AppearanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
