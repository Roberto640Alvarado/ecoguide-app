"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Spinner, toast } from "@heroui/react";
import { CheckCheck, Flag, Send, Sparkles } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguageStore } from "@/store/language-store";
import { useTranslatedText } from "@/features/translation/hooks/use-translated-texts";
import { useSendMessage } from "../hooks/use-send-message";
import { useFinishConversation } from "../hooks/use-finish-conversation";
import { ChatMessageBubble } from "./chat-message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { ChatbotConversation } from "../types/chatbot-conversation.types";

interface ChatWindowProps {
  conversation: ChatbotConversation;
  studentName: string;
  studentAvatarUrl: string | null;
  onUpdated: (conversation: ChatbotConversation) => void;
}

/**
 * Ventana de chat "real": burbujas con avatar/nombre del estudiante vs. el
 * chatbot, animación de escribiendo mientras se espera la respuesta de la
 * IA, y un botón "Finalizar chat" que cierra la conversación (el estudiante
 * puede tener n conversaciones por área — finalizar una no impide empezar
 * otra nueva).
 */
export function ChatWindow({
  conversation,
  studentName,
  studentAvatarUrl,
  onUpdated,
}: ChatWindowProps) {
  const language = useLanguageStore((state) => state.language);
  const sendMessage = useSendMessage();
  const finishConversation = useFinishConversation();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const isFinished = !!conversation.endedAt;
  const translatedFeedback = useTranslatedText(conversation.feedback ?? "");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages.length, sendMessage.isPending]);

  async function handleSend() {
    const trimmed = input.trim();

    if (!trimmed || isFinished) {
      return;
    }

    setInput("");

    try {
      const updated = await sendMessage.mutateAsync({
        id: conversation.id,
        message: trimmed,
      });

      onUpdated(updated);
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : language === "en"
            ? "Something went wrong."
            : "Algo salió mal.";

      toast.danger(message);
      setInput(trimmed);
    }
  }

  async function handleFinish() {
    try {
      const updated = await finishConversation.mutateAsync(conversation.id);
      onUpdated(updated);
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : language === "en"
            ? "Something went wrong."
            : "Algo salió mal.";

      toast.danger(message);
    }
  }

  return (
    <div className="flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-border bg-surface sm:h-[36rem]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">EcoGuía</p>
            <p className="text-xs text-muted">
              {isFinished
                ? language === "en"
                  ? "Conversation finished"
                  : "Conversación finalizada"
                : language === "en"
                  ? "Online"
                  : "En línea"}
            </p>
          </div>
        </div>

        {!isFinished && (
          <ConfirmDialog
            trigger={
              <Button variant="outline" size="sm">
                <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                {language === "en" ? "Finish chat" : "Finalizar chat"}
              </Button>
            }
            title={language === "en" ? "Finish this chat?" : "¿Finalizar este chat?"}
            description={
              language === "en"
                ? "You'll get overall feedback on this conversation. You can always start a new chat afterwards."
                : "Recibirás una retroalimentación general de esta conversación. Después siempre puedes iniciar un chat nuevo."
            }
            confirmLabel={language === "en" ? "Finish" : "Finalizar"}
            isLoading={finishConversation.isPending}
            onConfirm={handleFinish}
          />
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {conversation.messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            message={message}
            studentName={studentName}
            studentAvatarUrl={studentAvatarUrl}
          />
        ))}

        {sendMessage.isPending && <TypingIndicator />}

        {isFinished && conversation.feedback && (
          <div className="flex flex-col gap-2 rounded-2xl border border-accent/30 bg-accent-soft/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              {language === "en" ? "Overall feedback" : "Retroalimentación general"}
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {translatedFeedback}
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {!isFinished && (
        <div className="flex items-end gap-2 border-t border-border p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder={
              language === "en" ? "Type a message..." : "Escribe un mensaje..."
            }
            className="max-h-32 flex-1 resize-none rounded-xl border border-layer-line bg-layer px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground-1 focus:outline-hidden focus:ring-1 focus:ring-primary-focus"
          />
          <Button
            variant="primary"
            onPress={handleSend}
            isDisabled={sendMessage.isPending || !input.trim()}
            aria-label={language === "en" ? "Send message" : "Enviar mensaje"}
          >
            {sendMessage.isPending ? (
              <Spinner size="sm" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
