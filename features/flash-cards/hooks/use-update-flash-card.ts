"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { updateFlashCard } from "../api/flash-cards.api";
import type { FlashCard } from "../types/flash-card.types";
import type { FlashCardFormValues } from "../schemas/flash-card.schema";
import type { ApiError } from "@/lib/api/client";

export function useUpdateFlashCard(id: string, protectedAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation<FlashCard, ApiError, Partial<FlashCardFormValues>>({
    mutationFn: (payload) => updateFlashCard(id, payload),
    onSuccess: () => {
      toast.success("Flashcard actualizada correctamente.");
      queryClient.invalidateQueries({
        queryKey: ["flash-cards", protectedAreaId],
      });
      queryClient.invalidateQueries({ queryKey: ["flash-card", id] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
