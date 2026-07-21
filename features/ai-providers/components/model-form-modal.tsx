"use client";

import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Spinner } from "@heroui/react";
import { Sparkles } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { TextField } from "@/components/ui/text-field";
import { ToggleField } from "@/components/ui/toggle-field";
import { useLanguageStore } from "@/store/language-store";
import { useAddModel } from "../hooks/use-add-model";
import { useUpdateModel } from "../hooks/use-update-model";
import { modelSchema, type ModelFormValues } from "../schemas/model.schema";
import type { AIModel } from "../types/ai-provider.types";

interface ModelFormModalProps {
  providerId: string;
  trigger: ReactNode;
  model?: AIModel;
}

export function ModelFormModal({
  providerId,
  trigger,
  model,
}: ModelFormModalProps) {
  const language = useLanguageStore((state) => state.language);
  const addModel = useAddModel(providerId);
  const updateModel = useUpdateModel(providerId);
  const isEdit = !!model;
  const mutation = isEdit ? updateModel : addModel;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: model?.name ?? "",
      model: model?.model ?? "",
      isActive: model?.isActive ?? true,
    },
  });

  return (
    <FormModal
      trigger={trigger}
      title={
        isEdit
          ? language === "en"
            ? "Edit model"
            : "Editar modelo"
          : language === "en"
            ? "Add model"
            : "Agregar modelo"
      }
      size="md"
    >
      {({ close }) => {
        const onSubmit = (values: ModelFormValues) => {
          if (isEdit && model) {
            updateModel.mutate(
              { modelId: model.id, payload: values },
              { onSuccess: () => close() },
            );
          } else {
            addModel.mutate(values, {
              onSuccess: () => {
                reset();
                close();
              },
            });
          }
        };

        return (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField
                  {...field}
                  label={language === "en" ? "Display name" : "Nombre visible"}
                  icon={Sparkles}
                  placeholder="Gemini 1.5 Flash"
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="model"
              render={({ field }) => (
                <TextField
                  {...field}
                  label={
                    language === "en"
                      ? "Model identifier"
                      : "Identificador del modelo"
                  }
                  placeholder="gemini-1.5-flash"
                  error={errors.model?.message}
                />
              )}
            />

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

            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outline" type="button" onPress={close}>
                {language === "en" ? "Cancel" : "Cancelar"}
              </Button>
              <Button
                type="submit"
                variant="primary"
                isDisabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <Spinner size="sm" />
                ) : isEdit ? (
                  language === "en" ? (
                    "Save"
                  ) : (
                    "Guardar"
                  )
                ) : language === "en" ? (
                  "Add"
                ) : (
                  "Agregar"
                )}
              </Button>
            </div>
          </form>
        );
      }}
    </FormModal>
  );
}
