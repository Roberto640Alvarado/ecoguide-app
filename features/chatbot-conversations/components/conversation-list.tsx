"use client";

import { formatDistanceToNow } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EcoGuideAvatar } from "@/components/ui/eco-guide-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language-store";
import { useConversationsByArea } from "../hooks/use-conversations-by-area";
import type { ChatbotConversation } from "../types/chatbot-conversation.types";

interface ConversationListProps {
  protectedAreaId: string;
  activeConversationId: string | null;
  onSelect: (conversation: ChatbotConversation) => void;
  onStartNew: () => void;
  isStarting: boolean;
  /** Distingue el `layoutId` del resaltado cuando hay dos instancias
   *  montadas (columna en escritorio + panel lateral en móvil). */
  layoutScope: string;
  className?: string;
}

const SKELETON_ROWS = [0, 1, 2, 3];

/** Historial de chats del estudiante en esta área + botón de chat nuevo. */
export function ConversationList({
  protectedAreaId,
  activeConversationId,
  onSelect,
  onStartNew,
  isStarting,
  layoutScope,
  className,
}: ConversationListProps) {
  const language = useLanguageStore((state) => state.language);
  const reduceMotion = useReducedMotion();
  const { data, isLoading } = useConversationsByArea(protectedAreaId, {
    limit: 20,
    sort: "startedAt:desc",
  });

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface",
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">
          {language === "en" ? "Conversations" : "Conversaciones"}
        </h2>
        <Button
          className="w-full rounded-full"
          onClick={onStartNew}
          disabled={isStarting}
        >
          {isStarting ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <MessageSquarePlus aria-hidden="true" />
          )}
          {language === "en" ? "New chat" : "Nuevo chat"}
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex flex-col gap-1">
            {SKELETON_ROWS.map((row) => (
              <div key={row} className="flex items-center gap-3 px-3 py-2.5">
                <Skeleton className="size-9 rounded-full bg-surface-secondary" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-1/2 bg-surface-secondary" />
                  <Skeleton className="h-3 w-4/5 bg-surface-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted">
            {language === "en" ? "No chats yet." : "Aún no hay chats."}
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {data.items.map((conversation, index) => {
              const lastMessage =
                conversation.messages[conversation.messages.length - 1];
              const isActive = conversation.id === activeConversationId;
              const isOngoing = !conversation.endedAt;

              return (
                <motion.li
                  key={conversation.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(conversation)}
                    aria-current={isActive ? "true" : undefined}
                    className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
                  >
                    {isActive && (
                      <motion.span
                        layoutId={`active-conversation-${layoutScope}`}
                        className="absolute inset-0 rounded-xl bg-accent-soft"
                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                        aria-hidden="true"
                      />
                    )}

                    <span className="relative shrink-0">
                      <EcoGuideAvatar size={36} className="h-9 w-9" />
                      {isOngoing && (
                        <span
                          className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-success"
                          aria-hidden="true"
                        />
                      )}
                    </span>

                    <span className="relative flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {formatDistanceToNow(new Date(conversation.startedAt), {
                            addSuffix: true,
                            locale: language === "en" ? enUS : es,
                          })}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-[10px] font-semibold uppercase tracking-wide",
                            isOngoing ? "text-success" : "text-muted",
                          )}
                        >
                          {isOngoing
                            ? language === "en"
                              ? "Active"
                              : "Activo"
                            : language === "en"
                              ? "Ended"
                              : "Finalizado"}
                        </span>
                      </span>
                      {lastMessage && (
                        <span className="line-clamp-1 text-xs text-muted">
                          {lastMessage.role === "user" &&
                            (language === "en" ? "You: " : "Tú: ")}
                          {lastMessage.message}
                        </span>
                      )}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
