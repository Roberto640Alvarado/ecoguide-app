"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { createChatbotConfig } from "../api/chatbot-configs.api";
import type { ChatbotConfig } from "../types/chatbot-config.types";
import type { ChatbotConfigFormValues } from "../schemas/chatbot-config.schema";
import type { ApiError } from "@/lib/api/client";

export function useCreateChatbotConfig() {
  const queryClient = useQueryClient();

  return useMutation<ChatbotConfig, ApiError, ChatbotConfigFormValues>({
    mutationFn: createChatbotConfig,
    onSuccess: (data) => {
      toast.success("Chatbot configurado correctamente.");
      queryClient.invalidateQueries({
        queryKey: ["chatbot-configs", "by-area", data.protectedAreaId],
      });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
