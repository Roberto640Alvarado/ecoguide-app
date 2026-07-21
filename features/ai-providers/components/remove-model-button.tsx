"use client";

import { Button } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguageStore } from "@/store/language-store";
import { useRemoveModel } from "../hooks/use-remove-model";
import type { AIModel } from "../types/ai-provider.types";

interface RemoveModelButtonProps {
  providerId: string;
  model: AIModel;
}

export function RemoveModelButton({
  providerId,
  model,
}: RemoveModelButtonProps) {
  const language = useLanguageStore((state) => state.language);
  const removeModel = useRemoveModel(providerId);

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="outline"
          size="sm"
          aria-label={language === "en" ? "Remove" : "Eliminar"}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      }
      title={language === "en" ? "Remove model?" : "¿Eliminar modelo?"}
      description={
        language === "en"
          ? `"${model.name}" will be removed from this provider's catalog.`
          : `"${model.name}" se eliminará del catálogo de este proveedor.`
      }
      confirmLabel={language === "en" ? "Remove" : "Eliminar"}
      isLoading={removeModel.isPending}
      onConfirm={() => removeModel.mutate(model.id)}
    />
  );
}
