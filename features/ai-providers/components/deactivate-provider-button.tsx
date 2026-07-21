"use client";

import { Button } from "@heroui/react";
import { PowerOff } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguageStore } from "@/store/language-store";
import { useDeactivateAIProvider } from "../hooks/use-deactivate-ai-provider";
import type { AIProvider } from "../types/ai-provider.types";

interface DeactivateProviderButtonProps {
  provider: AIProvider;
}

export function DeactivateProviderButton({
  provider,
}: DeactivateProviderButtonProps) {
  const language = useLanguageStore((state) => state.language);
  const deactivateProvider = useDeactivateAIProvider();

  if (!provider.isActive) {
    return null;
  }

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="outline"
          size="sm"
          aria-label={language === "en" ? "Deactivate" : "Desactivar"}
        >
          <PowerOff className="h-4 w-4" aria-hidden="true" />
        </Button>
      }
      icon={<PowerOff className="h-5 w-5" aria-hidden="true" />}
      title={
        language === "en" ? "Deactivate provider?" : "¿Desactivar proveedor?"
      }
      description={
        language === "en" ? (
          <>
            <strong className="font-semibold text-foreground">
              {provider.providerName}
            </strong>{" "}
            will stop being available for the chatbot and speaking feedback.
          </>
        ) : (
          <>
            <strong className="font-semibold text-foreground">
              {provider.providerName}
            </strong>{" "}
            dejará de estar disponible para el chatbot y la retroalimentación de
            speaking.
          </>
        )
      }
      note={
        language === "en"
          ? "This is reversible: you can reactivate the provider anytime from this panel."
          : "Esto es reversible: puedes reactivar el proveedor cuando quieras desde este panel."
      }
      confirmLabel={language === "en" ? "Deactivate" : "Desactivar"}
      isLoading={deactivateProvider.isPending}
      onConfirm={() => deactivateProvider.mutate(provider.id)}
    />
  );
}
