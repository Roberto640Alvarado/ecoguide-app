"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Spinner, toast } from "@heroui/react";
import { TextField } from "@/components/ui/text-field";
import { ToggleField } from "@/components/ui/toggle-field";
import { useLanguageStore } from "@/store/language-store";
import { QuestionBuilder } from "./question-builder";
import { testSchema, type TestFormValues } from "../schemas/test.schema";

interface TestFormProps {
  protectedAreaId: string;
  defaultValues?: TestFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: TestFormValues) => void;
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * Formulario del examen 1:1 del área (ver TestsService en la API): un solo
 * Test con N preguntas embebidas. La nota final del estudiante para el área
 * es simplemente el score de este examen (ver StudentTestsService), así que
 * `passingScore` es el umbral que decide "aprobado" y se valida en el
 * schema contra la suma de puntos de todas las preguntas.
 */
export function TestForm({
  protectedAreaId,
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
}: TestFormProps) {
  const language = useLanguageStore((state) => state.language);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: defaultValues ?? {
      protectedAreaId,
      title: "",
      description: "",
      maxAttempts: 3,
      passingScore: 60,
      questions: [{ question: "", options: ["", ""], correctAnswer: "", score: 10 }],
      isActive: true,
    },
  });

  const questions = useWatch({ control, name: "questions" }) ?? [];
  const totalScore = questions.reduce((sum, q) => sum + (q?.score || 0), 0);

  function handleInvalid(formErrors: typeof errors) {
    const firstMessage =
      formErrors.title?.message ??
      formErrors.description?.message ??
      formErrors.maxAttempts?.message ??
      formErrors.passingScore?.message ??
      formErrors.questions?.message ??
      formErrors.questions?.root?.message;

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
      <FormSection
        title={language === "en" ? "General" : "General"}
        description={
          language === "en"
            ? "Basic info the student sees before starting the test."
            : "Info básica que el estudiante ve antes de iniciar el examen."
        }
      >
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField
              {...field}
              label={language === "en" ? "Title" : "Título"}
              placeholder={
                language === "en"
                  ? "Final quiz: El Imposible National Park"
                  : "Examen final: Parque Nacional El Imposible"
              }
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              {...field}
              label={language === "en" ? "Description" : "Descripción"}
              placeholder={
                language === "en"
                  ? "Covers everything learned about this protected area."
                  : "Cubre todo lo aprendido sobre esta área protegida."
              }
              error={errors.description?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="maxAttempts"
            render={({ field }) => (
              <TextField
                type="number"
                step={1}
                min={1}
                value={Number.isNaN(field.value) ? "" : field.value}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                onBlur={field.onBlur}
                label={language === "en" ? "Max attempts" : "Intentos máximos"}
                error={errors.maxAttempts?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="passingScore"
            render={({ field }) => (
              <TextField
                type="number"
                step={1}
                min={0}
                value={Number.isNaN(field.value) ? "" : field.value}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                onBlur={field.onBlur}
                label={
                  language === "en" ? "Passing score" : "Puntaje mínimo aprobatorio"
                }
                error={errors.passingScore?.message}
              />
            )}
          />
        </div>
      </FormSection>

      <FormSection
        title={language === "en" ? "Questions" : "Preguntas"}
        description={
          language === "en"
            ? "Multiple choice. Total possible score updates as you add questions."
            : "Opción múltiple. El puntaje total posible se actualiza al agregar preguntas."
        }
      >
        <div className="flex items-center justify-between rounded-lg bg-default-soft px-4 py-2.5 text-sm font-medium text-foreground">
          <span>{language === "en" ? "Total possible score" : "Puntaje total posible"}</span>
          <span>{totalScore}</span>
        </div>

        <QuestionBuilder control={control} errors={errors} />
      </FormSection>

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
