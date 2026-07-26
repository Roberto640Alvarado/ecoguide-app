"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useTranslatedText } from "@/features/translation/hooks/use-translated-texts";

interface FormErrorBannerProps {
  message?: string | null;
}

/**
 * Banner de error para formularios (login, registro, recuperación de
 * contraseña, etc). El `message` siempre llega en español desde la API
 * (envelope {status,message,data}) — se traduce automáticamente vía DeepL
 * cuando el idioma activo es inglés, igual que el resto del contenido
 * dinámico de la plataforma (ver features/translation).
 */
export function FormErrorBanner({ message }: FormErrorBannerProps) {
  const translatedMessage = useTranslatedText(message ?? "");

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          role="alert"
          className="flex items-start gap-2.5 overflow-hidden rounded-xl border border-danger-soft-foreground/25 bg-danger-soft px-4 py-3 text-sm text-danger-soft-foreground"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-soft-foreground/15">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
          </span>
          <span className="leading-relaxed">{translatedMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
