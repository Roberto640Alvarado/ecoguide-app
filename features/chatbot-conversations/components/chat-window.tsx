"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "@heroui/react";
import { CheckCheck, ChevronLeft, Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EcoGuideAvatar } from "@/components/ui/eco-guide-avatar";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language-store";
import { useTranslatedText } from "@/features/translation/hooks/use-translated-texts";
import { useSendMessage } from "../hooks/use-send-message";
import { useFinishConversation } from "../hooks/use-finish-conversation";
import { groupChatMessages } from "../utils/group-chat-messages";
import { getErrorMessage } from "../utils/get-error-message";
import { ChatMessageBubble } from "./chat-message-bubble";
import { ChatComposer } from "./chat-composer";
import { FinishConversationDialog } from "./finish-conversation-dialog";
import { TypingIndicator } from "./typing-indicator";
import type {
  ChatMessage,
  ChatbotConversation,
} from "../types/chatbot-conversation.types";

interface ChatWindowProps {
  conversation: ChatbotConversation;
  onUpdated: (conversation: ChatbotConversation) => void;
  onStartNew: () => void;
  isStarting: boolean;
  /** Abre el historial de chats (en móvil/tablet vive en un panel lateral). */
  onOpenHistory: () => void;
  className?: string;
}

/**
 * Ventana de conversación estilo app de mensajería. Debe montarse con
 * `key={conversation.id}`: así los mensajes existentes al abrirla entran con
 * la animación de "historial" y solo los que llegan después usan el resorte
 * de envío/recepción.
 *
 * El mensaje del estudiante se muestra de inmediato (optimista) mientras la
 * API responde; al confirmarse, el mensaje real hereda la misma `key` para
 * que React no lo vuelva a montar ni a animar.
 */
export function ChatWindow({
  conversation,
  onUpdated,
  onStartNew,
  isStarting,
  onOpenHistory,
  className,
}: ChatWindowProps) {
  const language = useLanguageStore((state) => state.language);
  const reduceMotion = useReducedMotion();
  const sendMessage = useSendMessage();
  const finishConversation = useFinishConversation();
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<ChatMessage | null>(null);
  const [keyAliases, setKeyAliases] = useState<Record<string, string>>({});
  const [historyIds] = useState(
    () => new Set(conversation.messages.map((message) => message.id)),
  );
  const pendingCountRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const isFinished = !!conversation.endedAt;
  const isTyping = sendMessage.isPending;
  const translatedFeedback = useTranslatedText(conversation.feedback ?? "");

  const items = useMemo(
    () =>
      groupChatMessages(
        pendingMessage
          ? [...conversation.messages, pendingMessage]
          : conversation.messages,
      ),
    [conversation.messages, pendingMessage],
  );

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    // Al abrir la conversación se salta directo al final; después, cada
    // mensaje nuevo desplaza suavemente.
    container.scrollTo({
      top: container.scrollHeight,
      behavior: hasScrolledRef.current && !reduceMotion ? "smooth" : "auto",
    });
    hasScrolledRef.current = true;
  }, [items.length, isTyping, isFinished, reduceMotion]);

  async function handleSend() {
    const trimmed = input.trim();

    if (!trimmed || isFinished || isTyping) {
      return;
    }

    const pendingKey = `pending-${pendingCountRef.current++}`;

    setPendingMessage({
      id: pendingKey,
      role: "user",
      message: trimmed,
      createdAt: new Date().toISOString(),
    });
    setInput("");

    try {
      const updated = await sendMessage.mutateAsync({
        id: conversation.id,
        message: trimmed,
      });

      const knownIds = new Set(conversation.messages.map((message) => message.id));
      const confirmedMessage = updated.messages.find(
        (message) => message.role === "user" && !knownIds.has(message.id),
      );

      if (confirmedMessage) {
        setKeyAliases((current) => ({
          ...current,
          [confirmedMessage.id]: pendingKey,
        }));
      }

      setPendingMessage(null);
      onUpdated(updated);
    } catch (error) {
      setPendingMessage(null);
      setInput(trimmed);
      toast.danger(getErrorMessage(error, language));
    }
  }

  async function handleFinish() {
    try {
      const updated = await finishConversation.mutateAsync(conversation.id);
      onUpdated(updated);
    } catch (error) {
      toast.danger(getErrorMessage(error, language));
    }
  }

  const statusText = isFinished
    ? language === "en"
      ? "Conversation finished"
      : "Conversación finalizada"
    : isTyping
      ? language === "en"
        ? "Typing…"
        : "Escribiendo…"
      : language === "en"
        ? "Online"
        : "En línea";

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface",
        className,
      )}
    >
      <header className="flex items-center gap-3 border-b border-border px-3 py-2.5 sm:px-5 sm:py-3">
        {/* Botón "‹ Chats" estilo iOS: en móvil/tablet el historial no está
            visible, así que el acceso necesita texto, no solo un ícono. */}
        <button
          type="button"
          onClick={onOpenHistory}
          aria-label={
            language === "en" ? "Show previous chats" : "Ver chats anteriores"
          }
          className="-ml-1.5 flex shrink-0 items-center rounded-full py-1.5 pl-0.5 pr-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:bg-accent-soft lg:hidden"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
          Chats
        </button>

        <span className="relative shrink-0">
          <EcoGuideAvatar size={40} className="h-9 w-9 sm:h-10 sm:w-10" priority />
          {!isFinished && (
            <span
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-success"
              aria-hidden="true"
            />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">EcoGuía</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={statusText}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "truncate text-xs",
                isTyping ? "text-accent" : "text-muted",
              )}
            >
              {statusText}
            </motion.p>
          </AnimatePresence>
        </div>

        {!isFinished && (
          <FinishConversationDialog
            isLoading={finishConversation.isPending}
            onConfirm={handleFinish}
          />
        )}
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-1 sm:px-6"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col">
          {items.map((item, index) => (
            <ChatMessageBubble
              key={keyAliases[item.message.id] ?? item.message.id}
              item={item}
              index={index}
              entrance={historyIds.has(item.message.id) ? "history" : "new"}
              isPending={item.message.id === pendingMessage?.id}
            />
          ))}

          <AnimatePresence>
            {isTyping && <TypingIndicator key="typing" />}
          </AnimatePresence>

          {isFinished && conversation.feedback && (
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="mt-6 flex flex-col gap-2 rounded-2xl border border-accent/30 bg-accent-soft/40 p-4 sm:p-5"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                {language === "en" ? "Overall feedback" : "Retroalimentación general"}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {translatedFeedback}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <footer className="border-t border-border px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          {isFinished ? (
            <div className="flex flex-col items-center gap-3 py-1 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="text-sm text-muted">
                {language === "en"
                  ? "This conversation has ended."
                  : "Esta conversación ha finalizado."}
              </p>
              <Button
                size="sm"
                className="rounded-full"
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
          ) : (
            <ChatComposer
              value={input}
              onChange={setInput}
              onSubmit={handleSend}
              isSendDisabled={isTyping}
            />
          )}
        </div>
      </footer>
    </section>
  );
}
