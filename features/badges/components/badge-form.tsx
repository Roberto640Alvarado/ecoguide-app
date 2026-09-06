"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { useLanguageStore } from "@/store/language-store";
import { BadgeImageUploader } from "./badge-image-uploader";
import { badgeSchema, type BadgeFormValues } from "../schemas/badge.schema";

interface BadgeFormProps {
  defaultValues?: BadgeFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: BadgeFormValues) => void;
  onCancel: () => void;
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

export function BadgeForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: BadgeFormProps) {
  const language = useLanguageStore((state) => state.language);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BadgeFormValues>({
    resolver: zodResolver(badgeSchema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      message: "",
      imageUrl: "",
    },
  });

  const imageUrl = watch("imageUrl");

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
        title={language === "en" ? "Badge" : "Insignia"}
        description={
          language === "en"
            ? "Enter the name, description, and the message the student will see when they earn it."
            : "Ingresa el nombre, la descripción y el mensaje que verá el estudiante al ganarla."
        }
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr] lg:items-start">
          <div className="flex flex-col gap-5">
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField
                  {...field}
                  label={language === "en" ? "Name" : "Nombre"}
                  placeholder={
                    language === "en"
                      ? "Guardian of the cloud forest"
                      : "Guardián del bosque nuboso"
                  }
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <TextareaField
                  {...field}
                  label={language === "en" ? "Description" : "Descripción"}
                  placeholder={
                    language === "en"
                      ? "Awarded upon completing every activity in this area."
                      : "Se otorga al completar todas las actividades de esta área."
                  }
                  error={errors.description?.message}
                  rows={3}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              {language === "en" ? "Image (PNG)" : "Imagen (PNG)"}
            </label>
            <p className="-mt-1 text-xs text-muted">
              {language === "en"
                ? "Upload the PNG image for this badge."
                : "Carga la imagen PNG de esta insignia."}
            </p>
            <BadgeImageUploader
              image={imageUrl || undefined}
              onChange={(value) =>
                setValue("imageUrl", value ?? "", {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              error={errors.imageUrl?.message}
            />
          </div>
        </div>

        <Controller
          control={control}
          name="message"
          render={({ field }) => (
            <TextareaField
              {...field}
              label={
                language === "en"
                  ? "Message shown to the student"
                  : "Mensaje que verá el estudiante"
              }
              placeholder={
                language === "en"
                  ? "Congratulations! You're now a guardian of the cloud forest."
                  : "¡Felicidades! Ya eres un guardián del bosque nuboso."
              }
              error={errors.message?.message}
              rows={3}
            />
          )}
        />
      </FormSection>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          {language === "en" ? "Cancel" : "Cancelar"}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
