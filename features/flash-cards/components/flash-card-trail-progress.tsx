"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguageStore } from "@/store/language-store";
import { FlashCardAvatar } from "./flash-card-avatar";
import {
  FLASH_CARD_TYPE_LABELS,
  FLASH_CARD_TYPE_TONE,
  type FlashCardType,
} from "../types/flash-card.types";

interface FlashCardTrailProgressProps {
  /** Tipo de cada tarjeta del mazo, en orden: un punto por tarjeta. */
  types: FlashCardType[];
  currentIndex: number;
  onStepClick: (index: number) => void;
}

/**
 * Progreso del mazo como un sendero (el estudiante está "recorriendo" el
 * área protegida): un punto por tarjeta unido por un camino que se pinta en
 * verde a medida que avanza, y la mascota de la categoría actual caminando
 * sobre el punto en el que va (se desplaza con `layoutId`). Cada punto es un
 * botón para saltar a esa tarjeta.
 *
 * Los puntos se reparten en todo el ancho (flex-1 por tramo), así que el
 * sendero cabe sin scroll horizontal incluso con 30 tarjetas en móvil.
 */
export function FlashCardTrailProgress({
  types,
  currentIndex,
  onStepClick,
}: FlashCardTrailProgressProps) {
  const language = useLanguageStore((state) => state.language);
  const reduceMotion = useReducedMotion();
  const currentType = types[currentIndex];
  const progress = types.length > 1 ? currentIndex / (types.length - 1) : 1;

  return (
    <nav
      aria-label={language === "en" ? "Flashcard progress" : "Progreso de las flashcards"}
      className="flex flex-col gap-2 px-3"
    >
      <div className="relative pt-11">
        {/* Camino: base gris + tramo recorrido en verde. Va de centro a
            centro del primer y último punto (inset de medio punto). */}
        <div
          aria-hidden="true"
          className="absolute inset-x-2 bottom-[7px] h-1 rounded-full bg-border"
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-[7px] left-2 h-1 origin-left rounded-full bg-primary"
          style={{ width: "calc(100% - 1rem)" }}
          initial={false}
          animate={{ scaleX: progress }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 140, damping: 24 }
          }
        />

        <ol className="relative flex items-end justify-between">
          {types.map((type, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            const label = FLASH_CARD_TYPE_LABELS[type][language];
            // El cambio de categoría marca un hito en el sendero.
            const startsCategory = index === 0 || types[index - 1] !== type;

            return (
              <li key={index} className="relative flex justify-center">
                {isActive && (
                  // Contenedor de ancho 0 centrado sobre el punto: así la
                  // mascota queda centrada sin usar transform (Framer Motion
                  // lo controla para animar el layoutId).
                  <div className="pointer-events-none absolute bottom-6 left-1/2 flex w-0 justify-center">
                    <motion.div
                      layoutId="flash-card-trail-mascot"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 260, damping: 26 }
                      }
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-surface shadow-md ${FLASH_CARD_TYPE_TONE[type].chipBg}`}
                    >
                      <FlashCardAvatar
                        type={type}
                        className="size-8 object-contain"
                      />
                    </motion.div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onStepClick(index)}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`${index + 1} / ${types.length}: ${label}`}
                  title={label}
                  className="group flex size-4 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <span
                    className={`block rounded-full transition-all duration-200 ${
                      isActive
                        ? "size-4 bg-primary ring-4 ring-primary/20"
                        : isCompleted
                          ? `bg-primary ${startsCategory ? "size-3" : "size-2"}`
                          : `border-2 border-border bg-surface group-hover:border-primary ${
                              startsCategory ? "size-3" : "size-2.5"
                            }`
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex items-baseline justify-between gap-3 text-sm">
        <motion.span
          key={currentType}
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`font-semibold ${FLASH_CARD_TYPE_TONE[currentType].chipText}`}
        >
          {FLASH_CARD_TYPE_LABELS[currentType][language]}
        </motion.span>
        <span className="tabular-nums text-muted">
          {language === "en"
            ? `${currentIndex + 1} of ${types.length}`
            : `${currentIndex + 1} de ${types.length}`}
        </span>
      </div>
    </nav>
  );
}
