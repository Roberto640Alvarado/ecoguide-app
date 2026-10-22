"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language-store";

interface SessionCompleteActionsProps {
  /** Inicia otra sesión (nuevo chat / nueva llamada). */
  onContinuePracticing: () => void;
  isContinuing: boolean;
  /** Recorrido guiado del área protegida. */
  tourHref: string;
  className?: string;
}

/**
 * Acciones al terminar una actividad de práctica (chatbot o llamada de
 * speaking): seguir practicando o volver al recorrido del área. En móvil
 * van apiladas a todo el ancho, como el cierre de un chat; en escritorio,
 * lado a lado.
 */
export function SessionCompleteActions({
  onContinuePracticing,
  isContinuing,
  tourHref,
  className,
}: SessionCompleteActionsProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
      className={cn(
        "flex w-full flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3",
        className,
      )}
    >
      <Button
        size="lg"
        className="h-12 w-full rounded-full sm:w-auto sm:min-w-52"
        onClick={onContinuePracticing}
        disabled={isContinuing}
      >
        {isContinuing ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <RotateCcw aria-hidden="true" />
        )}
        {en ? "Keep practicing" : "Seguir practicando"}
      </Button>
      <Button
        asChild
        size="lg"
        variant="outline"
        className="h-12 w-full rounded-full sm:w-auto sm:min-w-52"
      >
        <Link href={tourHref}>
          {en ? "Continue the tour" : "Continuar con el recorrido"}
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </motion.div>
  );
}
