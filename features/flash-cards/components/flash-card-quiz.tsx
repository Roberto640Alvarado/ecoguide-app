"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import type { FlashCard } from "../types/flash-card.types";

interface FlashCardQuizProps {
  card: FlashCard;
}

/**
 * Interacción de opción múltiple para tarjetas ENVIRONMENTAL. Mantiene su
 * propio estado de "opción elegida" — como FlashCardDeck monta todas las
 * tarjetas del mazo a la vez (mismo patrón que ProtectedAreaImageCarousel),
 * cada instancia conserva su respuesta al ir y volver entre tarjetas, sin
 * necesidad de sincronizar nada con el carrusel.
 */
export function FlashCardQuiz({ card }: FlashCardQuizProps) {
  const language = useLanguageStore((state) => state.language);
  const [selected, setSelected] = useState<string | null>(null);
  const hasAnswered = selected !== null;
  const isCorrect = selected === card.correctAnswer;

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-sm font-semibold text-foreground sm:text-base">
        {card.question}
      </p>

      <div className="flex flex-col gap-2">
        {card.options.map((option) => {
          const isSelected = selected === option;
          const isTheCorrectAnswer = option === card.correctAnswer;

          let stateClasses = "border-border bg-surface hover:border-accent";
          if (hasAnswered) {
            if (isTheCorrectAnswer) {
              stateClasses = "border-success-soft-foreground bg-success-soft";
            } else if (isSelected) {
              stateClasses = "border-danger-soft-foreground bg-danger-soft";
            } else {
              stateClasses = "border-border bg-surface opacity-60";
            }
          }

          return (
            <button
              key={option}
              type="button"
              disabled={hasAnswered}
              onClick={() => setSelected(option)}
              className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors disabled:cursor-default ${stateClasses}`}
            >
              {option}
              {hasAnswered && isTheCorrectAnswer && (
                <Check
                  className="h-4 w-4 shrink-0 text-success-soft-foreground"
                  aria-hidden="true"
                />
              )}
              {hasAnswered && isSelected && !isTheCorrectAnswer && (
                <X
                  className="h-4 w-4 shrink-0 text-danger-soft-foreground"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm font-medium ${
            isCorrect ? "text-success-soft-foreground" : "text-danger-soft-foreground"
          }`}
        >
          {isCorrect
            ? language === "en"
              ? "Correct!"
              : "¡Correcto!"
            : language === "en"
              ? `Not quite. The correct answer is "${card.correctAnswer}".`
              : `Casi. La respuesta correcta es "${card.correctAnswer}".`}
        </motion.p>
      )}
    </div>
  );
}
