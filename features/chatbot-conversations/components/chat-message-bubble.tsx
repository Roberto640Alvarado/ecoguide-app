import { Bot } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { ChatMessage } from "../types/chatbot-conversation.types";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  studentName: string;
  studentAvatarUrl: string | null;
}

/**
 * Burbuja de un chat real: el estudiante aparece con su propio avatar/nombre
 * (como en cualquier app de mensajería), el chatbot con un avatar de bot
 * genérico y el nombre "EcoGuía".
 */
export function ChatMessageBubble({
  message,
  studentName,
  studentAvatarUrl,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <UserAvatar name={studentName} avatarUrl={studentAvatarUrl} size="sm" />
      ) : (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </span>
      )}

      <div
        className={`flex max-w-[75%] flex-col gap-0.5 ${isUser ? "items-end" : "items-start"}`}
      >
        <span className="px-1 text-[11px] font-medium text-muted">
          {isUser ? studentName : "EcoGuía"}
        </span>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-br-sm bg-accent text-accent-foreground"
              : "rounded-bl-sm bg-surface-secondary text-foreground"
          }`}
        >
          {message.message}
        </div>
      </div>
    </div>
  );
}
