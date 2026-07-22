import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { PaginatedResult } from "@/types/api";
import type {
  ChatbotConversation,
  FindConversationsParams,
} from "../types/chatbot-conversation.types";

export function fetchConversationsByArea(
  protectedAreaId: string,
  params: FindConversationsParams,
) {
  return apiGet<PaginatedResult<ChatbotConversation>>(
    `/chatbot-conversations/by-area/${protectedAreaId}`,
    { params },
  );
}

export function fetchConversation(id: string) {
  return apiGet<ChatbotConversation>(`/chatbot-conversations/${id}`);
}

/** Uso del docente: conversaciones de un estudiante específico en un área. */
export function fetchConversationsForStudent(
  studentId: string,
  protectedAreaId: string,
  params: FindConversationsParams,
) {
  return apiGet<PaginatedResult<ChatbotConversation>>(
    `/chatbot-conversations/teacher/students/${studentId}/by-area/${protectedAreaId}`,
    { params },
  );
}

/** Uso del docente: transcripción completa de una conversación. */
export function fetchConversationForTeacher(id: string) {
  return apiGet<ChatbotConversation>(`/chatbot-conversations/teacher/${id}`);
}

export function startConversation(protectedAreaId: string) {
  return apiPost<ChatbotConversation>("/chatbot-conversations", {
    protectedAreaId,
  });
}

export function sendConversationMessage(id: string, message: string) {
  return apiPost<ChatbotConversation>(`/chatbot-conversations/${id}/messages`, {
    message,
  });
}

export function finishConversation(id: string) {
  return apiPatch<ChatbotConversation>(
    `/chatbot-conversations/${id}/finish`,
    {},
  );
}
