"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { removeBadge } from "../api/badges.api";
import type { ApiError } from "@/lib/api/client";

export function useRemoveBadge(protectedAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation<null, ApiError, string>({
    mutationFn: (id) => removeBadge(id),
    onSuccess: () => {
      toast.success("Insignia eliminada correctamente.");
      queryClient.invalidateQueries({ queryKey: ["badges", protectedAreaId] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
