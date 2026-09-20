"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepProgressProps {
  total: number;
  currentIndex: number;
  onStepClick: (index: number) => void;
  labelText: string;
}

/**
 * Línea de tiempo tipo "stepper" (inspirada en el patrón hs-stepper de
 * Preline, reimplementada en React puro con Framer Motion): círculos
 * numerados unidos por una línea, con estado completado (check verde,
 * entra con un "pop"), activo (relleno con el color de acento, con halo y
 * ligera escala) o pendiente (contorno neutro). Cada segmento completado de
 * la línea se "llena" animado (`scaleX` desde el origen izquierdo) en vez
 * de solo cambiar de color de golpe. Genérico — el índice actual vive en el
 * estado del componente que lo usa (embla en FlashCardDeck, un índice de
 * pregunta en TestTaker). Promovido desde FlashCards (ver CLAUDE.md: "si
 * dos features necesitan compartir algo, ese algo sube a components/").
 */
export function StepProgress({
  total,
  currentIndex,
  onStepClick,
  labelText,
}: StepProgressProps) {
  const activeStepRef = useRef<HTMLButtonElement>(null);
  // No hace scroll en el primer render: si se dispara justo cuando la
  // página todavía está asentando su layout (imágenes cargando, animaciones
  // de entrada en curso), puede competir con el scroll-to-top de Next.js al
  // navegar y dejar la página "a medias" (ver scroll-behavior: smooth en
  // app/layout.tsx). Solo importa llevar el paso activo a la vista cuando
  // el usuario navega entre pasos DESPUÉS de que la página ya cargó.
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

  const progressPercent =
    total > 1 ? (currentIndex / (total - 1)) * 100 : 100;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full bg-success"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
        />
      </div>

      <div className="flex items-center gap-3">
        {/* py-2.5: `overflow-x-auto` también recorta en vertical, y sin
            este aire el halo (`ring-4`) y la escala del paso activo salían
            cortados arriba y abajo (se veían como un rectángulo). */}
        <ol className="flex flex-1 items-center overflow-x-auto py-2.5">
          {Array.from({ length: total }).map((_, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            const isLastStep = index === total - 1;

            return (
              <li
                key={index}
                className={`flex items-center ${isLastStep ? "" : "flex-1"}`}
              >
                <motion.button
                  ref={isActive ? activeStepRef : undefined}
                  type="button"
                  onClick={() => onStepClick(index)}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`${labelText} ${index + 1}`}
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  whileHover={{ scale: isActive ? 1.15 : 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    isCompleted
                      ? "bg-success text-success-foreground"
                      : isActive
                        ? "bg-accent text-accent-foreground ring-4 ring-accent/25"
                        : "border border-border bg-surface text-muted"
                  }`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isCompleted ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="number"
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 22 }}
                      >
                        {index + 1}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {!isLastStep && (
                  <div className="mx-1.5 h-0.5 min-w-4 flex-1 overflow-hidden rounded-full bg-border">
                    <motion.div
                      className="h-full origin-left rounded-full bg-success"
                      initial={false}
                      animate={{ scaleX: isCompleted ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <span className="shrink-0 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-semibold text-muted">
          {currentIndex + 1}/{total}
        </span>
      </div>
    </div>
  );
}
