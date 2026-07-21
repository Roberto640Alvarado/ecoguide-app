"use client";

import { Spinner } from "@heroui/react";
import { SelectField } from "@/components/ui/select-field";
import { useLanguageStore } from "@/store/language-store";
import { useAIProviders } from "../hooks/use-ai-providers";
import { AI_PROVIDER_TYPE_LABELS } from "../types/ai-provider.types";

interface ProviderModelFieldProps {
  providerId: string;
  model: string;
  onProviderChange: (providerId: string) => void;
  onModelChange: (model: string) => void;
  providerError?: string;
  modelError?: string;
}

/**
 * Select en cascada proveedor -> modelo, reutilizado por los formularios de
 * config de Speaking Practice y Chatbot (ambos necesitan elegir qué
 * AIProvider/modelo activo usar). Solo lista proveedores y modelos activos:
 * guardar una config apuntando a algo inactivo fallaría más adelante al
 * intentar usarse de verdad (ver AICompletionService.complete, que valida
 * exactamente esto en tiempo de ejecución).
 */
export function ProviderModelField({
  providerId,
  model,
  onProviderChange,
  onModelChange,
  providerError,
  modelError,
}: ProviderModelFieldProps) {
  const language = useLanguageStore((state) => state.language);
  const { data, isLoading } = useAIProviders({ isActive: true, limit: 100 });

  const providers = data?.items ?? [];
  const selectedProvider = providers.find((p) => p.id === providerId);
  const activeModels = selectedProvider?.models.filter((m) => m.isActive) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Spinner size="sm" />
        {language === "en" ? "Loading providers..." : "Cargando proveedores..."}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-secondary/40 p-4 text-sm text-muted">
        {language === "en"
          ? "No active AI providers yet. Create one first under AI Providers."
          : "Todavía no hay proveedores de IA activos. Crea uno primero en Proveedores de IA."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SelectField
        label={language === "en" ? "AI provider" : "Proveedor de IA"}
        value={providerId}
        onChange={(e) => {
          onProviderChange(e.target.value);
          onModelChange("");
        }}
        error={providerError}
      >
        <option value="">
          {language === "en" ? "Select a provider" : "Selecciona un proveedor"}
        </option>
        {providers.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.providerName} · {AI_PROVIDER_TYPE_LABELS[provider.providerType]}
          </option>
        ))}
      </SelectField>

      <SelectField
        label={language === "en" ? "Model" : "Modelo"}
        value={model}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={!selectedProvider || activeModels.length === 0}
        error={modelError}
        description={
          selectedProvider && activeModels.length === 0
            ? language === "en"
              ? "This provider has no active models. Add one under AI Providers."
              : "Este proveedor no tiene modelos activos. Agrega uno en Proveedores de IA."
            : undefined
        }
      >
        <option value="">
          {language === "en" ? "Select a model" : "Selecciona un modelo"}
        </option>
        {activeModels.map((m) => (
          <option key={m.id} value={m.model}>
            {m.name} ({m.model})
          </option>
        ))}
      </SelectField>
    </div>
  );
}
