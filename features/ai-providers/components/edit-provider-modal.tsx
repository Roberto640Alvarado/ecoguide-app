"use client";

import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FieldError, Input, Label, Spinner, TextField } from "@heroui/react";
import { Cpu } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { SecretField } from "@/components/ui/secret-field";
import { ToggleField } from "@/components/ui/toggle-field";
import { useLanguageStore } from "@/store/language-store";
import { useUpdateAIProvider } from "../hooks/use-update-ai-provider";
import {
  updateAIProviderSchema,
  type UpdateAIProviderFormValues,
} from "../schemas/update-ai-provider.schema";
import type { AIProvider } from "../types/ai-provider.types";

interface EditProviderModalProps {
  provider: AIProvider;
  trigger: ReactNode;
}

export function EditProviderModal({ provider, trigger }: EditProviderModalProps) {
  const language = useLanguageStore((state) => state.language);
  const updateProvider = useUpdateAIProvider(provider.id);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateAIProviderFormValues>({
    resolver: zodResolver(updateAIProviderSchema),
    defaultValues: {
      providerName: provider.providerName,
      apiKey: "",
      isActive: provider.isActive,
    },
  });

  return (
    <FormModal
      trigger={trigger}
      title={language === "en" ? "Edit provider" : "Editar proveedor"}
    >
      {({ close }) => {
        const onSubmit = (values: UpdateAIProviderFormValues) => {
          const payload = {
            providerName: values.providerName,
            isActive: values.isActive,
            ...(values.apiKey ? { apiKey: values.apiKey } : {}),
          };
          updateProvider.mutate(payload, { onSuccess: () => close() });
        };

        return (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <Controller
              control={control}
              name="providerName"
              render={({ field }) => (
                <TextField
                  isInvalid={!!errors.providerName}
                  fullWidth
                  className="flex flex-col gap-1.5"
                >
                  <Label className="text-sm font-medium text-foreground">
                    {language === "en" ? "Provider name" : "Nombre del proveedor"}
                  </Label>
                  <div className="relative">
                    <Cpu
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                      aria-hidden="true"
                    />
                    <Input {...field} fullWidth className="pl-9" />
                  </div>
                  <FieldError className="text-xs">
                    {errors.providerName?.message}
                  </FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="apiKey"
              render={({ field }) => (
                <SecretField
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  label="API Key"
                  placeholder={
                    language === "en"
                      ? "Leave blank to keep the current key"
                      : "Deja en blanco para conservar la clave actual"
                  }
                  isInvalid={!!errors.apiKey}
                  errorMessage={errors.apiKey?.message}
                  description={
                    language === "en"
                      ? "For security, the current key is never shown."
                      : "Por seguridad, la clave actual nunca se muestra."
                  }
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
                isDisabled={updateProvider.isPending}
              >
                {updateProvider.isPending ? (
                  <Spinner size="sm" />
                ) : language === "en" ? (
                  "Save changes"
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          </form>
        );
      }}
    </FormModal>
  );
}
