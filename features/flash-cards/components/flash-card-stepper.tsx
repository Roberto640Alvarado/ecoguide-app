"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { FlashCardAvatar } from "./flash-card-avatar";
import {
  FLASH_CARD_TYPE_LABELS,
  FLASH_CARD_TYPE_TONE,
  type FlashCardType,
} from "../types/flash-card.types";

interface FlashCardStepperProps {
  /** Tipo de cada tarjeta del mazo, en orden — un paso por tarjeta. */
  types: FlashCardType[];
  currentIndex: number;
  onStepClick: (index: number) => void;
}

/**
 * Stepper propio del mazo de flashcards: reemplaza a la combinación
 * anterior de "chips de categoría" + `StepProgress` genérico, que mostraban
 * dos veces la misma información (en qué tarjeta voy) ocupando dos filas.
 *
 * Cada paso es una caja redondeada con la mascota de su categoría y una
 * insignia de número (o check cuando ya se pasó por ella). El paso ACTIVO
 * se expande mostrando además el nombre de la categoría y se tiñe con el
 * tono de esa categoría — la expansión/colapso la anima Framer Motion con
 * `layout`, así que la fila se reacomoda suavemente al avanzar. En
 * pantallas angostas la fila hace scroll horizontal y el paso activo se
 * trae a la vista solo cuando el usuario navega (nunca en el primer
 * render, para no competir con el scroll-to-top de Next.js al cambiar de
 * ruta).
 *
 * `StepProgress` (components/ui) sigue existiendo para TestTaker: aquel es
 * genérico y numérico, este es específico de flashcards porque muestra la
 * mascota y la categoría de cada tarjeta.
 */
export function FlashCardStepper({
  types,
  currentIndex,
  onStepClick,
}: FlashCardStepperProps) {
  const language = useLanguageStore((state) => state.language);
  const activeStepRef = useRef<HTMLButtonElement>(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    activeStepRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentIndex]);

  return (
    <div className="flex items-center gap-3">
      <ol className="-mx-1 flex flex-1 items-center gap-2 overflow-x-auto px-1 py-1">
        {types.map((type, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const theme = FLASH_CARD_TYPE_TONE[type];
          const label = FLASH_CARD_TYPE_LABELS[type][language];

          return (
            <li key={index} className="shrink-0">
              <motion.button
                ref={isActive ? activeStepRef : undefined}
                layout
                type="button"
                onClick={() => onStepClick(index)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${label} — ${index + 1}/${types.length}`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className={`flex items-center gap-2 rounded-2xl border-2 px-2.5 py-2 ${
                  isActive
                    ? `border-accent ${theme.chipBg} shadow-sm`
                    : isCompleted
                      ? "border-success/40 bg-success-soft/20"
                      : "border-border bg-surface"
                }`}
              >
                <FlashCardAvatar
                  type={type}
                  className={`h-7 w-7 shrink-0 object-contain transition-opacity ${
                    isActive || isCompleted ? "opacity-100" : "opacity-60"
                  }`}
                />

                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`overflow-hidden whitespace-nowrap text-xs font-semibold ${theme.chipText}`}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                    isCompleted
                      ? "bg-success text-success-foreground"
                      : isActive
                        ? "bg-accent text-accent-foreground"
                        : "bg-surface-secondary text-muted"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
              </motion.button>
            </li>
          );
        })}
      </ol>

      <span className="shrink-0 rounded-full bg-surface-secondary px-2.5 py-1 text-xs font-semibold text-muted">
        {currentIndex + 1}/{types.length}
      </span>
    </div>
  );
}
