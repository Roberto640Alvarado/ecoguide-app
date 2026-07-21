"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Spinner } from "@heroui/react";
import { ArrowLeft, Cpu, Plus, SquarePen } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useAIProvider } from "@/features/ai-providers/hooks/use-ai-provider";
import { ProviderStatusBadge } from "@/features/ai-providers/components/provider-status-badge";
import { EditProviderModal } from "@/features/ai-providers/components/edit-provider-modal";
import { DeactivateProviderButton } from "@/features/ai-providers/components/deactivate-provider-button";
import { ModelFormModal } from "@/features/ai-providers/components/model-form-modal";
import { RemoveModelButton } from "@/features/ai-providers/components/remove-model-button";

export default function AIProviderDetailPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const { data: provider, isLoading } = useAIProvider(params.id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="md" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-10 text-center">
        <p className="text-sm text-muted">
          {language === "en" ? "Provider not found." : "Proveedor no encontrado."}
        </p>
        <Link
          href="/teacher/ai-providers"
          className="text-sm font-semibold text-accent hover:underline"
        >
          {language === "en" ? "Back to providers" : "Volver a proveedores"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/teacher/ai-providers"
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to providers" : "Volver a proveedores"}
      </Link>

      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
            <Cpu className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">
                {provider.providerName}
              </h1>
              <ProviderStatusBadge isActive={provider.isActive} />
            </div>
            <p className="text-sm text-muted">
              {provider.models.length}{" "}
              {language === "en" ? "models in catalog" : "modelos en el catálogo"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EditProviderModal
            provider={provider}
            trigger={
              <Button variant="outline" size="sm">
                <SquarePen className="h-4 w-4" aria-hidden="true" />
                {language === "en" ? "Edit" : "Editar"}
              </Button>
            }
          />
          <DeactivateProviderButton provider={provider} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {language === "en" ? "Model catalog" : "Catálogo de modelos"}
        </h2>
        <ModelFormModal
          providerId={provider.id}
          trigger={
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {language === "en" ? "Add model" : "Agregar modelo"}
            </Button>
          }
        />
      </div>

      {provider.models.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted">
          {language === "en"
            ? "This provider has no models yet."
            : "Este proveedor todavía no tiene modelos."}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {provider.models.map((model) => (
            <div
              key={model.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{model.name}</p>
                  <ProviderStatusBadge isActive={model.isActive} />
                </div>
                <p className="text-xs text-muted">{model.model}</p>
              </div>
              <div className="flex items-center gap-2">
                <ModelFormModal
                  providerId={provider.id}
                  model={model}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={
                        language === "en" ? "Edit model" : "Editar modelo"
                      }
                    >
                      <SquarePen className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  }
                />
                <RemoveModelButton providerId={provider.id} model={model} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
