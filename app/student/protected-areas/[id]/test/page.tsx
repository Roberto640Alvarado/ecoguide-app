"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Lock } from "lucide-react";
import { Spinner } from "@heroui/react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { ProtectedAreaContextBanner } from "@/features/protected-areas/components/protected-area-context-banner";
import { useTestConfig } from "@/features/student-tests/hooks/use-test-config";
import { useSubmitTest } from "@/features/student-tests/hooks/use-submit-test";
import { TestTaker } from "@/features/student-tests/components/test-taker";
import { TestResults } from "@/features/student-tests/components/test-results";
import type { StudentTestResult } from "@/features/student-tests/types/student-test.types";

/**
 * Runtime del estudiante para el examen 1:1 del área (ver /student-tests en
 * la API). El config llega sin `correctAnswer` (StudentTestConfigDoc), así
 * que TestTaker no puede dar feedback en vivo — responde todo y envía. El
 * backend califica de una vez (StudentTestsService.submit) y el resultado
 * se revela pregunta por pregunta en TestResults.
 */
export default function StudentTestPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const { data: area, isLoading: isLoadingArea } = useProtectedArea(params.id);
  const {
    data: config,
    isLoading: isLoadingConfig,
    error: configError,
  } = useTestConfig(params.id);
  const submitTest = useSubmitTest(params.id);
  const [result, setResult] = useState<StudentTestResult | null>(null);

  const isLoading = isLoadingArea || isLoadingConfig;
  const tourHref = `/student/protected-areas/${params.id}/tour`;

  function handleSubmit(
    answers: { questionId: string; studentAnswer: string }[],
  ) {
    submitTest.mutate(
      { protectedAreaId: params.id, answers },
      { onSuccess: (data) => setResult(data) },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={tourHref}
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to tour" : "Volver al recorrido"}
      </Link>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
          <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {config?.title ?? (language === "en" ? "Test" : "Examen")}
          </h1>
          <p className="text-sm text-muted">
            {config?.description ??
              (language === "en"
                ? "Answer the quiz to check what you've learned."
                : "Responde el examen para comprobar lo que aprendiste.")}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="md" />
        </div>
      ) : !area ? (
        <p className="text-center text-sm text-muted">
          {language === "en"
            ? "Protected area not found."
            : "Área protegida no encontrada."}
        </p>
      ) : !config ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-surface-secondary/40 py-16 text-center">
          <ClipboardCheck className="h-8 w-8 text-muted" aria-hidden="true" />
          <p className="text-sm text-muted">
            {configError?.message ??
              (language === "en"
                ? "There's no test configured for this area yet."
                : "Todavía no hay un examen configurado para esta área.")}
          </p>
        </div>
      ) : (
        <>
          <ProtectedAreaContextBanner area={area} />

          {result ? (
            <TestResults
              questions={config.questions}
              result={result}
              maxAttempts={config.maxAttempts}
              onRetry={() => setResult(null)}
              tourHref={tourHref}
            />
          ) : config.attemptsRemaining <= 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-surface-secondary/40 py-16 text-center">
              <Lock className="h-8 w-8 text-muted" aria-hidden="true" />
              <p className="text-sm text-muted">
                {language === "en"
                  ? `You've used all ${config.maxAttempts} attempts for this test.`
                  : `Ya usaste tus ${config.maxAttempts} intentos para este examen.`}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted">
                {language === "en"
                  ? `Attempts used: ${config.attemptsUsed}/${config.maxAttempts}`
                  : `Intentos usados: ${config.attemptsUsed}/${config.maxAttempts}`}
              </p>
              <TestTaker
                questions={config.questions}
                isSubmitting={submitTest.isPending}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
