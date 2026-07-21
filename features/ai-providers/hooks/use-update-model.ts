"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { updateModel } from "../api/ai-providers.api";
import type { AIProvider } from "../types/ai-provider.types";
import type { ModelFormValues } from "../schemas/model.schema";
import type { ApiError } from "@/lib/api/client";

export function useUpdateModel(providerId: string) {
  const queryClient = useQueryClient();

  return useMutation<AIProvider, ApiError, { modelId: string; payload: ModelFormValues }>({
    mutationFn: ({ modelId, payload }) => updateModel(providerId, modelId, payload),
    onSuccess: () => {
      toast.success("Modelo actualizado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["ai-providers", providerId] });
      queryClient.invalidateQueries({ queryKey: ["ai-providers"] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
