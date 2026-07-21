"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Spinner, toast } from "@heroui/react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { TextField } from "@/components/ui/text-field";
import { useLanguageStore } from "@/store/language-store";
import { FlashCardAvatar } from "./flash-card-avatar";
import { FlashCardImageUploader } from "./flash-card-image-uploader";
import { FlashCardOptionsField } from "./flash-card-options-field";
import {
  flashCardSchema,
  type FlashCardFormValues,
} from "../schemas/flash-card.schema";
import {
  FLASH_CARD_TYPES,
  FLASH_CARD_TYPE_LABELS,
} from "../types/flash-card.types";

interface FlashCardFormProps {
  defaultValues?: FlashCardFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: FlashCardFormValues) => void;
  onCancel: () => void;
}

const selectClassName =
  "py-2.5 sm:py-3 px-4 block w-full bg-layer border border-layer-line rounded-lg sm:text-sm text-foreground focus:outline-hidden focus:border-primary-focus focus:ring-1 focus:ring-primary-focus disabled:opacity-50 disabled:pointer-events-none";

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

export function FlashCardForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: FlashCardFormProps) {
  const language = useLanguageStore((state) => state.language);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FlashCardFormValues>({
    resolver: zodResolver(flashCardSchema),
    defaultValues: defaultValues ?? {
      type: "WELCOME",
      title: "",
      content: "",
      image: "",
      question: "",
      options: ["", ""],
      correctAnswer: "",
    },
  });

  const type = watch("type");
  const image = watch("image");
  const options = watch("options") ?? [];
  const isEnvironmental = type === "ENVIRONMENTAL";
  const availableOptions = options.filter((option) => option.trim().length > 0);

  /**
   * Los errores de campo (mensaje bajo cada input) son fáciles de pasar por
   * alto, especialmente los de la sección ENVIRONMENTAL cuando queda fuera
   * de la vista. Un toast hace visible de inmediato que el envío no se
   * realizó y por qué, en vez de que el clic en "Guardar"/"Crear" parezca no
   * hacer nada.
   */
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
      <FormSection
        title={language === "en" ? "Content" : "Contenido"}
      >
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <div className="flex items-center gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  {language === "en" ? "Category" : "Categoría"}
                </label>
                <select {...field} className={selectClassName}>
                  {FLASH_CARD_TYPES.map((flashCardType) => (
                    <option key={flashCardType} value={flashCardType}>
                      {FLASH_CARD_TYPE_LABELS[flashCardType][language]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gesto del mascota EcoGuide correspondiente a la categoría
                  elegida (ver public/avatars/). Se anima al cambiar de tipo. */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={field.value}
                  initial={{ opacity: 0, scale: 0.85, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent-soft"
                >
                  <FlashCardAvatar
                    type={field.value}
                    className="h-full w-full object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        />

        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField
              {...field}
              label={language === "en" ? "Title" : "Título"}
              placeholder={
                language === "en"
                  ? "Welcome to the reserve"
                  : "Bienvenido a la reserva"
              }
              error={errors.title?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr] lg:items-start">
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                label={language === "en" ? "Content" : "Contenido"}
                placeholder={
                  language === "en"
                    ? "Text shown to the student on this card."
                    : "Texto que verá el estudiante en esta tarjeta."
                }
                error={errors.content?.message}
              />
            )}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              {language === "en" ? "Image" : "Imagen"}
            </label>
            <FlashCardImageUploader
              image={image || undefined}
              onChange={(value) =>
                setValue("image", value ?? "", {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              error={errors.image?.message}
            />
          </div>
        </div>
      </FormSection>

      {isEnvironmental && (
        <FormSection
          title={
            language === "en"
              ? "Multiple choice quiz"
              : "Pregunta de opción múltiple"
          }
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Controller
              control={control}
              name="question"
              render={({ field }) => (
                <TextField
                  {...field}
                  label={language === "en" ? "Question" : "Pregunta"}
                  placeholder={
                    language === "en"
                      ? "Which animal is endemic to this area?"
                      : "¿Qué animal es endémico de esta área?"
                  }
                  error={errors.question?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="correctAnswer"
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
                    {availableOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.correctAnswer?.message && (
                    <p className="text-xs text-danger">
                      {errors.correctAnswer.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <Controller
            control={control}
            name="options"
            render={({ field }) => (
              <FlashCardOptionsField
                options={field.value ?? []}
                onChange={field.onChange}
                error={errors.options?.message}
              />
            )}
          />
        </FormSection>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onPress={onCancel}>
          {language === "en" ? "Cancel" : "Cancelar"}
        </Button>
        <Button type="submit" variant="primary" isDisabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
