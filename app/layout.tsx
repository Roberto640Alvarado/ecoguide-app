import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import { Providers } from "./providers";
import PrelineScriptWrapper from "@/components/layout/preline-script-wrapper";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoGuide Training",
  description:
    "Plataforma interactiva para estudiantes de turismo que buscan mejorar su inglés a través de escenarios reales de guía turístico en las áreas protegidas de El Salvador.",
  applicationName: "EcoGuide Training",
  icons: { apple: "/icons/apple-touch-icon.png" },
  appleWebApp: {
    capable: true,
    title: "EcoGuide",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfffc" },
    { media: "(prefers-color-scheme: dark)", color: "#011627" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={openSans.variable}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        <PrelineScriptWrapper />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
