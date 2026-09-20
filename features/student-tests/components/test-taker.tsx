"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CircleCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
} from "lucide-react";
import { StepProgress } from "@/components/ui/step-progress";
import { useLanguageStore } from "@/store/language-store";
import { useTranslatedTexts } from "@/features/translation/hooks/use-translated-texts";
import type { StudentQuestion } from "../types/student-test.types";

interface TestTakerProps {
  questions: StudentQuestion[];
  isSubmitting: boolean;
  onSubmit: (answers: { questionId: string; studentAnswer: string }[]) => void;
}

/**
 * Transición de una pregunta a otra: entra desde el lado hacia el que se
 * está navegando y sale hacia el contrario, para que se sienta un avance
 * (o retroceso) real y no un simple parpadeo. `custom` recibe la dirección
 * (+1 siguiente, -1 anterior).
 */
const questionVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? 48 : -48,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: "easeOut" as const, staggerChildren: 0.05, delayChildren: 0.06 },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -48 : 48,
    transition: { duration: 0.18, ease: "easeIn" as const },
  }),
};

/** Cada opción entra escalonada detrás de la pregunta (ver staggerChildren). */
const optionVariants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

/**
 * El estudiante responde las N preguntas sin feedback pregunta por pregunta
 * (a diferencia de FlashCardQuiz): `correctAnswer` nunca llega al cliente
 * en /student-tests/config, así que no hay forma de validar en vivo. Todas
 * las respuestas se guardan en memoria y se envían juntas al presionar
 * "Enviar examen" — el backend califica todo de una vez (ver
 * StudentTestsService.submit) y el resultado se revela después en
 * TestResults.
 */
export function TestTaker({ questions, isSubmitting, onSubmit }: TestTakerProps) {
  const language = useLanguageStore((state) => state.language);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const missingCount = questions.length - answeredCount;
  const isCurrentAnswered = answers[currentQuestion.id] !== undefined;

  // El estado de respuestas y el envío al backend siempre usan el texto
  // ORIGINAL de las opciones (correctAnswer se valida server-side contra
  // ese texto) — solo lo que se muestra en pantalla pasa por la traducción.
  const [translatedQuestion, ...translatedOptions] = useTranslatedTexts([
    currentQuestion.question,
    ...currentQuestion.options,
  ]);

  function goTo(index: number) {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }

  function handleSelect(option: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
  }

  function handleSubmit() {
    onSubmit(
      questions.map((question) => ({
        questionId: question.id,
        studentAnswer: answers[question.id] ?? "",
      })),
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <StepProgress
        total={questions.length}
        currentIndex={currentIndex}
        onStepClick={goTo}
        labelText={language === "en" ? "Question" : "Pregunta"}
      />

      <div className="relative">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            variants={questionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-soft-foreground">
                {language === "en" ? "Question" : "Pregunta"} {currentIndex + 1}
                <span className="text-accent-soft-foreground/70">
                  &nbsp;/ {questions.length}
                </span>
              </span>

              <AnimatePresence>
                {isCurrentAnswered && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-success"
                  >
                    <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    {language === "en" ? "Answered" : "Respondida"}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <p className="text-base font-semibold leading-snug text-foreground sm:text-lg">
              {translatedQuestion}
            </p>

            <div className="flex flex-col gap-2.5">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === option;
                const displayOption = translatedOptions[index] ?? option;
                const letter = String.fromCharCode(65 + index);

                return (
                  <motion.button
                    key={option}
                    type="button"
                    variants={optionVariants}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => handleSelect(option)}
                    aria-pressed={isSelected}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left transition-colors sm:px-4 ${
                      isSelected
                        ? "border-accent bg-accent-soft/60"
                        : "border-border bg-surface hover:border-accent/50 hover:bg-layer-hover"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "bg-surface-secondary text-muted"
                      }`}
                      aria-hidden="true"
                    >
                      {letter}
                    </span>

                    <span className="min-w-0 flex-1 break-words text-sm font-medium text-foreground sm:text-base">
                      {displayOption}
                    </span>

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isSelected ? "border-accent bg-accent" : "border-border"
                      }`}
                      aria-hidden="true"
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 22 }}
                          >
                            <Check
                              className="h-3 w-3 text-accent-foreground"
                              aria-hidden="true"
                            />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
          <span className="shrink-0 text-xs font-medium text-muted">
            {answeredCount}/{questions.length}{" "}
            {language === "en" ? "answered" : "respondidas"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <motion.button
            type="button"
            disabled={isFirst}
            onClick={() => goTo(currentIndex - 1)}
            whileHover={!isFirst ? { x: -2 } : undefined}
            whileTap={!isFirst ? { scale: 0.96 } : undefined}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-layer-hover disabled:pointer-events-none disabled:opacity-40 sm:min-w-36"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {language === "en" ? "Previous" : "Anterior"}
          </motion.button>

          {isLast ? (
            <motion.button
              type="button"
              disabled={!allAnswered || isSubmitting}
              onClick={handleSubmit}
              whileHover={allAnswered && !isSubmitting ? { scale: 1.02 } : undefined}
              whileTap={allAnswered && !isSubmitting ? { scale: 0.97 } : undefined}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50 sm:min-w-36"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {language === "en" ? "Submit test" : "Enviar examen"}
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={() => goTo(currentIndex + 1)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover sm:min-w-36"
            >
              {language === "en" ? "Next" : "Siguiente"}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </motion.button>
          )}
        </div>

        {/* En la última pregunta, "Enviar examen" se deshabilita hasta que
            estén todas respondidas — sin este aviso el botón apagado no
            explica qué falta. */}
        <AnimatePresence>
          {isLast && !allAnswered && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs text-muted"
            >
              {language === "en"
                ? `You still have ${missingCount} question${missingCount === 1 ? "" : "s"} to answer.`
                : `Te ${missingCount === 1 ? "falta" : "faltan"} ${missingCount} pregunta${missingCount === 1 ? "" : "s"} por responder.`}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
