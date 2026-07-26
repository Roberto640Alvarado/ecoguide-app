"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useTranslatedTexts } from "@/features/translation/hooks/use-translated-texts";
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
 *
 * El estado de selección y la comparación con `correctAnswer` siempre usan
 * el texto ORIGINAL de `card.options` como clave — solo el texto que se
 * muestra en pantalla pasa por la traducción, para no romper la corrección
 * del quiz si DeepL traduce dos opciones distintas a un mismo texto en
 * inglés (poco probable, pero mejor no depender de eso).
 */
export function FlashCardQuiz({ card }: FlashCardQuizProps) {
  const language = useLanguageStore((state) => state.language);
  const [selected, setSelected] = useState<string | null>(null);
  const hasAnswered = selected !== null;
  const isCorrect = selected === card.correctAnswer;

  const [translatedQuestion, ...translatedOptions] = useTranslatedTexts([
    card.question ?? "",
    ...card.options,
  ]);
  const correctAnswerIndex = card.options.indexOf(card.correctAnswer ?? "");
  const translatedCorrectAnswer =
    correctAnswerIndex >= 0
      ? (translatedOptions[correctAnswerIndex] ?? card.correctAnswer)
      : card.correctAnswer;

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-sm font-semibold text-foreground sm:text-base">
        {translatedQuestion}
      </p>

      <div className="flex flex-col gap-2">
        {card.options.map((option, index) => {
          const isSelected = selected === option;
          const isTheCorrectAnswer = option === card.correctAnswer;
          const displayOption = translatedOptions[index] ?? option;

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
              {displayOption}
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
              ? `Not quite. The correct answer is "${translatedCorrectAnswer}".`
              : `Casi. La respuesta correcta es "${translatedCorrectAnswer}".`}
        </motion.p>
      )}
    </div>
  );
}
