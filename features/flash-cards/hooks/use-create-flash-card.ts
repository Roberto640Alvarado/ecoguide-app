"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { createFlashCard } from "../api/flash-cards.api";
import type { FlashCard } from "../types/flash-card.types";
import type { FlashCardFormValues } from "../schemas/flash-card.schema";
import type { ApiError } from "@/lib/api/client";

export function useCreateFlashCard(protectedAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation<FlashCard, ApiError, FlashCardFormValues>({
    mutationFn: (payload) => createFlashCard(protectedAreaId, payload),
    onSuccess: () => {
      toast.success("Flashcard creada correctamente.");
      queryClient.invalidateQueries({
        queryKey: ["flash-cards", protectedAreaId],
      });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
