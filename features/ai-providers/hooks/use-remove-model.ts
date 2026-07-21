"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { removeModel } from "../api/ai-providers.api";
import type { AIProvider } from "../types/ai-provider.types";
import type { ApiError } from "@/lib/api/client";

export function useRemoveModel(providerId: string) {
  const queryClient = useQueryClient();

  return useMutation<AIProvider, ApiError, string>({
    mutationFn: (modelId) => removeModel(providerId, modelId),
    onSuccess: () => {
      toast.success("Modelo eliminado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["ai-providers", providerId] });
      queryClient.invalidateQueries({ queryKey: ["ai-providers"] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
