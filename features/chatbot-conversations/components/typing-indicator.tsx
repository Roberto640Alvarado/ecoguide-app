"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EcoGuideAvatar } from "@/components/ui/eco-guide-avatar";
import { useLanguageStore } from "@/store/language-store";

const DOTS = [0, 1, 2];

/**
 * Burbuja de "escribiendo..." estilo iMessage: brota desde el avatar con un
 * resorte, los puntos laten en secuencia y se encoge al llegar la respuesta.
 */
export function TypingIndicator() {
  const language = useLanguageStore((state) => state.language);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      layout="position"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={
        reduceMotion
          ? { opacity: 0, transition: { duration: 0.1 } }
          : { opacity: 0, scale: 0.6, transition: { duration: 0.15 } }
      }
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      style={{ transformOrigin: "0% 100%" }}
      className="flex items-end gap-2 pt-3"
      role="status"
      aria-label={
        language === "en" ? "EcoGuía is typing" : "EcoGuía está escribiendo"
      }
    >
      <EcoGuideAvatar size={28} className="h-7 w-7" />
      <div className="flex items-center gap-1 rounded-[20px] rounded-bl-md bg-surface-secondary px-4 py-3.5">
        {DOTS.map((dot) => (
          <motion.span
            key={dot}
            className="h-2 w-2 rounded-full bg-muted"
            animate={
              reduceMotion
                ? undefined
                : { opacity: [0.35, 1, 0.35], scale: [0.85, 1.1, 0.85] }
            }
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot * 0.18,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
