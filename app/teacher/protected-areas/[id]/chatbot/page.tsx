"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Spinner } from "@heroui/react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useChatbotConfigByArea } from "@/features/chatbot/hooks/use-chatbot-config-by-area";
import { useCreateChatbotConfig } from "@/features/chatbot/hooks/use-create-chatbot-config";
import { useUpdateChatbotConfig } from "@/features/chatbot/hooks/use-update-chatbot-config";
import { ChatbotConfigForm } from "@/features/chatbot/components/chatbot-config-form";
import type { ChatbotConfigFormValues } from "@/features/chatbot/schemas/chatbot-config.schema";

/**
 * Config 1:1 del chatbot del área (ver ChatbotConfigsService en la API). Si
 * el área todavía no tiene un chatbot configurado, el formulario arranca
 * vacío y el submit crea uno; si ya existe, arranca precargado y el submit
 * actualiza.
 */
export default function ChatbotConfigPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const { data: area, isLoading: isLoadingArea } = useProtectedArea(params.id);
  const { data: config, isLoading: isLoadingConfig } = useChatbotConfigByArea(
    params.id,
  );

  const createConfig = useCreateChatbotConfig();
  const updateConfig = useUpdateChatbotConfig(config?.id ?? "", params.id);

  const isLoading = isLoadingArea || isLoadingConfig;

  function handleSubmit(values: ChatbotConfigFormValues) {
    if (config) {
      updateConfig.mutate(values);
    } else {
      createConfig.mutate(values);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/teacher/protected-areas/${params.id}/edit`}
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to area" : "Volver al área"}
      </Link>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isLoading
              ? language === "en"
                ? "Loading..."
                : "Cargando..."
              : (area?.name ?? "Chatbot")}
          </h1>
          <p className="text-sm text-muted">
            {language === "en"
              ? "Chatbot configuration"
              : "Configuración de chatbot"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="md" />
        </div>
      ) : !area ? (
        <p className="text-center text-sm text-muted">
          {language === "en"
            ? "Protected area not found."
            : "Área protegida no encontrada."}
        </p>
      ) : (
        <>
          <ChatbotConfigForm
            protectedAreaId={params.id}
            area={{ name: area.name, description: area.description }}
            defaultValues={
              config
                ? {
                    protectedAreaId: params.id,
                    providerId: config.providerId,
                    model: config.model,
                    systemPrompt: config.systemPrompt,
                    welcomeMessage: config.welcomeMessage,
                    temperature: config.temperature,
                    maxTokens: config.maxTokens,
                    isActive: config.isActive,
                  }
                : undefined
            }
            isSubmitting={createConfig.isPending || updateConfig.isPending}
            submitLabel={
              config
                ? language === "en"
                  ? "Save changes"
                  : "Guardar cambios"
                : language === "en"
                  ? "Create chatbot"
                  : "Crear chatbot"
            }
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}
