"use client";

import { motion } from "framer-motion";
import { MessagesSquare, Sparkles } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useTranslatedText } from "@/features/translation/hooks/use-translated-texts";
import type { SpeakingResult } from "../types/speaking-result.types";

interface SpeakingFeedbackCardProps {
  result: SpeakingResult;
}

function scoreColorClass(score: number) {
  if (score >= 8) return "bg-success-soft text-success-soft-foreground";
  if (score >= 5) return "bg-warning-soft text-warning-soft-foreground";
  return "bg-danger-soft text-danger-soft-foreground";
}

/**
 * Resumen de la llamada ya finalizada: retroalimentación de IA en texto (sin
 * reproducir audio acá — solo se escucha durante la llamada en vivo) más la
 * conversación completa, siempre visible (no oculta detrás de un
 * desplegable), para que el estudiante pueda repasar sus turnos y los de la
 * IA.
 */
export function SpeakingFeedbackCard({ result }: SpeakingFeedbackCardProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const translatedFeedback = useTranslatedText(result.feedback ?? "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-4 rounded-2xl border border-accent/30 bg-accent-soft/30 p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="text-sm font-semibold text-foreground">
            {en ? "AI feedback" : "Retroalimentación de IA"}
          </h3>
        </div>
        {result.score !== null && (
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${scoreColorClass(result.score)}`}
          >
            {result.score}/10
          </span>
        )}
      </div>

      {result.feedback && (
        <p className="text-sm leading-relaxed text-foreground">
          {translatedFeedback}
        </p>
      )}

      <div className="flex flex-col gap-2 border-t border-accent/20 pt-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
          <MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" />
          {en ? "Conversation" : "Conversación"}
        </div>
        <ul className="flex flex-col gap-2 text-xs text-muted">
          {result.turns.map((turn) => (
            <li key={turn.id} className="leading-relaxed">
              <span className="font-semibold text-foreground">
                {turn.role === "assistant" ? "EcoGuía: " : en ? "You: " : "Tú: "}
              </span>
              {turn.message}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
