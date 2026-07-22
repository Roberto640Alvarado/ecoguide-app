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
  // UpdateChatbotConfigDto nunca acepta `protectedAreaId` (no se puede
  // reasignar la config a otra área) — si viaja, la API responde 400
  // "should not exist" por el whitelist estricto del ValidationPipe.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { protectedAreaId: _protectedAreaId, ...rest } = payload;

  return apiPatch<ChatbotConfig>(`/chatbot-configs/${id}`, rest);
}
