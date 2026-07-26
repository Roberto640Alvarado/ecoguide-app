"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkAreaBadges } from "../api/student-progress.api";
import type { BadgeAwardResult } from "@/features/badges/types/badge.types";
import type { ApiError } from "@/lib/api/client";

/**
 * Revisión silenciosa en segundo plano: se llama una vez por área al cargar
 * el avance del estudiante (ver BadgeUnlockWatcher y la vista de "Nota" del
 * recorrido). No muestra errores al estudiante — si falla, simplemente no se
 * desbloquea nada esta vez, se reintentará en la próxima visita.
 */
export function useCheckAreaBadges() {
  const queryClient = useQueryClient();

  return useMutation<BadgeAwardResult, ApiError, string>({
    mutationFn: (protectedAreaId) => checkAreaBadges(protectedAreaId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-progress", "badges"],
      });
    },
  });
}
