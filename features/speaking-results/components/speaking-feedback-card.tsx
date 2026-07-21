"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Volume2, VolumeX } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useSpeechSynthesis } from "../hooks/use-speech-synthesis";
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
 * Retroalimentación de IA en texto y en voz (TTS): se lee en voz alta
 * automáticamente apenas llega (continuación directa del gesto del
 * estudiante al enviar su respuesta) y siempre queda el botón para repetirla.
 */
export function SpeakingFeedbackCard({ result }: SpeakingFeedbackCardProps) {
  const language = useLanguageStore((state) => state.language);
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const hasAutoSpokenRef = useRef(false);

  useEffect(() => {
    if (!hasAutoSpokenRef.current) {
      hasAutoSpokenRef.current = true;
      speak(result.feedback);
    }

    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.id]);

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
            {language === "en" ? "AI feedback" : "Retroalimentación de IA"}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${scoreColorClass(result.score)}`}
        >
          {result.score}/10
        </span>
      </div>

      <p className="text-sm leading-relaxed text-foreground">
        {result.feedback}
      </p>

      <button
        type="button"
        onClick={() => (isSpeaking ? stop() : speak(result.feedback))}
        className="flex w-fit items-center gap-1.5 text-xs font-medium text-accent hover:underline"
      >
        {isSpeaking ? (
          <>
            <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
            {language === "en" ? "Stop" : "Detener"}
          </>
        ) : (
          <>
            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
            {language === "en" ? "Listen again" : "Escuchar de nuevo"}
          </>
        )}
      </button>

      <details className="text-xs text-muted">
        <summary className="cursor-pointer font-medium">
          {language === "en" ? "Your transcript" : "Tu transcripción"}
        </summary>
        <p className="mt-2 leading-relaxed">{result.transcription}</p>
      </details>
    </motion.div>
  );
}
