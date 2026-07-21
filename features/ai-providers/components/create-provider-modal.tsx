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
import { useCreateAIProvider } from "../hooks/use-create-ai-provider";
import {
  createAIProviderSchema,
  type CreateAIProviderFormValues,
} from "../schemas/create-ai-provider.schema";

interface CreateProviderModalProps {
  trigger: ReactNode;
}

export function CreateProviderModal({ trigger }: CreateProviderModalProps) {
  const language = useLanguageStore((state) => state.language);
  const createProvider = useCreateAIProvider();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAIProviderFormValues>({
    resolver: zodResolver(createAIProviderSchema),
    defaultValues: { providerName: "", apiKey: "", isActive: true },
  });

  return (
    <FormModal
      trigger={trigger}
      title={language === "en" ? "New AI provider" : "Nuevo proveedor de IA"}
      description={
        language === "en"
          ? "The API key is encrypted before it's stored and is never shown again."
          : "El API key se cifra antes de guardarse y nunca vuelve a mostrarse."
      }
    >
      {({ close }) => {
        const onSubmit = (values: CreateAIProviderFormValues) => {
          createProvider.mutate(values, {
            onSuccess: () => {
              reset();
              close();
            },
          });
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
                    <Input
                      {...field}
                      fullWidth
                      className="pl-9"
                      placeholder="Google Gemini"
                    />
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
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  label="API Key"
                  placeholder="sk-..."
                  isInvalid={!!errors.apiKey}
                  errorMessage={errors.apiKey?.message}
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
                isDisabled={createProvider.isPending}
              >
                {createProvider.isPending ? (
                  <Spinner size="sm" />
                ) : language === "en" ? (
                  "Create provider"
                ) : (
                  "Crear proveedor"
                )}
              </Button>
            </div>
          </form>
        );
      }}
    </FormModal>
  );
}
