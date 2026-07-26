"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button, Spinner, toast } from "@heroui/react";
import { ArrowLeft, Mic, Phone } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useSpeakingPracticeByArea } from "@/features/speaking-practices/hooks/use-speaking-practice-by-area";
import {
  richTextDisplayClassName,
  sanitizeRichText,
} from "@/lib/utils/rich-text";
import { CallScreen } from "@/features/speaking-results/components/call-screen";
import { SpeakingFeedbackCard } from "@/features/speaking-results/components/speaking-feedback-card";
import { SpeakingHistoryList } from "@/features/speaking-results/components/speaking-history-list";
import { useStartSpeakingResult } from "@/features/speaking-results/hooks/use-start-speaking-result";
import type { SpeakingResult } from "@/features/speaking-results/types/speaking-result.types";

export default function StudentSpeakingPracticePage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const { data: area, isLoading: isLoadingArea } = useProtectedArea(params.id);
  const { data: practice, isLoading: isLoadingPractice } =
    useSpeakingPracticeByArea(params.id);
  const startCall = useStartSpeakingResult();

  const [activeCall, setActiveCall] = useState<SpeakingResult | null>(null);
  const [finishedCall, setFinishedCall] = useState<SpeakingResult | null>(
    null,
  );

  const isLoading = isLoadingArea || isLoadingPractice;

  async function handleStartCall() {
    setFinishedCall(null);

    try {
      const result = await startCall.mutateAsync(params.id);
      setActiveCall(result);
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : en
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
        {en ? "Back to tour" : "Volver al recorrido"}
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
            {en ? "Speaking practice" : "Práctica de speaking"}
          </h1>
          <p className="text-sm text-muted">
            {isLoadingArea
              ? en
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
          {en ? "Protected area not found." : "Área protegida no encontrada."}
        </p>
      ) : !practice || !practice.isActive ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-secondary/40 p-6 text-center text-sm text-muted">
          {en
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
          {!activeCall && (
            <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-3xl border border-border bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-accent-soft/50 via-surface to-surface px-6 py-10 text-center sm:px-10 sm:py-14">
              <div
                className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-accent-soft blur-3xl"
                aria-hidden="true"
              />

              <div className="relative">
                <div className="absolute inset-0 -z-10 rounded-full bg-accent-soft blur-2xl" />
                <Image
                  src="/eco-avatar.png"
                  alt="EcoGuía"
                  width={112}
                  height={112}
                  className="h-28 w-28 rounded-full border-4 border-surface object-cover object-top shadow-lg"
                  priority
                />
                <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-success">
                  <span className="h-2 w-2 rounded-full bg-success-foreground" />
                </span>
              </div>

              <div className="flex max-w-xl flex-col gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  {practice.title}
                </h2>
                <div
                  className={`text-sm leading-relaxed text-muted ${richTextDisplayClassName}`}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichText(practice.instructions),
                  }}
                />
                <p className="text-xs text-muted">
                  {en
                    ? "EcoGuía will call you and speak first — just answer with your microphone when it's your turn."
                    : "EcoGuía te llamará y hablará primero — solo responde con tu micrófono cuando sea tu turno."}
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                onPress={handleStartCall}
                isDisabled={startCall.isPending}
                className="mt-1"
              >
                {startCall.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {en ? "Start call" : "Iniciar llamada"}
                  </>
                )}
              </Button>
            </div>
          )}

          {activeCall && (
            <CallScreen
              result={activeCall}
              onUpdated={setActiveCall}
              onEnded={(result) => {
                setActiveCall(null);
                setFinishedCall(result);
              }}
            />
          )}

          {finishedCall && (
            <div className="flex flex-col gap-4">
              <SpeakingFeedbackCard result={finishedCall} />
              <button
                type="button"
                onClick={() => setFinishedCall(null)}
                className="self-center text-sm font-medium text-accent hover:underline"
              >
                {en ? "Done" : "Listo"}
              </button>
            </div>
          )}

          {!activeCall && <SpeakingHistoryList protectedAreaId={params.id} />}
        </motion.div>
      )}
    </div>
  );
}
