"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Spinner } from "@heroui/react";
import { Bot, ChevronDown, User } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useConversationsForStudent } from "@/features/chatbot-conversations/hooks/use-conversations-for-student";
import { useConversationForTeacher } from "@/features/chatbot-conversations/hooks/use-conversation-for-teacher";

interface TeacherChatbotConversationsProps {
  studentId: string;
  protectedAreaId: string;
}

/** Panel del docente: conversaciones de chatbot de un estudiante, con
 * transcripción completa expandible una a la vez. */
export function TeacherChatbotConversations({
  studentId,
  protectedAreaId,
}: TeacherChatbotConversationsProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading } = useConversationsForStudent(
    studentId,
    protectedAreaId,
    { limit: 20, sort: "startedAt:desc" },
  );
  const { data: detail, isLoading: isLoadingDetail } =
    useConversationForTeacher(expandedId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size="sm" />
      </div>
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <p className="py-3 text-sm text-muted">
        {en ? "No conversations yet." : "Todavía no hay conversaciones."}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((conversation) => {
        const isExpanded = expandedId === conversation.id;

        return (
          <li
            key={conversation.id}
            className="rounded-xl border border-border bg-surface"
          >
            <button
              type="button"
              onClick={() =>
                setExpandedId(isExpanded ? null : conversation.id)
              }
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-foreground">
                <Bot className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                {formatDistanceToNow(new Date(conversation.startedAt), {
                  addSuffix: true,
                  locale: language === "en" ? enUS : es,
                })}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                {conversation.endedAt ? (
                  <span className="rounded-full bg-default-soft px-2 py-0.5 text-[10px] font-semibold text-muted">
                    {en ? "Finished" : "Finalizada"}
                  </span>
                ) : (
                  <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success-soft-foreground">
                    {en ? "Active" : "Activa"}
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </div>
            </button>
            {isExpanded && (
              <div className="flex flex-col gap-2 border-t border-border px-4 py-3">
                {isLoadingDetail ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                  </div>
                ) : (
                  <>
                    <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                      {detail?.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-2 text-sm ${
                            message.role === "assistant"
                              ? ""
                              : "flex-row-reverse text-right"
                          }`}
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-default-soft text-muted">
                            {message.role === "assistant" ? (
                              <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <User className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </span>
                          <p className="min-w-0 rounded-xl bg-surface-secondary/60 px-3 py-2 text-foreground">
                            {message.message}
                          </p>
                        </div>
                      ))}
                    </div>
                    {detail?.feedback && (
                      <div className="rounded-xl bg-accent-soft/50 p-3 text-sm">
                        <p className="text-xs font-semibold text-accent-soft-foreground">
                          {en ? "General feedback" : "Retroalimentación general"}
                        </p>
                        <p className="text-foreground">{detail.feedback}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
