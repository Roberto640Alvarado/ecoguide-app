"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  MessagesSquare,
} from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import type { StudentAreaProgress } from "../types/student-progress.types";
import { TeacherSpeakingAttempts } from "./teacher-speaking-attempts";
import { TeacherChatbotConversations } from "./teacher-chatbot-conversations";
import { TeacherTestAttempts } from "./teacher-test-attempts";

interface TeacherAreaDrillDownProps {
  studentId: string;
  progress: StudentAreaProgress;
}

type StageId = "flashCards" | "speaking" | "chatbot" | "test";

interface StageTab {
  id: StageId;
  label: string;
  icon: typeof BookOpen;
}

/**
 * Detalle expandido de un área para el docente: qué respondió el estudiante
 * en cada paso, organizado en pestañas (FlashCards / Speaking / Chatbot /
 * Examen) en vez de una lista larga apilada — cada pestaña carga su propio
 * contenido al seleccionarla.
 */
export function TeacherAreaDrillDown({
  studentId,
  progress,
}: TeacherAreaDrillDownProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";

  const allTabs: StageTab[] = [
    { id: "flashCards", label: "FlashCards", icon: BookOpen },
    { id: "speaking", label: "Speaking", icon: MessagesSquare },
    { id: "chatbot", label: "Chatbot", icon: Bot },
    { id: "test", label: en ? "Test" : "Examen", icon: ClipboardCheck },
  ];
  const tabs = allTabs.filter((tab) => progress[tab.id].available);

  const [activeTab, setActiveTab] = useState<StageId | undefined>(
    tabs[0]?.id,
  );
  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  if (!currentTab) {
    return (
      <div className="border-t border-border bg-surface-secondary/30 p-5 text-center text-sm text-muted">
        {en
          ? "This area doesn't have any steps configured yet."
          : "Esta área todavía no tiene pasos configurados."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 border-t border-border bg-surface-secondary/30 p-4 sm:p-5">
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-surface p-1">
        {tabs.map((tab) => {
          const isActive = tab.id === currentTab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId={`stage-tab-bg-${progress.protectedAreaId}`}
                  className="absolute inset-0 rounded-lg bg-accent"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
              )}
              <tab.icon
                className="relative z-10 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span className="relative z-10 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {currentTab.id === "flashCards" && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  progress.flashCards.completed
                    ? "bg-success-soft text-success-soft-foreground"
                    : "bg-default-soft text-muted"
                }`}
              >
                {progress.flashCards.completed ? (
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                )}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {progress.flashCards.completed
                    ? en
                      ? "Deck finished"
                      : "Mazo terminado"
                    : en
                      ? "Not finished yet"
                      : "Todavía sin terminar"}
                </p>
                <p className="text-sm text-muted">
                  {progress.flashCards.completed
                    ? en
                      ? "The student finished the deck."
                      : "El estudiante terminó de ver el mazo."
                    : en
                      ? "The student hasn't finished the deck yet."
                      : "El estudiante todavía no termina de ver el mazo."}
                </p>
              </div>
            </div>
          )}

          {currentTab.id === "speaking" && (
            <TeacherSpeakingAttempts
              studentId={studentId}
              protectedAreaId={progress.protectedAreaId}
            />
          )}

          {currentTab.id === "chatbot" && (
            <TeacherChatbotConversations
              studentId={studentId}
              protectedAreaId={progress.protectedAreaId}
            />
          )}

          {currentTab.id === "test" && (
            <TeacherTestAttempts
              studentId={studentId}
              protectedAreaId={progress.protectedAreaId}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
