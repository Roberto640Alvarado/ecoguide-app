"use client";

import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { EcoGuideAvatar } from "@/components/ui/eco-guide-avatar";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language-store";
import { useTranslatedText } from "@/features/translation/hooks/use-translated-texts";
import { ChatDateSeparator } from "./chat-date-separator";
import type { ChatMessageItem } from "../utils/group-chat-messages";

/**
 * - "history": mensajes que ya existían al abrir la conversación — entran
 *   con un fade corto y escalonado.
 * - "new": mensajes que llegan durante la sesión — entran con un resorte
 *   (estilo iMessage): el del estudiante "sube" desde el input y el de
 *   EcoGuía "brota" desde su avatar.
 */
export type ChatBubbleEntrance = "history" | "new";

interface ChatMessageBubbleProps {
  item: ChatMessageItem;
  entrance: ChatBubbleEntrance;
  /** Posición en la lista, para escalonar la entrada del historial. */
  index: number;
  /** Mensaje optimista que todavía no confirma la API. */
  isPending?: boolean;
}

const SEND_SPRING: Transition = {
  type: "spring",
  stiffness: 520,
  damping: 34,
  mass: 0.8,
};

const RECEIVE_SPRING: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 28,
};

const MAX_HISTORY_DELAY_S = 0.3;

export function ChatMessageBubble({
  item,
  entrance,
  index,
  isPending = false,
}: ChatMessageBubbleProps) {
  const language = useLanguageStore((state) => state.language);
  const reduceMotion = useReducedMotion();
  const { message, isFirstInGroup, isLastInGroup, showDateSeparator } = item;
  const isUser = message.role === "user";
  // Solo se traduce lo que dice el bot — lo que escribió el estudiante se
  // muestra tal cual, es su propio texto.
  const translatedMessage = useTranslatedText(isUser ? "" : message.message);

  const { initial, transition } = (() => {
    if (reduceMotion) {
      return { initial: { opacity: 0 }, transition: { duration: 0.15 } };
    }

    if (entrance === "history") {
      return {
        initial: { opacity: 0, y: 8 },
        transition: {
          duration: 0.25,
          ease: "easeOut" as const,
          delay: Math.min(index * 0.025, MAX_HISTORY_DELAY_S),
        },
      };
    }

    return isUser
      ? { initial: { opacity: 0, y: 24, scale: 0.88 }, transition: SEND_SPRING }
      : { initial: { opacity: 0, y: 6, scale: 0.85 }, transition: RECEIVE_SPRING };
  })();

  return (
    <motion.div
      layout="position"
      initial={initial}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={transition}
      style={{ transformOrigin: isUser ? "100% 100%" : "0% 100%" }}
      className={cn("flex flex-col", isFirstInGroup ? "pt-3" : "pt-0.5")}
    >
      {showDateSeparator && (
        <ChatDateSeparator date={message.createdAt} language={language} />
      )}

      <div className={cn("flex items-end gap-2", isUser && "justify-end")}>
        {!isUser && (
          <div className="w-7 shrink-0">
            {isLastInGroup && <EcoGuideAvatar size={28} className="h-7 w-7" />}
          </div>
        )}

        <div
          className={cn(
            "flex min-w-0 max-w-[85%] flex-col sm:max-w-[75%] lg:max-w-[65%]",
            isUser ? "items-end" : "items-start",
          )}
        >
          {!isUser && isFirstInGroup && (
            <span className="mb-1 px-3 text-[11px] font-medium text-muted">
              EcoGuía
            </span>
          )}

          <div
            className={cn(
              "whitespace-pre-wrap break-words rounded-[20px] px-4 py-2 text-[15px] leading-snug transition-opacity",
              isUser
                ? "bg-accent text-accent-foreground"
                : "bg-surface-secondary text-foreground",
              isLastInGroup && (isUser ? "rounded-br-md" : "rounded-bl-md"),
              isPending && "opacity-75",
            )}
          >
            {isUser ? message.message : translatedMessage}
          </div>

          {isLastInGroup && (
            <span className="mt-1 px-2 text-[11px] text-muted">
              {isPending
                ? language === "en"
                  ? "Sending…"
                  : "Enviando…"
                : format(new Date(message.createdAt), "p", {
                    locale: language === "en" ? enUS : es,
                  })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
