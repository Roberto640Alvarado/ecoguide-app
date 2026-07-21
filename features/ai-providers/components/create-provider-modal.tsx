"use client";

import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Spinner } from "@heroui/react";
import { Cpu } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { SecretField } from "@/components/ui/secret-field";
import { SelectField } from "@/components/ui/select-field";
import { TextField } from "@/components/ui/text-field";
import { ToggleField } from "@/components/ui/toggle-field";
import { useLanguageStore } from "@/store/language-store";
import { useCreateAIProvider } from "../hooks/use-create-ai-provider";
import {
  createAIProviderSchema,
  type CreateAIProviderFormValues,
} from "../schemas/create-ai-provider.schema";
import {
  AI_PROVIDER_TYPES,
  AI_PROVIDER_TYPE_LABELS,
} from "../types/ai-provider.types";

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
    defaultValues: {
      providerName: "",
      providerType: "GEMINI",
      apiKey: "",
      isActive: true,
    },
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
                  {...field}
                  label={
                    language === "en" ? "Provider name" : "Nombre del proveedor"
                  }
                  icon={Cpu}
                  placeholder="Google Gemini"
                  error={errors.providerName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="providerType"
              render={({ field }) => (
                <SelectField
                  {...field}
                  label={language === "en" ? "Vendor" : "Proveedor real"}
                  error={errors.providerType?.message}
                  description={
                    language === "en"
                      ? "The real API this provider calls. Determines which integration is used internally."
                      : "La API real a la que llama este proveedor. Determina qué integración se usa internamente."
                  }
                >
                  {AI_PROVIDER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {AI_PROVIDER_TYPE_LABELS[type]}
                    </option>
                  ))}
                </SelectField>
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
