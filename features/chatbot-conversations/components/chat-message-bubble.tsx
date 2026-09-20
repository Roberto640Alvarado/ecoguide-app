import { UserAvatar } from "@/components/ui/user-avatar";
import { EcoGuideAvatar } from "@/components/ui/eco-guide-avatar";
import { useTranslatedText } from "@/features/translation/hooks/use-translated-texts";
import type { ChatMessage } from "../types/chatbot-conversation.types";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  studentName: string;
  studentAvatarUrl: string | null;
}

/**
 * Burbuja de un chat real: el estudiante aparece con su propio avatar/nombre
 * (como en cualquier app de mensajería) y el chatbot con el avatar de la
 * mascota EcoGuía (`EcoGuideAvatar`), el mismo personaje de la práctica de
 * speaking y la landing — antes era un ícono genérico de robot.
 */
export function ChatMessageBubble({
  message,
  studentName,
  studentAvatarUrl,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user";
  // Solo se traduce lo que dice el bot — lo que escribió el estudiante se
  // muestra tal cual, es su propio texto.
  const translatedMessage = useTranslatedText(isUser ? "" : message.message);

  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <UserAvatar name={studentName} avatarUrl={studentAvatarUrl} size="sm" />
      ) : (
        <EcoGuideAvatar size={28} className="h-7 w-7" />
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
          {isUser ? message.message : translatedMessage}
        </div>
      </div>
    </div>
  );
}
