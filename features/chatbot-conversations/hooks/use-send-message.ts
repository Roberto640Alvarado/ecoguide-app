"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendConversationMessage } from "../api/chatbot-conversations.api";
import type { ChatbotConversation } from "../types/chatbot-conversation.types";
import type { ApiError } from "@/lib/api/client";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<
    ChatbotConversation,
    ApiError,
    { id: string; message: string }
  >({
    mutationFn: ({ id, message }) => sendConversationMessage(id, message),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({
        queryKey: ["chatbot-conversations", conversation.protectedAreaId],
      });
    },
  });
}
