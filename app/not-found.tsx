"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { Compass, Home, Languages } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useAuthStore } from "@/store/auth-store";
import { getDashboardPath } from "@/features/auth/utils/get-dashboard-path";

/**
 * Página 404 global (Next.js la renderiza automáticamente para cualquier
 * ruta que no exista). Reutiliza el mismo lenguaje visual que el layout de
 * auth (fondo con gradiente radial + círculos flotando) para que se sienta
 * parte de la plataforma y no un error genérico del navegador.
 */
export default function NotFound() {
  const language = useLanguageStore((state) => state.language);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const en = language === "en";

  const primaryHref = user ? getDashboardPath(user.role) : "/";
  const primaryLabel = user
    ? en
      ? "Go to my dashboard"
      : "Ir a mi panel"
    : en
      ? "Back to home"
      : "Volver al inicio";

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
          className="text-lg font-bold text-foreground"
        >
          EcoGuide
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
          className="flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-border bg-surface/95 p-8 text-center shadow-xl shadow-black/5 backdrop-blur-sm sm:p-10"
        >
          <motion.span
            animate={{ rotate: [0, -8, 8, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground"
          >
            <Compass className="h-8 w-8" aria-hidden="true" />
          </motion.span>

          <div>
            <p className="text-6xl font-black tracking-tight text-accent">
              404
            </p>
            <h1 className="mt-2 text-xl font-bold text-foreground">
              {en ? "Looks like you're off the trail" : "Parece que te saliste del sendero"}
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              {en
                ? "We couldn't find the page you're looking for. It may have been moved or the address might be incorrect."
                : "No encontramos la página que buscas. Puede que se haya movido o que la dirección esté incorrecta."}
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth
            className="gap-1.5"
            onPress={() => router.push(primaryHref)}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            {primaryLabel}
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
