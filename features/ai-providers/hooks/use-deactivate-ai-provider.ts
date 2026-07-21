"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { deactivateAIProvider } from "../api/ai-providers.api";
import type { ApiError } from "@/lib/api/client";

export function useDeactivateAIProvider() {
  const queryClient = useQueryClient();

  return useMutation<null, ApiError, string>({
    mutationFn: (id) => deactivateAIProvider(id),
    onSuccess: () => {
      toast.success("Proveedor desactivado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["ai-providers"] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
