"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, CircleCheck, CircleX, X } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useTranslatedTexts } from "@/features/translation/hooks/use-translated-texts";
import type { FlashCard } from "../types/flash-card.types";

interface FlashCardQuizProps {
  card: FlashCard;
  /** Opción elegida (texto original), o null si aún no responde. */
  selected: string | null;
  onSelect: (option: string) => void;
}

const OPTION_LETTERS = "ABCDEFGH";

/**
 * Opción múltiple de las tarjetas ENVIRONMENTAL. La respuesta la guarda el
 * mazo (FlashCardDeck): solo la tarjeta actual está montada, así que la
 * elección se conserva al ir y volver entre tarjetas.
 *
 * El estado de selección y la comparación con `correctAnswer` usan el texto
 * ORIGINAL de `card.options`; solo lo que se muestra pasa por traducción.
 */
export function FlashCardQuiz({ card, selected, onSelect }: FlashCardQuizProps) {
  const language = useLanguageStore((state) => state.language);
  const reduceMotion = useReducedMotion();
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
    <div className="flex w-full flex-col gap-4">
      <p className="text-lg font-semibold leading-snug text-foreground sm:text-xl">
        {translatedQuestion}
      </p>

      <div className="grid grid-cols-1 gap-2.5" role="group">
        {card.options.map((option, index) => {
          const isSelected = selected === option;
          const isTheCorrectAnswer = option === card.correctAnswer;
          const displayOption = translatedOptions[index] ?? option;
          const isWrongPick = hasAnswered && isSelected && !isTheCorrectAnswer;

          let stateClasses =
            "border-border bg-background hover:border-primary hover:bg-success-soft/30";
          let letterClasses = "bg-default-soft text-foreground";
          if (hasAnswered) {
            if (isTheCorrectAnswer) {
              stateClasses = "border-success-soft-foreground bg-success-soft";
              letterClasses = "bg-primary text-primary-foreground";
            } else if (isSelected) {
              stateClasses = "border-danger-soft-foreground bg-danger-soft";
              letterClasses = "bg-danger text-danger-foreground";
            } else {
              stateClasses = "border-border bg-background opacity-50";
            }
          }

          return (
            <motion.button
              key={option}
              type="button"
              disabled={hasAnswered}
              onClick={() => onSelect(option)}
              animate={
                isWrongPick && !reduceMotion
                  ? { x: [0, -8, 8, -5, 5, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.4 }}
              whileTap={!hasAnswered ? { scale: 0.98 } : undefined}
              className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left text-sm font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default sm:text-base ${stateClasses}`}
            >
              <span
                aria-hidden="true"
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${letterClasses}`}
              >
                {OPTION_LETTERS[index] ?? index + 1}
              </span>
              <span className="min-w-0 flex-1">{displayOption}</span>
              <AnimatePresence>
                {hasAnswered && (isTheCorrectAnswer || isSelected) && (
                  <motion.span
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className="shrink-0"
                  >
                    {isTheCorrectAnswer ? (
                      <Check className="size-5 text-success-soft-foreground" aria-hidden="true" />
                    ) : (
                      <X className="size-5 text-danger-soft-foreground" aria-hidden="true" />
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {hasAnswered && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
            className={`flex items-start gap-2.5 rounded-2xl p-4 text-sm font-medium ${
              isCorrect
                ? "bg-success-soft text-success-soft-foreground"
                : "bg-danger-soft text-danger-soft-foreground"
            }`}
          >
            {isCorrect ? (
              <CircleCheck className="size-5 shrink-0" aria-hidden="true" />
            ) : (
              <CircleX className="size-5 shrink-0" aria-hidden="true" />
            )}
            <span>
              {isCorrect
                ? language === "en"
                  ? "Correct! You can move on to the next card."
                  : "¡Correcto! Ya puedes pasar a la siguiente tarjeta."
                : language === "en"
                  ? `Not quite. The correct answer is "${translatedCorrectAnswer}".`
                  : `Casi. La respuesta correcta es "${translatedCorrectAnswer}".`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
