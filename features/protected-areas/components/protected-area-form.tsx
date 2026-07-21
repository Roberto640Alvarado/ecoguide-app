"use client";

import dynamic from "next/dynamic";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  FieldError,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { MapPin } from "lucide-react";
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
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-foreground">
          {language === "en" ? "Location" : "Ubicación"}
        </Label>
        <p className="text-xs text-muted">
          {language === "en"
            ? "Click anywhere on the map (or drag the pin) to mark the exact location."
            : "Haz clic en cualquier punto del mapa (o arrastra el pin) para marcar la ubicación exacta."}
        </p>

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
          <FieldError className="text-xs">
            {errors.latitude?.message ?? errors.longitude?.message}
          </FieldError>
        )}
      </div>

      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextField
            isInvalid={!!errors.name}
            fullWidth
            className="flex flex-col gap-1.5"
          >
            <Label className="text-sm font-medium text-foreground">
              {language === "en" ? "Name" : "Nombre"}
            </Label>
            <Input
              {...field}
              fullWidth
              placeholder="Parque Nacional El Imposible"
            />
            <FieldError className="text-xs">{errors.name?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextField
            isInvalid={!!errors.description}
            fullWidth
            className="flex flex-col gap-1.5"
          >
            <Label className="text-sm font-medium text-foreground">
              {language === "en" ? "Description" : "Descripción"}
            </Label>
            <TextArea
              {...field}
              fullWidth
              rows={4}
              placeholder={
                language === "en"
                  ? "Cloud forest reserve in Ahuachapán."
                  : "Reserva de bosque nuboso en Ahuachapán."
              }
            />
            <FieldError className="text-xs">
              {errors.description?.message}
            </FieldError>
          </TextField>
        )}
      />

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium text-foreground">
          {language === "en" ? "Images" : "Imágenes"}
        </Label>
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
          <FieldError className="text-xs">{errors.images.message}</FieldError>
        )}
      </div>

      <Controller
        control={control}
        name="isPublished"
        render={({ field }) => (
          <ToggleField
            label={
              language === "en"
                ? "Published (visible to students)"
                : "Publicada (visible para estudiantes)"
            }
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

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
