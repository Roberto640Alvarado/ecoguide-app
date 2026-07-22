"use client";

import { motion } from "framer-motion";
import { BookOpen, Bot, ClipboardCheck, MessagesSquare } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import type { StudentAreaProgress } from "../types/student-progress.types";
import { TeacherSpeakingAttempts } from "./teacher-speaking-attempts";
import { TeacherChatbotConversations } from "./teacher-chatbot-conversations";
import { TeacherTestAttempts } from "./teacher-test-attempts";

interface TeacherAreaDrillDownProps {
  studentId: string;
  progress: StudentAreaProgress;
}

/**
 * Detalle expandido de un área para el docente: qué respondió el estudiante
 * en cada paso. Flashcards no tiene drill-down propio — el backend solo
 * guarda si el estudiante terminó de ver el mazo, no respuestas individuales.
 */
export function TeacherAreaDrillDown({
  studentId,
  progress,
}: TeacherAreaDrillDownProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="flex flex-col gap-4 border-t border-border bg-surface-secondary/30 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BookOpen className="h-4 w-4 text-muted" aria-hidden="true" />
          FlashCards
        </div>
        <p className="-mt-2 text-sm text-muted">
          {!progress.flashCards.available
            ? en
              ? "Not configured for this area."
              : "No configuradas para esta área."
            : progress.flashCards.completed
              ? en
                ? "The student finished the deck."
                : "El estudiante terminó de ver el mazo."
              : en
                ? "The student hasn't finished the deck yet."
                : "El estudiante todavía no termina de ver el mazo."}
        </p>

        {progress.speaking.available && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MessagesSquare className="h-4 w-4 text-muted" aria-hidden="true" />
              {en ? "Speaking practice" : "Práctica de speaking"}
            </div>
            <TeacherSpeakingAttempts
              studentId={studentId}
              protectedAreaId={progress.protectedAreaId}
            />
          </div>
        )}

        {progress.chatbot.available && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Bot className="h-4 w-4 text-muted" aria-hidden="true" />
              Chatbot
            </div>
            <TeacherChatbotConversations
              studentId={studentId}
              protectedAreaId={progress.protectedAreaId}
            />
          </div>
        )}

        {progress.test.available && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ClipboardCheck className="h-4 w-4 text-muted" aria-hidden="true" />
              {en ? "Test" : "Examen"}
            </div>
            <TeacherTestAttempts
              studentId={studentId}
              protectedAreaId={progress.protectedAreaId}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
