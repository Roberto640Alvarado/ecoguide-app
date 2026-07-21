"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, Send } from "lucide-react";
import { StepProgress } from "@/components/ui/step-progress";
import { useLanguageStore } from "@/store/language-store";
import type { StudentQuestion } from "../types/student-test.types";

interface TestTakerProps {
  questions: StudentQuestion[];
  isSubmitting: boolean;
  onSubmit: (answers: { questionId: string; studentAnswer: string }[]) => void;
}

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
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

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
    <div className="flex flex-col gap-5">
      <StepProgress
        total={questions.length}
        currentIndex={currentIndex}
        onStepClick={setCurrentIndex}
        labelText={language === "en" ? "Question" : "Pregunta"}
      />

      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6"
      >
        <p className="text-sm font-semibold text-foreground sm:text-base">
          {currentQuestion.question}
        </p>

        <div className="flex flex-col gap-2">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors ${
                  isSelected
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-surface hover:border-accent"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => setCurrentIndex((index) => index - 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-layer-hover disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {language === "en" ? "Previous" : "Anterior"}
        </button>

        <span className="text-xs text-muted">
          {answeredCount}/{questions.length}{" "}
          {language === "en" ? "answered" : "respondidas"}
        </span>

        {isLast ? (
          <button
            type="button"
            disabled={!allAnswered || isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            {language === "en" ? "Submit test" : "Enviar examen"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => index + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            {language === "en" ? "Next" : "Siguiente"}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
