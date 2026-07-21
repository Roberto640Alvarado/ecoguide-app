"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchConversationsByArea } from "../api/chatbot-conversations.api";
import type { FindConversationsParams } from "../types/chatbot-conversation.types";

export function useConversationsByArea(
  protectedAreaId: string,
  params: FindConversationsParams = {},
) {
  return useQuery({
    queryKey: ["chatbot-conversations", protectedAreaId, params],
    queryFn: () => fetchConversationsByArea(protectedAreaId, params),
    enabled: !!protectedAreaId,
  });
}
