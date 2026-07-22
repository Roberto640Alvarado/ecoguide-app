"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mic } from "lucide-react";
import { Spinner } from "@heroui/react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useSpeakingPracticeByArea } from "@/features/speaking-practices/hooks/use-speaking-practice-by-area";
import { useCreateSpeakingPractice } from "@/features/speaking-practices/hooks/use-create-speaking-practice";
import { useUpdateSpeakingPractice } from "@/features/speaking-practices/hooks/use-update-speaking-practice";
import { SpeakingPracticeForm } from "@/features/speaking-practices/components/speaking-practice-form";
import type { SpeakingPracticeFormValues } from "@/features/speaking-practices/schemas/speaking-practice.schema";

/**
 * Config 1:1 de la práctica de speaking del área (ver
 * SpeakingPracticesService en la API). Si el área todavía no tiene una
 * práctica configurada, el formulario arranca vacío y el submit crea una;
 * si ya existe, arranca precargado y el submit actualiza.
 */
export default function SpeakingPracticeConfigPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const { data: area, isLoading: isLoadingArea } = useProtectedArea(params.id);
  const { data: practice, isLoading: isLoadingPractice } =
    useSpeakingPracticeByArea(params.id);

  const createPractice = useCreateSpeakingPractice();
  const updatePractice = useUpdateSpeakingPractice(
    practice?.id ?? "",
    params.id,
  );

  const isLoading = isLoadingArea || isLoadingPractice;

  function handleSubmit(values: SpeakingPracticeFormValues) {
    if (practice) {
      updatePractice.mutate(values);
    } else {
      createPractice.mutate(values);
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
          <Mic className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isLoading
              ? language === "en"
                ? "Loading..."
                : "Cargando..."
              : (area?.name ??
                (language === "en" ? "Speaking practice" : "Práctica de speaking"))}
          </h1>
          <p className="text-sm text-muted">
            {language === "en"
              ? "Speaking practice configuration"
              : "Configuración de práctica de speaking"}
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
          <SpeakingPracticeForm
            protectedAreaId={params.id}
            area={{ name: area.name, description: area.description }}
            defaultValues={
              practice
                ? {
                    protectedAreaId: params.id,
                    title: practice.title,
                    instructions: practice.instructions,
                    providerId: practice.providerId,
                    model: practice.model,
                    prompt: practice.prompt,
                    isActive: practice.isActive,
                  }
                : undefined
            }
            isSubmitting={createPractice.isPending || updatePractice.isPending}
            submitLabel={
              practice
                ? language === "en"
                  ? "Save changes"
                  : "Guardar cambios"
                : language === "en"
                  ? "Create practice"
                  : "Crear práctica"
            }
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}
