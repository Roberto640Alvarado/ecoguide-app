"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Spinner, toast } from "@heroui/react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useAuthStore } from "@/store/auth-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useChatbotConfigByArea } from "@/features/chatbot/hooks/use-chatbot-config-by-area";
import { useStartConversation } from "@/features/chatbot-conversations/hooks/use-start-conversation";
import { ConversationList } from "@/features/chatbot-conversations/components/conversation-list";
import { ChatWindow } from "@/features/chatbot-conversations/components/chat-window";
import type { ChatbotConversation } from "@/features/chatbot-conversations/types/chatbot-conversation.types";

export default function StudentChatbotPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const user = useAuthStore((state) => state.user);
  const { data: area, isLoading: isLoadingArea } = useProtectedArea(params.id);
  const { data: config, isLoading: isLoadingConfig } = useChatbotConfigByArea(
    params.id,
  );
  const startConversation = useStartConversation();

  const [activeConversation, setActiveConversation] =
    useState<ChatbotConversation | null>(null);

  const isLoading = isLoadingArea || isLoadingConfig;
  const studentName = user ? `${user.name} ${user.lastName}` : "";

  async function handleStartNew() {
    try {
      const conversation = await startConversation.mutateAsync(params.id);
      setActiveConversation(conversation);
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
    <div className="flex flex-col gap-6">
      <Link
        href={`/student/protected-areas/${params.id}/tour`}
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to tour" : "Volver al recorrido"}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chatbot</h1>
          <p className="text-sm text-muted">
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
          <Spinner size="md" />
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <ConversationList
            protectedAreaId={params.id}
            activeConversationId={activeConversation?.id ?? null}
            onSelect={setActiveConversation}
            onStartNew={handleStartNew}
            isStarting={startConversation.isPending}
          />

          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              studentName={studentName}
              studentAvatarUrl={user?.avatarUrl ?? null}
              onUpdated={setActiveConversation}
            />
          ) : (
            <div className="flex h-[32rem] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface-secondary/30 p-8 text-center sm:h-[36rem]">
              <MessageCircle className="h-8 w-8 text-muted" aria-hidden="true" />
              <p className="text-sm text-muted">
                {language === "en"
                  ? "Start a new chat or pick a previous one."
                  : "Inicia un chat nuevo o elige uno anterior."}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
