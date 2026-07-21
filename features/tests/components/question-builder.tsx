"use client";

import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { Button } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { OptionsListField } from "@/components/ui/options-list-field";
import { TextField } from "@/components/ui/text-field";
import { useLanguageStore } from "@/store/language-store";
import type { TestFormValues } from "../schemas/test.schema";

interface QuestionBuilderProps {
  control: Control<TestFormValues>;
  errors: FieldErrors<TestFormValues>;
}

const selectClassName =
  "py-2.5 sm:py-3 px-4 block w-full bg-layer border border-layer-line rounded-lg sm:text-sm text-foreground focus:outline-hidden focus:border-primary-focus focus:ring-1 focus:ring-primary-focus disabled:opacity-50 disabled:pointer-events-none";

const EMPTY_QUESTION: TestFormValues["questions"][number] = {
  question: "",
  options: ["", ""],
  correctAnswer: "",
  score: 1,
};

interface QuestionCardProps {
  control: Control<TestFormValues>;
  index: number;
  errors: FieldErrors<TestFormValues>;
  onRemove: () => void;
  showRemove: boolean;
}

/**
 * Fila individual de pregunta. Vive en su propio componente (en vez de un
 * .map inline en QuestionBuilder) porque necesita useWatch sobre sus propias
 * `options` para poblar el <select> de "respuesta correcta" en vivo mientras
 * el docente escribe — useWatch solo puede llamarse en el nivel superior de
 * un componente, no dentro de un callback de map.
 */
function QuestionCard({
  control,
  index,
  errors,
  onRemove,
  showRemove,
}: QuestionCardProps) {
  const language = useLanguageStore((state) => state.language);
  const questionErrors = errors.questions?.[index];
  const currentOptions = (
    useWatch({ control, name: `questions.${index}.options` }) ?? []
  ).filter((option) => option.trim().length > 0);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-layer p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          {language === "en" ? "Question" : "Pregunta"} {index + 1}
        </h3>
        {showRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onPress={onRemove}
            aria-label={language === "en" ? "Remove question" : "Eliminar pregunta"}
          >
            <Trash2 className="h-4 w-4 text-danger" aria-hidden="true" />
          </Button>
        )}
      </div>

      <Controller
        control={control}
        name={`questions.${index}.question`}
        render={({ field }) => (
          <TextField
            {...field}
            label={language === "en" ? "Question text" : "Texto de la pregunta"}
            placeholder={
              language === "en"
                ? "Which animal is endemic to this area?"
                : "¿Qué animal es endémico de esta área?"
            }
            error={questionErrors?.question?.message}
          />
        )}
      />

      <Controller
        control={control}
        name={`questions.${index}.options`}
        render={({ field }) => (
          <OptionsListField
            options={field.value ?? []}
            onChange={field.onChange}
            error={
              typeof questionErrors?.options?.message === "string"
                ? questionErrors.options.message
                : undefined
            }
            label={language === "en" ? "Options" : "Opciones"}
          />
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name={`questions.${index}.correctAnswer`}
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                {language === "en" ? "Correct answer" : "Respuesta correcta"}
              </label>
              <select {...field} className={selectClassName}>
                <option value="">
                  {language === "en"
                    ? "Select the correct option"
                    : "Selecciona la opción correcta"}
                </option>
                {currentOptions.map((option, optionIndex) => (
                  <option key={optionIndex} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {questionErrors?.correctAnswer?.message && (
                <p className="text-xs text-danger">
                  {questionErrors.correctAnswer.message}
                </p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name={`questions.${index}.score`}
          render={({ field }) => (
            <TextField
              type="number"
              step={1}
              min={1}
              value={Number.isNaN(field.value) ? "" : field.value}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              onBlur={field.onBlur}
              label={language === "en" ? "Points" : "Puntaje"}
              error={questionErrors?.score?.message}
            />
          )}
        />
      </div>
    </div>
  );
}

/**
 * Cada pregunta es un objeto (question/options/correctAnswer/score) que
 * necesita su propio registro independiente en el form, así que el arreglo
 * `questions` usa useFieldArray (a diferencia de `options`, un arreglo de
 * strings dentro de cada pregunta, que sigue el patrón de arreglo plano de
 * OptionsListField).
 */
export function QuestionBuilder({ control, errors }: QuestionBuilderProps) {
  const language = useLanguageStore((state) => state.language);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <QuestionCard
          key={field.id}
          control={control}
          index={index}
          errors={errors}
          onRemove={() => remove(index)}
          showRemove={fields.length > 1}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onPress={() => append(EMPTY_QUESTION)}
        className="self-start"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Add question" : "Agregar pregunta"}
      </Button>
    </div>
  );
}
