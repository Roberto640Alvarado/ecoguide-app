"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { Spinner } from "@heroui/react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useTestByArea } from "@/features/tests/hooks/use-test-by-area";
import { useCreateTest } from "@/features/tests/hooks/use-create-test";
import { useUpdateTest } from "@/features/tests/hooks/use-update-test";
import { TestForm } from "@/features/tests/components/test-form";
import type { TestFormValues } from "@/features/tests/schemas/test.schema";

/**
 * Config 1:1 del examen del área (ver TestsService en la API): un solo Test
 * con N preguntas embebidas por área protegida. Si el área todavía no tiene
 * examen, el formulario arranca vacío y el submit crea uno; si ya existe,
 * arranca precargado (incluyendo correctAnswer, visible solo aquí) y el
 * submit actualiza.
 */
export default function TestConfigPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const { data: area, isLoading: isLoadingArea } = useProtectedArea(params.id);
  const { data: test, isLoading: isLoadingTest } = useTestByArea(params.id);

  const createTest = useCreateTest();
  const updateTest = useUpdateTest(test?.id ?? "", params.id);

  const isLoading = isLoadingArea || isLoadingTest;

  function handleSubmit(values: TestFormValues) {
    if (test) {
      updateTest.mutate(values);
    } else {
      createTest.mutate(values);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/teacher/protected-areas/${params.id}/edit`}
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to area" : "Volver al área"}
      </Link>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
          <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isLoading
              ? language === "en"
                ? "Loading..."
                : "Cargando..."
              : (area?.name ?? (language === "en" ? "Test" : "Examen"))}
          </h1>
          <p className="text-sm text-muted">
            {language === "en" ? "Test configuration" : "Configuración del examen"}
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
      ) : (
        <>
          <TestForm
            protectedAreaId={params.id}
            defaultValues={
              test
                ? {
                    protectedAreaId: params.id,
                    title: test.title,
                    description: test.description,
                    maxAttempts: test.maxAttempts,
                    passingScore: test.passingScore,
                    questions: test.questions.map((question) => ({
                      question: question.question,
                      options: question.options,
                      correctAnswer: question.correctAnswer,
                      score: question.score,
                    })),
                    isActive: test.isActive,
                  }
                : undefined
            }
            isSubmitting={createTest.isPending || updateTest.isPending}
            submitLabel={
              test
                ? language === "en"
                  ? "Save changes"
                  : "Guardar cambios"
                : language === "en"
                  ? "Create test"
                  : "Crear examen"
            }
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}
