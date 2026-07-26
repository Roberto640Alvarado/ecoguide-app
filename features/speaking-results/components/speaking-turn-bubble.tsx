import { Sparkles, User } from "lucide-react";
import type { SpeakingTurn } from "../types/speaking-result.types";

interface SpeakingTurnBubbleProps {
  turn: SpeakingTurn;
  studentLabel: string;
}

/**
 * Burbuja de un turno de la llamada de speaking (mismo estilo visual que
 * ChatMessageBubble del chatbot, pero sin depender del avatar real del
 * estudiante — acá alcanza con distinguir "EcoGuía" vs. el estudiante).
 */
export function SpeakingTurnBubble({
  turn,
  studentLabel,
}: SpeakingTurnBubbleProps) {
  const isUser = turn.role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground"
        }`}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </span>

      <div
        className={`flex max-w-[80%] flex-col gap-0.5 ${isUser ? "items-end" : "items-start"}`}
      >
        <span className="px-1 text-[11px] font-medium text-muted">
          {isUser ? studentLabel : "EcoGuía"}
        </span>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm bg-surface-secondary text-foreground"
          }`}
        >
          {turn.message}
        </div>
      </div>
    </div>
  );
}
