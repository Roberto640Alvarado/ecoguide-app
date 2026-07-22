"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchConversationsForStudent } from "../api/chatbot-conversations.api";
import type { FindConversationsParams } from "../types/chatbot-conversation.types";

/** Uso del docente: conversaciones de un estudiante específico en un área. */
export function useConversationsForStudent(
  studentId: string,
  protectedAreaId: string,
  params: FindConversationsParams = {},
) {
  return useQuery({
    queryKey: [
      "chatbot-conversations",
      "teacher",
      studentId,
      protectedAreaId,
      params,
    ],
    queryFn: () =>
      fetchConversationsForStudent(studentId, protectedAreaId, params),
    enabled: !!studentId && !!protectedAreaId,
  });
}
