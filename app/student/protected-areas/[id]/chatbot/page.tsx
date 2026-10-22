"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "@heroui/react";
import { ArrowLeft, History, Loader2, MessageCircle, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EcoGuideAvatar } from "@/components/ui/eco-guide-avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useChatbotConfigByArea } from "@/features/chatbot/hooks/use-chatbot-config-by-area";
import { useStartConversation } from "@/features/chatbot-conversations/hooks/use-start-conversation";
import { ConversationList } from "@/features/chatbot-conversations/components/conversation-list";
import { ChatWindow } from "@/features/chatbot-conversations/components/chat-window";
import { getErrorMessage } from "@/features/chatbot-conversations/utils/get-error-message";
import type { ChatbotConversation } from "@/features/chatbot-conversations/types/chatbot-conversation.types";

/**
 * El chat ocupa todo el alto disponible del viewport (menos el header del
 * shell, el link de regreso y el título). En escritorio el historial es una
 * columna fija a la izquierda; en móvil/tablet se abre como panel lateral
 * desde el botón de historial del header del chat.
 */
const CHAT_LAYOUT_HEIGHT =
  "h-[calc(100dvh-12.5rem)] min-h-[26rem] lg:h-[calc(100dvh-14.5rem)]";

export default function StudentChatbotPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const reduceMotion = useReducedMotion();
  const { data: area, isLoading: isLoadingArea } = useProtectedArea(params.id);
  const { data: config, isLoading: isLoadingConfig } = useChatbotConfigByArea(
    params.id,
  );
  const startConversation = useStartConversation();

  const [activeConversation, setActiveConversation] =
    useState<ChatbotConversation | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const isLoading = isLoadingArea || isLoadingConfig;

  async function handleStartNew() {
    try {
      const conversation = await startConversation.mutateAsync(params.id);
      setActiveConversation(conversation);
      setIsHistoryOpen(false);
    } catch (error) {
      toast.danger(getErrorMessage(error, language));
    }
  }

  function handleSelect(conversation: ChatbotConversation) {
    setActiveConversation(conversation);
    setIsHistoryOpen(false);
  }

  const listProps = {
    protectedAreaId: params.id,
    activeConversationId: activeConversation?.id ?? null,
    onSelect: handleSelect,
    onStartNew: handleStartNew,
    isStarting: startConversation.isPending,
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Link
        href={`/student/protected-areas/${params.id}/tour`}
        className="flex w-fit items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to tour" : "Volver al recorrido"}
      </Link>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex items-center gap-3"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Chatbot</h1>
          <p className="truncate text-sm text-muted">
            {isLoadingArea
              ? language === "en"
                ? "Loading area..."
                : "Cargando área..."
              : area?.name}
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted" aria-hidden="true" />
        </div>
      ) : !area ? (
        <p className="text-center text-sm text-muted">
          {language === "en"
            ? "Protected area not found."
            : "Área protegida no encontrada."}
        </p>
      ) : !config || !config.isActive ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-secondary/40 p-6 text-center text-sm text-muted">
          {language === "en"
            ? "This area doesn't have a chatbot yet. Check back soon!"
            : "Esta área todavía no tiene un chatbot. ¡Vuelve pronto!"}
        </div>
      ) : (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
          className={`grid grid-cols-1 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] ${CHAT_LAYOUT_HEIGHT}`}
        >
          <ConversationList
            {...listProps}
            layoutScope="desktop"
            className="hidden lg:flex"
          />

          <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <SheetContent
              side="left"
              showCloseButton={false}
              className="w-[85vw] max-w-sm gap-0 p-0 lg:hidden"
            >
              <SheetTitle className="sr-only">
                {language === "en" ? "Conversations" : "Conversaciones"}
              </SheetTitle>
              <ConversationList
                {...listProps}
                layoutScope="sheet"
                className="rounded-none border-0"
              />
            </SheetContent>
          </Sheet>

          {activeConversation ? (
            <ChatWindow
              key={activeConversation.id}
              conversation={activeConversation}
              onUpdated={setActiveConversation}
              onStartNew={handleStartNew}
              isStarting={startConversation.isPending}
              onOpenHistory={() => setIsHistoryOpen(true)}
            />
          ) : (
            <div className="flex h-full min-h-0 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
              <motion.div
                initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              >
                <EcoGuideAvatar size={72} className="h-18 w-18" />
              </motion.div>
              <div className="flex max-w-sm flex-col gap-1">
                <p className="text-base font-semibold text-foreground">
                  {language === "en"
                    ? "Chat with EcoGuía"
                    : "Conversa con EcoGuía"}
                </p>
                <p className="text-sm text-muted">
                  {language === "en"
                    ? "Start a new chat or pick a previous one to keep practicing."
                    : "Inicia un chat nuevo o elige uno anterior para seguir practicando."}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  className="rounded-full"
                  onClick={handleStartNew}
                  disabled={startConversation.isPending}
                >
                  {startConversation.isPending ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <MessageSquarePlus aria-hidden="true" />
                  )}
                  {language === "en" ? "New chat" : "Nuevo chat"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full lg:hidden"
                  onClick={() => setIsHistoryOpen(true)}
                >
                  <History aria-hidden="true" />
                  {language === "en" ? "Previous chats" : "Chats anteriores"}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
