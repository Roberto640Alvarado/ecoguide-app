"use client";

import { Button } from "@heroui/react";
import { EyeOff } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguageStore } from "@/store/language-store";
import { useUnpublishProtectedArea } from "../hooks/use-unpublish-protected-area";
import type { ProtectedArea } from "../types/protected-area.types";

interface UnpublishAreaButtonProps {
  area: ProtectedArea;
}

export function UnpublishAreaButton({ area }: UnpublishAreaButtonProps) {
  const language = useLanguageStore((state) => state.language);
  const unpublishArea = useUnpublishProtectedArea();

  if (!area.isPublished) {
    return null;
  }

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="outline"
          size="sm"
          aria-label={language === "en" ? "Unpublish" : "Despublicar"}
        >
          <EyeOff className="h-4 w-4" aria-hidden="true" />
          {language === "en" ? "Unpublish" : "Despublicar"}
        </Button>
      }
      icon={<EyeOff className="h-5 w-5" aria-hidden="true" />}
      title={
        language === "en" ? "Unpublish area?" : "¿Despublicar área protegida?"
      }
      description={
        language === "en" ? (
          <>
            <strong className="font-semibold text-foreground">
              {area.name}
            </strong>{" "}
            will no longer be visible to students.
          </>
        ) : (
          <>
            <strong className="font-semibold text-foreground">
              {area.name}
            </strong>{" "}
            dejará de ser visible para los estudiantes.
          </>
        )
      }
      note={
        language === "en"
          ? "This is reversible: you can publish it again anytime from this panel."
          : "Esto es reversible: puedes publicarla de nuevo cuando quieras desde este panel."
      }
      confirmLabel={language === "en" ? "Unpublish" : "Despublicar"}
      isLoading={unpublishArea.isPending}
      onConfirm={() => unpublishArea.mutate(area.id)}
    />
  );
}
