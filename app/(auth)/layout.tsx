"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { ArrowLeft, Languages } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { authContent } from "@/lib/i18n/auth-content";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = useLanguageStore((state) => state.language);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const t = authContent[language];
  const pathname = usePathname();
  // El registro necesita más aire: avatar + grid de 2 columnas + checklist.
  const isWideForm = pathname === "/register";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--accent-soft,rgba(34,153,84,0.12)),_transparent_60%)]"
        aria-hidden="true"
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-accent-soft blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, 12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-10 -z-10 h-64 w-64 rounded-full bg-accent-soft blur-3xl"
        animate={{ y: [0, -16, 0], x: [0, -10, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <header className="flex items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t.backHome}
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onPress={toggleLanguage}
          aria-label="Toggle language"
        >
          <Languages className="h-4 w-4" aria-hidden="true" />
        </Button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className={`w-full rounded-3xl border border-border bg-surface/95 p-6 shadow-xl shadow-black/5 backdrop-blur-sm transition-[max-width] duration-300 sm:p-8 ${
            isWideForm ? "max-w-xl" : "max-w-md"
          }`}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
