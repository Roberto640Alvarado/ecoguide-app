"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Award, Check, PartyPopper, RotateCcw, X } from "lucide-react";
import { Button } from "@heroui/react";
import { useLanguageStore } from "@/store/language-store";
import { useTranslatedTexts } from "@/features/translation/hooks/use-translated-texts";
import { useCheckAreaBadges } from "@/features/student-progress/hooks/use-check-area-badges";
import { BadgeUnlockDialog } from "@/features/badges/components/badge-unlock-dialog";
import type { Badge } from "@/features/badges/types/badge.types";
import type {
  AnswerResult,
  StudentQuestion,
  StudentTestResult,
} from "../types/student-test.types";

interface TestResultsProps {
  questions: StudentQuestion[];
  result: StudentTestResult;
  maxAttempts: number;
  protectedAreaId: string;
  onRetry: () => void;
  tourHref: string;
}

const REVEAL_INTERVAL_MS = 550;

/** Ráfaga pequeña por pregunta acertada, alternando de dónde sale para que
 * varias seguidas no se vean idénticas. */
function smallConfetti(originX: number) {
  confetti({
    particleCount: 28,
    spread: 55,
    origin: { x: originX, y: 0.6 },
    disableForReducedMotion: true,
    zIndex: 60,
  });
}

/** Misma ráfaga de celebración que FlashCardFinishDialog (dos laterales +
 * una central), reservada para cuando el estudiante aprueba el examen. */
function bigConfetti() {
  const shared = { zIndex: 60, disableForReducedMotion: true };
  confetti({ ...shared, particleCount: 90, spread: 100, origin: { x: 0.5, y: 0.7 } });
  confetti({ ...shared, particleCount: 55, spread: 70, angle: 60, origin: { x: 0.1, y: 0.75 } });
  confetti({ ...shared, particleCount: 55, spread: 70, angle: 120, origin: { x: 0.9, y: 0.75 } });
}

interface ResultRowProps {
  question: StudentQuestion;
  answer: AnswerResult;
  index: number;
}

/**
 * Fila de una pregunta ya revelada. TestResults solo la monta una vez (al
 * hacer `questions.slice(0, revealedCount)`, cada fila entra al DOM
 * exactamente una vez), así que el useEffect de confeti/sacudida corre una
 * única vez por fila, en el momento justo en que se revela.
 */
