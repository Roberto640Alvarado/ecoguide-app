"use client";

import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Button, Spinner } from "@heroui/react";
import { MessageSquarePlus, MessagesSquare } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useConversationsByArea } from "../hooks/use-conversations-by-area";
import type { ChatbotConversation } from "../types/chatbot-conversation.types";

interface ConversationListProps {
  protectedAreaId: string;
  activeConversationId: string | null;
  onSelect: (conversation: ChatbotConversation) => void;
  onStartNew: () => void;
  isStarting: boolean;
}

/** Lista de conversaciones anteriores del estudiante en esta área ("n
 * chats") + botón para iniciar una nueva. */
export function ConversationList({
  protectedAreaId,
  activeConversationId,
  onSelect,
  onStartNew,
  isStarting,
}: ConversationListProps) {
  const language = useLanguageStore((state) => state.language);
  const { data, isLoading } = useConversationsByArea(protectedAreaId, {
    limit: 20,
    sort: "startedAt:desc",
  });

  return (
    <div className="flex h-[32rem] w-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:h-[36rem] sm:w-64 sm:shrink-0">
      <Button variant="primary" onPress={onStartNew} isDisabled={isStarting}>
        {isStarting ? (
          <Spinner size="sm" />
        ) : (
          <>
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            {language === "en" ? "New chat" : "Nuevo chat"}
          </>
        )}
      </Button>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="sm" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <p className="px-1 py-4 text-center text-xs text-muted">
            {language === "en" ? "No chats yet." : "Aún no hay chats."}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {data.items.map((conversation) => {
              const lastMessage =
                conversation.messages[conversation.messages.length - 1];
              const isActive = conversation.id === activeConversationId;

              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conversation)}
                    className={`flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? "bg-accent-soft text-accent-soft-foreground"
                        : "hover:bg-surface-secondary"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <MessagesSquare
                        className="h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      {formatDistanceToNow(new Date(conversation.startedAt), {
                        addSuffix: true,
                        locale: language === "en" ? enUS : es,
                      })}
                    </span>
                    {lastMessage && (
                      <span className="line-clamp-1 text-xs text-muted">
                        {lastMessage.message}
                      </span>
                    )}
                    {!conversation.endedAt && (
                      <span className="w-fit rounded-full bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success-soft-foreground">
                        {language === "en" ? "Active" : "Activo"}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
