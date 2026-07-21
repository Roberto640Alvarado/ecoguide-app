"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { finishConversation } from "../api/chatbot-conversations.api";
import type { ChatbotConversation } from "../types/chatbot-conversation.types";
import type { ApiError } from "@/lib/api/client";

export function useFinishConversation() {
  const queryClient = useQueryClient();

  return useMutation<ChatbotConversation, ApiError, string>({
    mutationFn: finishConversation,
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({
        queryKey: ["chatbot-conversations", conversation.protectedAreaId],
      });
    },
  });
}
