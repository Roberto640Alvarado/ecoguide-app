"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchChatbotConfigByArea } from "../api/chatbot-configs.api";

export function useChatbotConfigByArea(protectedAreaId: string) {
  return useQuery({
    queryKey: ["chatbot-configs", "by-area", protectedAreaId],
    queryFn: () => fetchChatbotConfigByArea(protectedAreaId),
    enabled: !!protectedAreaId,
  });
}
