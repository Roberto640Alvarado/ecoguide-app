"use client";

import dynamic from "next/dynamic";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Spinner } from "@heroui/react";
import { MapPin } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { TextField } from "@/components/ui/text-field";
import { ToggleField } from "@/components/ui/toggle-field";
import { useLanguageStore } from "@/store/language-store";
import { ImageUploader } from "./image-uploader";
import {
  protectedAreaSchema,
  type ProtectedAreaFormValues,
} from "../schemas/protected-area.schema";

/** Centro geográfico aproximado de El Salvador. */
export const EL_SALVADOR_CENTER = { latitude: 13.7942, longitude: -88.8965 };

/**
 * Leaflet accede a `window` al montarse, así que el mapa se carga solo en
 * el cliente y nunca durante el renderizado en servidor.
 */
const LocationPickerMap = dynamic(
  () =>
    import("./location-picker-map").then((mod) => mod.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 w-full items-center justify-center rounded-2xl border border-border bg-surface-secondary">
        <Spinner size="sm" />
      </div>
    ),
  },
);

interface ProtectedAreaFormProps {
  defaultValues?: ProtectedAreaFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: ProtectedAreaFormValues) => void;
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

export function ProtectedAreaForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: ProtectedAreaFormProps) {
  const language = useLanguageStore((state) => state.language);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProtectedAreaFormValues>({
    resolver: zodResolver(protectedAreaSchema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      latitude: EL_SALVADOR_CENTER.latitude,
      longitude: EL_SALVADOR_CENTER.longitude,
      images: [],
      isPublished: false,
    },
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const images = watch("images");

  function handleLocationChange(lat: number, lng: number) {
    setValue("latitude", Number(lat.toFixed(6)), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("longitude", Number(lng.toFixed(6)), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <FormSection
        title={language === "en" ? "Basic information" : "Información básica"}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr] sm:items-end">
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField
                {...field}
                label={language === "en" ? "Name" : "Nombre"}
                placeholder="Parque Nacional El Imposible"
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="isPublished"
            render={({ field }) => (
              <ToggleField
                label={language === "en" ? "Published" : "Publicada"}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              label={language === "en" ? "Description" : "Descripción"}
              placeholder={
                language === "en"
                  ? "Cloud forest reserve in Ahuachapán."
                  : "Reserva de bosque nuboso en Ahuachapán."
              }
              error={errors.description?.message}
            />
          )}
        />
      </FormSection>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
        <FormSection
          title={language === "en" ? "Location" : "Ubicación"}
          description={
            language === "en"
              ? "Click anywhere on the map (or drag the pin) to mark the exact location."
              : "Haz clic en cualquier punto del mapa (o arrastra el pin) para marcar la ubicación exacta."
          }
        >
          <LocationPickerMap
            latitude={latitude}
            longitude={longitude}
            onLocationChange={handleLocationChange}
          />

          <span className="flex w-fit items-center gap-1.5 rounded-full bg-default-soft px-3 py-1 text-xs font-medium text-muted">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>

          {(errors.latitude || errors.longitude) && (
            <p className="text-xs text-danger">
              {errors.latitude?.message ?? errors.longitude?.message}
            </p>
          )}
        </FormSection>

        <FormSection title={language === "en" ? "Images" : "Imágenes"}>
          <ImageUploader
            images={images}
            onChange={(value) =>
              setValue("images", value, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
          {errors.images && (
            <p className="text-xs text-danger">{errors.images.message}</p>
          )}
        </FormSection>
      </div>

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
