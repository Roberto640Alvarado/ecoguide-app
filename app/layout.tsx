import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Providers } from "./providers";
import PrelineScriptWrapper from "@/components/layout/preline-script-wrapper";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoGuide Training | Practice English. Guide with Confidence.",
  description:
    "Plataforma interactiva para estudiantes de turismo que buscan mejorar su inglés a través de escenarios reales de guía turístico en las áreas protegidas de El Salvador.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={openSans.variable}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        <PrelineScriptWrapper />
      </body>
    </html>
  );
}