function ResultRow({ question, answer, index }: ResultRowProps) {
  const language = useLanguageStore((state) => state.language);
  const [translatedQuestion, translatedAnswer] = useTranslatedTexts([
    question.question,
    answer.studentAnswer,
  ]);

  useEffect(() => {
    if (answer.isCorrect) {
      smallConfetti(0.2 + (index % 3) * 0.3);
    }
    // Solo debe dispararse al montarse (una revelación = un disparo), no en
    // cada re-render de TestResults.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        x: answer.isCorrect ? 0 : [0, -6, 6, -6, 6, 0],
      }}
      transition={{ duration: 0.45 }}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
        answer.isCorrect
          ? "border-success-soft-foreground bg-success-soft"
          : "border-danger-soft-foreground bg-danger-soft"
      }`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          answer.isCorrect
            ? "bg-success text-success-foreground"
            : "bg-danger text-danger-foreground"
        }`}
      >
        {answer.isCorrect ? (
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </span>
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">{translatedQuestion}</p>
        <p className="text-xs text-muted">
          {language === "en" ? "Your answer: " : "Tu respuesta: "}
          {translatedAnswer || (language === "en" ? "(empty)" : "(vacío)")}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Revela el resultado pregunta por pregunta (con confeti si acertó / sacudida
 * si falló) y, al terminar, muestra la nota final con una animación de
 * "lo lograste" (confeti grande) o "sigue practicando" (icono con rebote),
 * más cuántos intentos lleva usados y le quedan. `correctAnswer` nunca pasa
 * por este componente — solo se conoce si cada respuesta propia fue
 * correcta o no (ver AnswerResponseDoc en la API).
 */
export function TestResults({
  questions,
  result,
  maxAttempts,
  protectedAreaId,
  onRetry,
  tourHref,
}: TestResultsProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const [revealedCount, setRevealedCount] = useState(0);
  const showGrade = revealedCount >= questions.length;
  const attemptsRemaining = Math.max(0, maxAttempts - result.attempt);

  const { mutate: checkAreaBadges } = useCheckAreaBadges();
  const [justUnlocked, setJustUnlocked] = useState<Badge[]>([]);
  const hasCheckedBadgesRef = useRef(false);

  useEffect(() => {
    if (revealedCount >= questions.length) return;

    const timer = setTimeout(() => {
      setRevealedCount((count) => count + 1);
    }, REVEAL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [revealedCount, questions.length]);

  useEffect(() => {
    if (showGrade && result.passed) {
      bigConfetti();
    }
    // Dispara una sola vez, justo cuando termina la revelación y el examen
    // fue aprobado — no en cada re-render posterior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGrade]);

  useEffect(() => {
    // Aprobar el examen puede ser el último paso pendiente del recorrido —
    // se revisa (y, si corresponde, se otorga) la insignia del área de una
    // vez acá, sin esperar a que el estudiante vuelva a la vista de
    // recorrido. checkAndAwardBadges ya valida TODOS los pasos del área, así
    // que si todavía falta alguno simplemente no desbloquea nada.
    if (!showGrade || !result.passed || hasCheckedBadgesRef.current) return;
    hasCheckedBadgesRef.current = true;

    checkAreaBadges(protectedAreaId, {
      onSuccess: (award) => {
        if (award.justUnlocked.length > 0) {
          setJustUnlocked(award.justUnlocked);
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGrade, result.passed, protectedAreaId]);

  return (
    <div className="flex flex-col gap-4">
      <BadgeUnlockDialog
        badge={justUnlocked[0] ?? null}
        onClose={() => setJustUnlocked((prev) => prev.slice(1))}
      />

      <div className="flex flex-col gap-2">
        {questions.slice(0, revealedCount).map((question, index) => {
          const answer = result.answers.find(
            (a) => a.questionId === question.id,
          );

          if (!answer) return null;

          return (
            <ResultRow
              key={question.id}
              question={question}
              answer={answer}
              index={index}
            />
          );
        })}
      </div>

      {showGrade && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className={`flex flex-col items-center gap-3 rounded-2xl border p-6 text-center ${
            result.passed
              ? "border-success-soft-foreground bg-success-soft"
              : "border-warning-soft-foreground bg-warning-soft"
          }`}
        >
          <motion.span
            animate={
              result.passed
                ? { rotate: [0, -10, 10, -10, 0] }
                : { y: [0, -4, 0] }
            }
            transition={
              result.passed
                ? { duration: 0.7 }
                : { duration: 1.2, repeat: Infinity, repeatDelay: 0.6 }
            }
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              result.passed
                ? "bg-success text-success-foreground"
                : "bg-warning-soft text-warning-soft-foreground"
            }`}
          >
            {result.passed ? (
              <PartyPopper className="h-7 w-7" aria-hidden="true" />
            ) : (
              <Award className="h-7 w-7" aria-hidden="true" />
            )}
          </motion.span>

          <div>
            <h3 className="text-lg font-bold text-foreground">
              {result.passed
                ? en
                  ? "You passed!"
                  : "¡Aprobaste!"
                : attemptsRemaining === 0
                  ? en
                    ? "Out of attempts"
                    : "Se acabaron tus intentos"
                  : en
                    ? "Keep practicing"
                    : "Sigue practicando"}
            </h3>
            <p className="text-sm text-muted">
              {en
                ? `Score: ${result.score} (passing: ${result.passingScore})`
                : `Puntaje: ${result.score} (mínimo: ${result.passingScore})`}
            </p>
          </div>

          <p className="text-xs text-muted">
            {en
              ? `Attempt ${result.attempt} of ${maxAttempts}`
              : `Intento ${result.attempt} de ${maxAttempts}`}
          </p>

          {result.passed && (
            <p className="text-xs text-muted">
              {attemptsRemaining > 0
                ? en
                  ? "You can keep trying if you want to improve your score."
                  : "Puedes seguir intentando si quieres mejorar tu nota."
                : en
                  ? "That's your final grade for this test."
                  : "Esa fue tu nota final para este examen."}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {attemptsRemaining > 0 && (
              <Button variant="primary" onPress={onRetry} className="gap-1.5">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {result.passed
                  ? en
                    ? "Try to improve"
                    : "Intentar mejorar"
                  : en
                    ? "Try again"
                    : "Intentar de nuevo"}
              </Button>
            )}
            <Link
              href={tourHref}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-layer-hover"
            >
              {en ? "Back to tour" : "Volver al recorrido"}
            </Link>
          </div>

          {!result.passed && attemptsRemaining === 0 && (
            <p className="text-xs text-danger">
              {en
                ? "You ran out of attempts for this test."
                : "Se vencieron tus intentos para este examen."}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
