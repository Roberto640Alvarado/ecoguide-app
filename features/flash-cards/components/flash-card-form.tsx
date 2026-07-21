"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
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
   * Los errores de campo (FieldError bajo cada input) son fáciles de pasar
   * por alto, especialmente los de la sección ENVIRONMENTAL cuando queda
   * fuera de la vista. Un toast hace visible de inmediato que el envío no
   * se realizó y por qué, en vez de que el clic en "Guardar"/"Crear"
   * parezca no hacer nada.
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
      className="flex flex-col gap-6"
      noValidate
    >
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <div className="flex items-center gap-4">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">
                {language === "en" ? "Category" : "Categoría"}
              </Label>
              <select {...field} className="input">
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
                <FlashCardAvatar type={field.value} className="h-full w-full object-contain" />
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
            isInvalid={!!errors.title}
            fullWidth
            className="flex flex-col gap-1.5"
          >
            <Label className="text-sm font-medium text-foreground">
              {language === "en" ? "Title" : "Título"}
            </Label>
            <Input
              {...field}
              fullWidth
              placeholder={
                language === "en" ? "Welcome to the reserve" : "Bienvenido a la reserva"
              }
            />
            <FieldError className="text-xs">{errors.title?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="content"
        render={({ field }) => (
          <TextField
            isInvalid={!!errors.content}
            fullWidth
            className="flex flex-col gap-1.5"
          >
            <Label className="text-sm font-medium text-foreground">
              {language === "en" ? "Content" : "Contenido"}
            </Label>
            <TextArea
              {...field}
              fullWidth
              rows={4}
              placeholder={
                language === "en"
                  ? "Text shown to the student on this card."
                  : "Texto que verá el estudiante en esta tarjeta."
              }
            />
            <FieldError className="text-xs">{errors.content?.message}</FieldError>
          </TextField>
        )}
      />

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-foreground">
          {language === "en" ? "Image" : "Imagen"}
        </Label>
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

      {isEnvironmental && (
        <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface-secondary/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {language === "en" ? "Multiple choice quiz" : "Pregunta de opción múltiple"}
          </p>

          <Controller
            control={control}
            name="question"
            render={({ field }) => (
              <TextField
                isInvalid={!!errors.question}
                fullWidth
                className="flex flex-col gap-1.5"
              >
                <Label className="text-sm font-medium text-foreground">
                  {language === "en" ? "Question" : "Pregunta"}
                </Label>
                <Input
                  {...field}
                  fullWidth
                  placeholder={
                    language === "en"
                      ? "Which animal is endemic to this area?"
                      : "¿Qué animal es endémico de esta área?"
                  }
                />
                <FieldError className="text-xs">
                  {errors.question?.message}
                </FieldError>
              </TextField>
            )}
          />

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

          <Controller
            control={control}
            name="correctAnswer"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">
                  {language === "en" ? "Correct answer" : "Respuesta correcta"}
                </Label>
                <select {...field} className="input">
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
                <FieldError className="text-xs">
                  {errors.correctAnswer?.message}
                </FieldError>
              </div>
            )}
          />
        </div>
      )}

      <div className="mt-2 flex justify-end gap-2">
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
