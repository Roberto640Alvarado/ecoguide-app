"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguageStore, type Language } from "@/store/language-store";

const OPTIONS: { value: Language; short: string; name: string }[] = [
  { value: "es", short: "ES", name: "Español" },
  { value: "en", short: "EN", name: "English" },
];

/**
 * Selector de idioma de la interfaz como control segmentado: se ven las dos
 * opciones a la vez y la activa queda marcada (antes era un botón que
 * mostraba el idioma al que se iba a cambiar, lo que confundía).
 */
export function LanguageSwitch() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="radiogroup"
      aria-label={language === "en" ? "Language" : "Idioma"}
      className="relative flex h-[30px] items-center rounded-full border border-border bg-muted/60 p-0.5"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === language;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.name}
            title={option.name}
            onClick={() => setLanguage(option.value)}
            className={`relative h-full min-w-10 rounded-full px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="language-switch-indicator"
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-primary shadow-sm"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 500, damping: 36 }
                }
              />
            )}
            <span className="relative">{option.short}</span>
          </button>
        );
      })}
    </div>
  );
}
