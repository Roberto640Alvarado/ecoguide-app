"use client";

import { Button } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguageStore } from "@/store/language-store";
import { useRemoveBadge } from "../hooks/use-remove-badge";
import type { Badge } from "../types/badge.types";

interface RemoveBadgeButtonProps {
  badge: Badge;
  protectedAreaId: string;
}

/**
 * Al igual que RemoveFlashCardButton, eliminar una insignia es un hard
 * delete (ver el comentario en badges.service.ts: no existen relaciones
 * @@onDelete: Cascade que dependan de Badge todavía).
 */
export function RemoveBadgeButton({
  badge,
  protectedAreaId,
}: RemoveBadgeButtonProps) {
  const language = useLanguageStore((state) => state.language);
  const removeBadge = useRemoveBadge(protectedAreaId);

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="outline"
          size="sm"
          aria-label={language === "en" ? "Delete" : "Eliminar"}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      }
      icon={<Trash2 className="h-5 w-5" aria-hidden="true" />}
      title={language === "en" ? "Delete badge?" : "¿Eliminar insignia?"}
      description={
        language === "en" ? (
          <>
            <strong className="font-semibold text-foreground">
              {badge.name}
            </strong>{" "}
            will be permanently deleted.
          </>
        ) : (
          <>
            <strong className="font-semibold text-foreground">
              {badge.name}
            </strong>{" "}
            se eliminará permanentemente.
          </>
        )
      }
      note={
        language === "en"
          ? "This action cannot be undone."
          : "Esta acción no se puede deshacer."
      }
      confirmLabel={language === "en" ? "Delete" : "Eliminar"}
      isLoading={removeBadge.isPending}
      onConfirm={() => removeBadge.mutate(badge.id)}
    />
  );
}
