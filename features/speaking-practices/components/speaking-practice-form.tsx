"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Spinner, toast } from "@heroui/react";
import { PromptExampleTip } from "@/components/ui/prompt-example-tip";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { TextField } from "@/components/ui/text-field";
import { ToggleField } from "@/components/ui/toggle-field";
import { plainTextToRichText, stripHtmlToText } from "@/lib/utils/rich-text";
import { ProviderModelField } from "@/features/ai-providers/components/provider-model-field";
import { useLanguageStore } from "@/store/language-store";
import {
  speakingPracticeSchema,
  type SpeakingPracticeFormValues,
} from "../schemas/speaking-practice.schema";

interface SpeakingPracticeFormProps {
  protectedAreaId: string;
  /** Nombre + descripción del área, para armar el ejemplo de prompt sugerido
   * con datos reales en vez de una referencia genérica. */
  area: { name: string; description: string };
  defaultValues?: SpeakingPracticeFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: SpeakingPracticeFormValues) => void;
}

function buildPromptExample(
  area: { name: string; description: string },
  language: "en" | "es",
): string {
  const description = stripHtmlToText(area.description);

  if (language === "en") {
    return `You are an English-speaking evaluator for ecotourism guides.
The student will describe out loud, for 1-2 minutes, a topic related to ${area.name} (its flora, fauna, trails, or conservation).

About this place: ${description}

Evaluate: pronunciation, fluency, vocabulary related to the area, and grammar.
Give constructive feedback in clear, encouraging language: 2 strengths, 1-2 areas to improve, and a score from 1 to 10.`;
  }

  return `Eres un evaluador de speaking en inglés para guías de ecoturismo.
El estudiante describirá en voz alta, durante 1-2 minutos, un tema relacionado a ${area.name} (su flora, fauna, senderos o conservación).

Sobre este lugar: ${description}

Evalúa: pronunciación, fluidez, vocabulario relacionado al área y gramática.
Da retroalimentación constructiva y alentadora: 2 fortalezas, 1-2 áreas de mejora, y una calificación del 1 al 10.`;
}

/**
 * Formulario de la práctica de speaking del área (1:1, ver
 * SpeakingPracticesService en la API) — el docente agrega las indicaciones
 * para el estudiante, elige el proveedor/modelo de IA y escribe el prompt
 * que evaluará el audio y dará retroalimentación. El nombre/descripción del
 * área ya viaja automáticamente en el prompt real que recibe la IA (ver
 * buildAreaContext en la API) — el ejemplo sugerido aquí solo ayuda al
 * docente a escribir un buen prompt de evaluación, usando esos mismos datos.
 */
export function SpeakingPracticeForm({
  protectedAreaId,
  area,
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
}: SpeakingPracticeFormProps) {
  const language = useLanguageStore((state) => state.language);
  const promptExample = buildPromptExample(area, language);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SpeakingPracticeFormValues>({
    resolver: zodResolver(speakingPracticeSchema),
    defaultValues: defaultValues ?? {
      protectedAreaId,
      title: "",
      instructions: "",
      providerId: "",
      model: "",
      prompt: "",
      isActive: true,
    },
  });

  const providerId = watch("providerId");
  const model = watch("model");

  function handleInvalid(formErrors: typeof errors) {
    const firstMessage = Object.values(formErrors)[0]?.message;

    toast.danger(
      firstMessage ??
        (language === "en"
          ? "Check the highlighted fields before submitting."
          : "Revisa los campos marcados antes de enviar."),
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, handleInvalid)}
      className="flex flex-col gap-5"
      noValidate
    >
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">
          {language === "en" ? "Practice" : "Práctica"}
        </h2>

        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField
              {...field}
              label={language === "en" ? "Title" : "Título"}
              placeholder={
                language === "en"
                  ? "Describe the cloud forest"
                  : "Describe el bosque nuboso"
              }
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="instructions"
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              label={
                language === "en"
                  ? "Instructions for the student"
                  : "Indicaciones para el estudiante"
              }
              placeholder={
                language === "en"
                  ? "What should the student do before recording (topic, duration)?"
                  : "Qué debe hacer el estudiante antes de grabar (tema, duración)."
              }
              error={errors.instructions?.message}
            />
          )}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {language === "en" ? "AI model" : "Modelo de IA"}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {language === "en"
              ? "Choose the active provider and model that will evaluate the student's recording."
              : "Elige el proveedor y modelo activo que evaluará la grabación del estudiante."}
          </p>
        </div>

        <ProviderModelField
          providerId={providerId}
          model={model}
          onProviderChange={(value) =>
            setValue("providerId", value, { shouldValidate: true, shouldDirty: true })
          }
          onModelChange={(value) =>
            setValue("model", value, { shouldValidate: true, shouldDirty: true })
          }
          providerError={errors.providerId?.message}
          modelError={errors.model?.message}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {language === "en" ? "Evaluation prompt" : "Prompt de evaluación"}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {language === "en"
              ? "What the AI receives to evaluate the student's speaking and generate feedback."
              : "Lo que recibe la IA para evaluar el speaking del estudiante y generar retroalimentación."}
          </p>
        </div>

        <PromptExampleTip
          title={
            language === "en" ? "Good prompt practice" : "Buena práctica de prompt"
          }
          example={promptExample}
          onUseExample={() =>
            setValue("prompt", plainTextToRichText(promptExample), {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
        />

        <Controller
          control={control}
          name="prompt"
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              label="Prompt"
              placeholder={
                language === "en"
                  ? "Define the AI's role, what to evaluate and how to give feedback."
                  : "Define el rol de la IA, qué evaluar y cómo dar la retroalimentación."
              }
              error={errors.prompt?.message}
            />
          )}
        />
      </section>

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <ToggleField
            label={language === "en" ? "Active" : "Activo"}
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <div className="flex justify-end gap-2">
        <Button type="submit" variant="primary" isDisabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
