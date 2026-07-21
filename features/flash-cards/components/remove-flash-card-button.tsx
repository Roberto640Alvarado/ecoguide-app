"use client";

import { Button } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguageStore } from "@/store/language-store";
import { useRemoveFlashCard } from "../hooks/use-remove-flash-card";
import type { FlashCard } from "../types/flash-card.types";

interface RemoveFlashCardButtonProps {
  flashCard: FlashCard;
  protectedAreaId: string;
}

/**
 * A diferencia de UnpublishAreaButton (soft delete reversible), eliminar una
 * flashcard es un hard delete (ver el comentario en flash-cards.service.ts:
 * no existen relaciones @@onDelete: Cascade que dependan de FlashCard). El
 * ConfirmDialog usa el mensaje de advertencia estándar (icon danger) sin la
 * nota tranquilizadora "puedes deshacerlo".
 */
export function RemoveFlashCardButton({
  flashCard,
  protectedAreaId,
}: RemoveFlashCardButtonProps) {
  const language = useLanguageStore((state) => state.language);
  const removeFlashCard = useRemoveFlashCard(protectedAreaId);

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
      title={language === "en" ? "Delete flashcard?" : "¿Eliminar flashcard?"}
      description={
        language === "en" ? (
          <>
            <strong className="font-semibold text-foreground">
              {flashCard.title}
            </strong>{" "}
            will be permanently deleted.
          </>
        ) : (
          <>
            <strong className="font-semibold text-foreground">
              {flashCard.title}
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
      isLoading={removeFlashCard.isPending}
      onConfirm={() => removeFlashCard.mutate(flashCard.id)}
    />
  );
}
