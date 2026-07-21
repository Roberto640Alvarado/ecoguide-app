"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { createAIProvider } from "../api/ai-providers.api";
import type { AIProvider } from "../types/ai-provider.types";
import type { CreateAIProviderFormValues } from "../schemas/create-ai-provider.schema";
import type { ApiError } from "@/lib/api/client";

export function useCreateAIProvider() {
  const queryClient = useQueryClient();

  return useMutation<AIProvider, ApiError, CreateAIProviderFormValues>({
    mutationFn: createAIProvider,
    onSuccess: () => {
      toast.success("Proveedor creado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["ai-providers"] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
