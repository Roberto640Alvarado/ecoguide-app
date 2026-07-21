"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";

interface StepProgressProps {
  total: number;
  currentIndex: number;
  onStepClick: (index: number) => void;
  labelText: string;
}

/**
 * Línea de tiempo tipo "stepper" (inspirada en el patrón hs-stepper de
 * Preline, reimplementada en React puro): círculos numerados unidos por una
 * línea, con estado completado (check verde), activo (relleno con el color
 * de acento) o pendiente (contorno neutro). Genérico — el índice actual vive
 * en el estado del componente que lo usa (embla en FlashCardDeck, un índice
 * de pregunta en TestTaker). Promovido desde FlashCards (ver CLAUDE.md: "si
 * dos features necesitan compartir algo, ese algo sube a components/").
 */
export function StepProgress({
  total,
  currentIndex,
  onStepClick,
  labelText,
}: StepProgressProps) {
  const activeStepRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeStepRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentIndex]);

  return (
    <div className="flex items-center gap-3">
      <ol className="flex flex-1 items-center overflow-x-auto py-1">
        {Array.from({ length: total }).map((_, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isLastStep = index === total - 1;

          return (
            <li
              key={index}
              className={`flex items-center ${isLastStep ? "" : "flex-1"}`}
            >
              <button
                ref={isActive ? activeStepRef : undefined}
                type="button"
                onClick={() => onStepClick(index)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${labelText} ${index + 1}`}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                  isCompleted
                    ? "bg-success text-success-foreground"
                    : isActive
                      ? "bg-accent text-accent-foreground ring-2 ring-accent/30"
                      : "border border-border bg-surface text-muted"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </button>
              {!isLastStep && (
                <div
                  className={`mx-1.5 h-0.5 min-w-4 flex-1 rounded-full transition-colors ${
                    isCompleted ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
      <span className="shrink-0 text-xs font-medium text-muted">
        {currentIndex + 1}/{total}
      </span>
    </div>
  );
}
