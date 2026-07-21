"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startConversation } from "../api/chatbot-conversations.api";
import type { ChatbotConversation } from "../types/chatbot-conversation.types";
import type { ApiError } from "@/lib/api/client";

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation<ChatbotConversation, ApiError, string>({
    mutationFn: startConversation,
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({
        queryKey: ["chatbot-conversations", conversation.protectedAreaId],
      });
    },
  });
}
