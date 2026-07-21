import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { ChatbotConfig } from "../types/chatbot-config.types";
import type { ChatbotConfigFormValues } from "../schemas/chatbot-config.schema";

export function fetchChatbotConfigByArea(protectedAreaId: string) {
  return apiGet<ChatbotConfig | null>(
    `/chatbot-configs/by-area/${protectedAreaId}`,
  );
}

export function createChatbotConfig(payload: ChatbotConfigFormValues) {
  return apiPost<ChatbotConfig>("/chatbot-configs", payload);
}

export function updateChatbotConfig(
  id: string,
  payload: Partial<ChatbotConfigFormValues>,
) {
  return apiPatch<ChatbotConfig>(`/chatbot-configs/${id}`, payload);
}
