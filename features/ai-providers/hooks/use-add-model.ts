"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { addModel } from "../api/ai-providers.api";
import type { AIProvider } from "../types/ai-provider.types";
import type { ModelFormValues } from "../schemas/model.schema";
import type { ApiError } from "@/lib/api/client";

export function useAddModel(providerId: string) {
  const queryClient = useQueryClient();

  return useMutation<AIProvider, ApiError, ModelFormValues>({
    mutationFn: (payload) => addModel(providerId, payload),
    onSuccess: () => {
      toast.success("Modelo agregado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["ai-providers", providerId] });
      queryClient.invalidateQueries({ queryKey: ["ai-providers"] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
