"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { updateChatbotConfig } from "../api/chatbot-configs.api";
import type { ChatbotConfig } from "../types/chatbot-config.types";
import type { ChatbotConfigFormValues } from "../schemas/chatbot-config.schema";
import type { ApiError } from "@/lib/api/client";

export function useUpdateChatbotConfig(id: string, protectedAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation<ChatbotConfig, ApiError, Partial<ChatbotConfigFormValues>>({
    mutationFn: (payload) => updateChatbotConfig(id, payload),
    onSuccess: () => {
      toast.success("Chatbot actualizado correctamente.");
      queryClient.invalidateQueries({
        queryKey: ["chatbot-configs", "by-area", protectedAreaId],
      });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
