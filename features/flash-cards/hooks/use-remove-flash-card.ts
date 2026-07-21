"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { removeFlashCard } from "../api/flash-cards.api";
import type { ApiError } from "@/lib/api/client";

export function useRemoveFlashCard(protectedAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation<null, ApiError, string>({
    mutationFn: (id) => removeFlashCard(id),
    onSuccess: () => {
      toast.success("Flashcard eliminada correctamente.");
      queryClient.invalidateQueries({
        queryKey: ["flash-cards", protectedAreaId],
      });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
