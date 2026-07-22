"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchConversationForTeacher } from "../api/chatbot-conversations.api";

/** Uso del docente: transcripción completa de una conversación. */
export function useConversationForTeacher(id: string | null) {
  return useQuery({
    queryKey: ["chatbot-conversations", "teacher", "detail", id],
    queryFn: () => fetchConversationForTeacher(id as string),
    enabled: !!id,
  });
}
