"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { PhoneOff } from "lucide-react";
import { SessionCompleteActions } from "@/components/ui/session-complete-actions";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language-store";
import { formatDuration } from "../utils/format-duration";
import { CallBackdrop } from "./call-backdrop";
import { SpeakingFeedbackCard } from "./speaking-feedback-card";
import type { SpeakingResult } from "../types/speaking-result.types";

interface CallSummaryProps {
  result: SpeakingResult;
  onCallAgain: () => void;
  isCallingAgain: boolean;
  tourHref: string;
  className?: string;
}

/**
 * Pantalla de "llamada finalizada": duración, retroalimentación y
 * calificación de la IA, y las acciones para seguir practicando o volver al
 * recorrido. En móvil va de borde a borde con las acciones fijas abajo,
 * como el cierre de una llamada/chat en una app de mensajería.
 */
export function CallSummary({
  result,
  onCallAgain,
  isCallingAgain,
  tourHref,
  className,
}: CallSummaryProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const reduceMotion = useReducedMotion();

  const durationSeconds = result.endedAt
    ? (new Date(result.endedAt).getTime() - new Date(result.startedAt).getTime()) / 1000
    : 0;

  return (
    <section
      aria-label={en ? "Call finished" : "Llamada finalizada"}
      // overflow-clip (no hidden) para que las acciones `sticky` funcionen.
      className={cn(
        "relative isolate flex flex-col overflow-clip border-border bg-background sm:border",
        className,
      )}
    >
      <CallBackdrop />

      <div className="flex flex-col items-center gap-6 px-5 pt-10 pb-6 sm:px-10">
        <motion.div
          initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative"
        >
          <Image
            src="/eco-avatar.png"
            alt="EcoGuía"
            width={112}
            height={112}
            className="size-24 rounded-full border-4 border-surface bg-accent-soft object-cover object-top shadow-xl sm:size-28"
          />
          <span className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-4 border-background bg-danger text-white">
            <PhoneOff className="size-4" aria-hidden="true" />
          </span>
        </motion.div>

        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            {en ? "Call ended" : "Llamada finalizada"}
          </h2>
          <p className="text-sm text-muted">
            EcoGuía · <span className="tabular-nums">{formatDuration(durationSeconds)}</span>
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <SpeakingFeedbackCard result={result} />
        </div>
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-border bg-background/85 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:px-10 sm:pb-10 sm:backdrop-blur-none">
        <SessionCompleteActions
          onContinuePracticing={onCallAgain}
          isContinuing={isCallingAgain}
          tourHref={tourHref}
          className="mx-auto max-w-2xl"
        />
      </div>
    </section>
  );
}
