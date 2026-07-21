"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/react";
import { ArrowLeft, Mic } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useSpeakingPracticeByArea } from "@/features/speaking-practices/hooks/use-speaking-practice-by-area";
import {
  richTextDisplayClassName,
  sanitizeRichText,
} from "@/lib/utils/rich-text";
import { SpeakingRecorder } from "@/features/speaking-results/components/speaking-recorder";
import { SpeakingFeedbackCard } from "@/features/speaking-results/components/speaking-feedback-card";
import { SpeakingHistoryList } from "@/features/speaking-results/components/speaking-history-list";
import { SpeakingIntroPlayer } from "@/features/speaking-results/components/speaking-intro-player";
import type { SpeakingResult } from "@/features/speaking-results/types/speaking-result.types";

export default function StudentSpeakingPracticePage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const { data: area, isLoading: isLoadingArea } = useProtectedArea(params.id);
  const { data: practice, isLoading: isLoadingPractice } =
    useSpeakingPracticeByArea(params.id);

  const [latestResult, setLatestResult] = useState<SpeakingResult | null>(
    null,
  );

  const isLoading = isLoadingArea || isLoadingPractice;

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
          <Mic className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === "en" ? "Speaking practice" : "Práctica de speaking"}
          </h1>
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
      ) : !practice || !practice.isActive ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-secondary/40 p-6 text-center text-sm text-muted">
          {language === "en"
            ? "This area doesn't have a speaking practice yet. Check back soon!"
            : "Esta área todavía no tiene una práctica de speaking. ¡Vuelve pronto!"}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div>
              <h2 className="font-semibold text-foreground">
                {practice.title}
              </h2>
              <div
                className={`mt-2 text-sm leading-relaxed text-muted ${richTextDisplayClassName}`}
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichText(practice.instructions),
                }}
              />
            </div>
            <SpeakingIntroPlayer
              title={practice.title}
              instructionsHtml={practice.instructions}
            />
          </div>

          {latestResult ? (
            <div className="flex flex-col gap-4">
              <SpeakingFeedbackCard result={latestResult} />
              <button
                type="button"
                onClick={() => setLatestResult(null)}
                className="self-center text-sm font-medium text-accent hover:underline"
              >
                {language === "en" ? "Try again" : "Intentar de nuevo"}
              </button>
            </div>
          ) : (
            <SpeakingRecorder
              protectedAreaId={params.id}
              onSubmitted={setLatestResult}
            />
          )}

          <SpeakingHistoryList protectedAreaId={params.id} />
        </motion.div>
      )}
    </div>
  );
}
