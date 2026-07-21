"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { updateAIProvider } from "../api/ai-providers.api";
import type { AIProvider } from "../types/ai-provider.types";
import type { UpdateAIProviderFormValues } from "../schemas/update-ai-provider.schema";
import type { ApiError } from "@/lib/api/client";

export function useUpdateAIProvider(id: string) {
  const queryClient = useQueryClient();

  return useMutation<AIProvider, ApiError, Partial<UpdateAIProviderFormValues>>({
    mutationFn: (payload) => updateAIProvider(id, payload),
    onSuccess: () => {
      toast.success("Proveedor actualizado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["ai-providers"] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
