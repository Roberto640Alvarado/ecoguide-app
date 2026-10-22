"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "@heroui/react";
import { ArrowLeft, Loader2, Mic, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useSpeakingPracticeByArea } from "@/features/speaking-practices/hooks/use-speaking-practice-by-area";
import {
  richTextDisplayClassName,
  sanitizeRichText,
} from "@/lib/utils/rich-text";
import { CallScreen } from "@/features/speaking-results/components/call-screen";
import { unlockAudio } from "@/features/speaking-results/utils/audio-unlock";
import { CallSummary } from "@/features/speaking-results/components/call-summary";
import { CallBackdrop } from "@/features/speaking-results/components/call-backdrop";
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
    // Debe ir antes de cualquier await: desbloquea el audio dentro del clic
    // para que la primera respuesta de EcoGuía pueda sonar al llegar.
    unlockAudio();
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
        // Durante la llamada, en móvil se oculta el título para que la
        // llamada ocupe toda la pantalla.
        className={cn("items-center gap-3", activeCall ? "hidden sm:flex" : "flex")}
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
          <Loader2 className="size-6 animate-spin text-muted" aria-hidden="true" />
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
          {!activeCall && !finishedCall && (
            <div className="relative isolate flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-border bg-background px-6 py-10 text-center text-foreground sm:px-10 sm:py-14">
              <CallBackdrop />

              <div className="relative">
                <Image
                  src="/eco-avatar.png"
                  alt="EcoGuía"
                  width={128}
                  height={128}
                  className="size-28 rounded-full border-4 border-surface bg-accent-soft object-cover object-top shadow-2xl sm:size-32"
                  priority
                />
                <span className="absolute bottom-1.5 right-1.5 size-5 rounded-full border-[3px] border-background bg-success" />
              </div>

              <div className="flex max-w-xl flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  {en ? "EcoGuía is available" : "EcoGuía está disponible"}
                </p>
                <h2 className="text-xl font-semibold sm:text-2xl">
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
                    ? "EcoGuía will speak first — answer with your microphone when it's your turn."
                    : "EcoGuía hablará primero — responde con tu micrófono cuando sea tu turno."}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <motion.button
                  type="button"
                  onClick={handleStartCall}
                  disabled={startCall.isPending}
                  whileTap={{ scale: 0.92 }}
                  aria-label={en ? "Start call" : "Iniciar llamada"}
                  className="relative isolate flex size-20 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/40 transition-colors hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:opacity-60"
                >
                  {!startCall.isPending && (
                    <span
                      className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent opacity-40 motion-reduce:hidden"
                      aria-hidden="true"
                    />
                  )}
                  {startCall.isPending ? (
                    <Loader2 className="size-8 animate-spin" aria-hidden="true" />
                  ) : (
                    <Phone className="size-8 fill-current" aria-hidden="true" />
                  )}
                </motion.button>
                <span className="text-sm font-medium text-muted">
                  {startCall.isPending
                    ? en
                      ? "Calling..."
                      : "Llamando..."
                    : en
                      ? "Start call"
                      : "Iniciar llamada"}
                </span>
              </div>
            </div>
          )}

          {activeCall && (
            <CallScreen
              result={activeCall}
              areaName={area.name}
              // Móvil: pantalla completa de borde a borde (como una llamada
              // real). Escritorio: tarjeta con el alto disponible.
              className="-mx-4 h-[calc(100dvh-8rem)] min-h-[34rem] sm:mx-0 sm:h-[calc(100dvh-14rem)] sm:min-h-[36rem] sm:rounded-3xl lg:max-h-[56rem]"
              onUpdated={setActiveCall}
              onEnded={(result) => {
                setActiveCall(null);
                setFinishedCall(result);
              }}
            />
          )}

          {finishedCall && (
            <CallSummary
              result={finishedCall}
              onCallAgain={handleStartCall}
              isCallingAgain={startCall.isPending}
              tourHref={`/student/protected-areas/${params.id}/tour`}
              className="-mx-4 sm:mx-0 sm:rounded-3xl"
            />
          )}

          {!activeCall && <SpeakingHistoryList protectedAreaId={params.id} />}
        </motion.div>
      )}
    </div>
  );
}
