"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Cpu, Loader2, Plus, Sparkles, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/store/language-store";
import { useAIProvider } from "@/features/ai-providers/hooks/use-ai-provider";
import { ProviderStatusBadge } from "@/features/ai-providers/components/provider-status-badge";
import { EditProviderModal } from "@/features/ai-providers/components/edit-provider-modal";
import { ProviderStatusToggle } from "@/features/ai-providers/components/provider-status-toggle";
import { ModelFormModal } from "@/features/ai-providers/components/model-form-modal";
import { RemoveModelButton } from "@/features/ai-providers/components/remove-model-button";

export default function AIProviderDetailPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const { data: provider, isLoading } = useAIProvider(params.id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2
          className="h-6 w-6 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
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
        className="flex w-fit items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to providers" : "Volver a proveedores"}
      </Link>

      {/* Tarjeta de identidad: separa "quién es" (ícono, nombre, badge,
          conteo de modelos) de "qué puedo hacer" (estado + editar) con un
          border-t, en vez de amontonar todo en una sola fila — así el
          switch de estado ya no queda ambiguo (lleva su propia etiqueta) y
          en mobile cada bloque se apila con claridad. */}
      <div className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
            <Cpu className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-bold text-foreground">
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

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-medium text-foreground">
              {language === "en" ? "Provider status" : "Estado del proveedor"}
            </span>
            <ProviderStatusToggle provider={provider} />
          </div>
          <EditProviderModal
            provider={provider}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-full sm:w-auto"
              >
                <SquarePen className="h-4 w-4" aria-hidden="true" />
                {language === "en" ? "Edit provider" : "Editar proveedor"}
              </Button>
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {language === "en" ? "Model catalog" : "Catálogo de modelos"}
          </h2>
          <p className="text-sm text-muted">
            {language === "en"
              ? "Models available to the chatbot and speaking feedback."
              : "Modelos disponibles para el chatbot y la retroalimentación de speaking."}
          </p>
        </div>
        <ModelFormModal
          providerId={provider.id}
          trigger={
            <Button size="sm" className="w-full rounded-full sm:w-auto">
              <Plus className="h-4 w-4" aria-hidden="true" />
              {language === "en" ? "Add model" : "Agregar modelo"}
            </Button>
          }
        />
      </div>

      {provider.models.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border p-10 text-center">
          <Sparkles className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted">
            {language === "en"
              ? "This provider has no models yet."
              : "Este proveedor todavía no tiene modelos."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {provider.models.map((model) => (
            <div
              key={model.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-foreground">
                      {model.name}
                    </p>
                    <ProviderStatusBadge isActive={model.isActive} />
                  </div>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {model.model}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <ModelFormModal
                  providerId={provider.id}
                  model={model}
                  trigger={
                    <Button variant="outline" size="sm" className="rounded-full">
                      <SquarePen className="h-4 w-4" aria-hidden="true" />
                      {language === "en" ? "Edit" : "Editar"}
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
