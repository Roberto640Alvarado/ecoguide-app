"use client";

import { PowerOff } from "lucide-react";
import { StatusToggle } from "@/components/ui/status-toggle";
import { useLanguageStore } from "@/store/language-store";
import { useDeactivateAIProvider } from "../hooks/use-deactivate-ai-provider";
import { useUpdateAIProvider } from "../hooks/use-update-ai-provider";
import type { AIProvider } from "../types/ai-provider.types";

interface ProviderStatusToggleProps {
  provider: AIProvider;
}

// Reemplaza al antiguo botón "Desactivar" (de una sola vía) por un switch
// bidireccional: activa o desactiva según el estado actual, pero nunca
// aplica el cambio sin antes pedir confirmación (Cancelar/Confirmar).
export function ProviderStatusToggle({ provider }: ProviderStatusToggleProps) {
  const language = useLanguageStore((state) => state.language);
  const deactivateProvider = useDeactivateAIProvider();
  const updateProvider = useUpdateAIProvider(provider.id);

  const isLoading = deactivateProvider.isPending || updateProvider.isPending;

  return (
    <StatusToggle
      isActive={provider.isActive}
      isLoading={isLoading}
      activateLabel={language === "en" ? "Activate" : "Activar"}
      deactivateLabel={language === "en" ? "Deactivate" : "Desactivar"}
      icon={
        <PowerOff className="h-5 w-5" aria-hidden="true" />
      }
      confirmTitle={(next) =>
        next
          ? language === "en"
            ? "Activate provider?"
            : "¿Activar proveedor?"
          : language === "en"
            ? "Deactivate provider?"
            : "¿Desactivar proveedor?"
      }
      confirmDescription={(next) => (
        <>
          <strong className="font-semibold text-foreground">
            {provider.providerName}
          </strong>{" "}
          {next
            ? language === "en"
              ? "will become available again for the chatbot and speaking feedback."
              : "volverá a estar disponible para el chatbot y la retroalimentación de speaking."
            : language === "en"
              ? "will stop being available for the chatbot and speaking feedback."
              : "dejará de estar disponible para el chatbot y la retroalimentación de speaking."}
        </>
      )}
      confirmNote={(next) =>
        !next &&
        (language === "en"
          ? "This is reversible: you can reactivate the provider anytime from this panel."
          : "Esto es reversible: puedes reactivar el proveedor cuando quieras desde este panel.")
      }
      confirmLabel={(next) =>
        next
          ? language === "en"
            ? "Activate"
            : "Activar"
          : language === "en"
            ? "Deactivate"
            : "Desactivar"
      }
      onConfirm={(next) => {
        if (next) {
          updateProvider.mutate({ isActive: true });
        } else {
          deactivateProvider.mutate(provider.id);
        }
      }}
    />
  );
}
