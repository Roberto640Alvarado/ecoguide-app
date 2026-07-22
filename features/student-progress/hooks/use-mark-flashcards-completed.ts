"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { markFlashcardsCompleted } from "../api/student-progress.api";
import type { ApiError } from "@/lib/api/client";

/**
 * Se dispara desde FlashCardFinishDialog al terminar el mazo (única
 * actividad del recorrido sin rastro propio en otra colección, ver
 * StudentProgressRepository en la API). No bloquea la celebración del
 * estudiante si falla — solo se invalida la caché de progreso al terminar.
 */
export function useMarkFlashcardsCompleted(protectedAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation<null, ApiError, void>({
    mutationFn: () => markFlashcardsCompleted(protectedAreaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-progress"] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
