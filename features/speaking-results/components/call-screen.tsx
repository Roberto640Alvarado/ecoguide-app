"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { toast } from "@heroui/react";
import { Loader2, Mic, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language-store";
import { useCallRecorder } from "../hooks/use-call-recorder";
import { useSendSpeakingTurn } from "../hooks/use-send-speaking-turn";
import { useFinishSpeakingResult } from "../hooks/use-finish-speaking-result";
import { useSpeechAudio } from "../hooks/use-speech-audio";
import { useAudioLevel } from "../hooks/use-audio-level";
import { unlockAudio } from "../utils/audio-unlock";
import { CallTimer } from "./call-timer";
import { CallVoiceWave } from "./call-voice-wave";
import { CallControlButton } from "./call-control-button";
import { HangUpDialog } from "./hang-up-dialog";
import { CallBackdrop } from "./call-backdrop";
import type { SpeakingResult } from "../types/speaking-result.types";

type CallUiPhase = "assistant-speaking" | "waiting" | "recording" | "processing";

interface CallScreenProps {
  result: SpeakingResult;
  /** Nombre del área protegida, se muestra en la barra superior. */
  areaName: string;
  onUpdated: (result: SpeakingResult) => void;
  onEnded: (result: SpeakingResult) => void;
  className?: string;
}

const RING_DELAYS_S = [0, 0.6, 1.2];

function errorMessage(error: unknown, fallback: string): string {
  return error && typeof error === "object" && "message" in error
    ? String((error as { message: unknown }).message)
    : fallback;
}

/**
 * Pantalla de la "llamada" de práctica de speaking, con la estética de una
 * videollamada real (FaceTime/WhatsApp): fondo oscuro con el avatar
 * desenfocado, duración de la llamada, subtítulos de lo que dice EcoGuía,
 * ondas de voz (el volumen real del micrófono mientras el estudiante habla)
 * y barra de controles circulares.
 *
 * Flujo: EcoGuía habla (voz de OpenAI generada en el backend, ver
 * useSpeechAudio) → el estudiante graba su turno con el micrófono → el
 * audio se transcribe y la IA responde en un solo round trip (ver
 * useSendSpeakingTurn). Colgar finaliza la llamada y genera la
 * retroalimentación.
 */
export function CallScreen({
  result,
  areaName,
  onUpdated,
  onEnded,
  className,
}: CallScreenProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const reduceMotion = useReducedMotion();
  const { speak, stop: stopSpeaking, isLoading: isSpeechLoading } =
    useSpeechAudio();
  const recorder = useCallRecorder();
  const sendTurn = useSendSpeakingTurn();
  const finishCall = useFinishSpeakingResult();
  const micLevel = useAudioLevel(recorder.inputAnalyser);
  const micRingScale = useTransform(micLevel, (level) => 1 + level * 0.35);

  const [phase, setPhase] = useState<CallUiPhase>("assistant-speaking");
  const spokenIdsRef = useRef<Set<string>>(new Set());

  const lastTurn = result.turns[result.turns.length - 1] ?? null;
  const lastAssistantTurn = [...result.turns]
    .reverse()
    .find((turn) => turn.role === "assistant");
  const lastUserTurn = [...result.turns]
    .reverse()
    .find((turn) => turn.role === "user");

  /**
   * Reproduce un turno de la IA y SIEMPRE devuelve el control al estudiante
   * al terminar, aunque el audio haya fallado (si no, la llamada quedaba
   * trabada en "Hablando…" con el micrófono deshabilitado).
   */
  async function playAssistantTurn(message: string) {
    setPhase("assistant-speaking");
    const playback = await speak(message);

    if (playback === "stopped") {
      return;
    }

    if (playback === "failed") {
      toast.danger(
        en
          ? "We couldn't play EcoGuía's voice. Read the message and tap the mic to answer."
          : "No se pudo reproducir la voz de EcoGuía. Lee el mensaje y toca el micrófono para responder.",
      );
    }

    setPhase((current) => (current === "assistant-speaking" ? "waiting" : current));
  }

  useEffect(() => {
    if (!lastTurn || lastTurn.role !== "assistant") {
      return;
    }

    if (spokenIdsRef.current.has(lastTurn.id)) {
      return;
    }

    const turnId = lastTurn.id;
    const spokenIds = spokenIdsRef.current;
    spokenIds.add(turnId);
    void playAssistantTurn(lastTurn.message);

    // En desarrollo, StrictMode desmonta y vuelve a montar el componente:
    // el desmontaje detiene la voz (ver useSpeechAudio), así que se
    // desmarca el turno para que el nuevo montaje lo vuelva a reproducir.
    return () => {
      spokenIds.delete(turnId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTurn?.id]);

  useEffect(() => stopSpeaking, [stopSpeaking]);

  async function handleMicPress() {
    // Gesto del usuario: mantiene desbloqueado el audio para la respuesta
    // que llegará después de procesar este turno (ver unlockAudio).
    unlockAudio();

    if (phase === "waiting") {
      await recorder.start();

      if (recorder.status === "unsupported") {
        toast.danger(
          en
            ? "Your browser doesn't support audio recording."
            : "Tu navegador no soporta grabación de audio.",
        );
        return;
      }

      setPhase("recording");
      return;
    }

    if (phase !== "recording") {
      return;
    }

    const blob = await recorder.stop();
    setPhase("processing");

    if (!blob) {
      toast.danger(
        en ? "No audio recorded. Try again." : "No se grabó audio. Intenta de nuevo.",
      );
      setPhase("waiting");
      return;
    }

    try {
      const updated = await sendTurn.mutateAsync({ id: result.id, audioBlob: blob });
      onUpdated(updated);
    } catch (error) {
      toast.danger(errorMessage(error, en ? "Something went wrong." : "Algo salió mal."));
      setPhase("waiting");
    }
  }

  function handleListenAgain() {
    if (!lastAssistantTurn) {
      return;
    }

    unlockAudio();
    void playAssistantTurn(lastAssistantTurn.message);
  }

  async function handleHangUp() {
    stopSpeaking();

    try {
      const updated = await finishCall.mutateAsync(result.id);
      onEnded(updated);
    } catch (error) {
      toast.danger(errorMessage(error, en ? "Something went wrong." : "Algo salió mal."));
      // La voz se detuvo al colgar: si colgar falla, se devuelve el turno al
      // estudiante en vez de dejar la llamada en "Hablando…".
      setPhase((current) => (current === "assistant-speaking" ? "waiting" : current));
    }
  }

  const statusLabel =
    phase === "assistant-speaking" && isSpeechLoading
      ? en
        ? "Connecting audio..."
        : "Conectando audio..."
      : {
          "assistant-speaking": en ? "Speaking..." : "Hablando...",
          waiting: en ? "Your turn — tap the mic" : "Tu turno — toca el micrófono",
          recording: en ? "Listening... tap to send" : "Escuchando... toca para enviar",
          processing: en ? "Thinking..." : "Pensando...",
        }[phase];

  const isAssistantSpeaking = phase === "assistant-speaking" && !isSpeechLoading;
  const isMicDisabled =
    phase === "assistant-speaking" || phase === "processing" || finishCall.isPending;

  const micLabel =
    phase === "recording" ? (en ? "Send" : "Enviar") : en ? "Speak" : "Hablar";

  return (
    <section
      aria-label={en ? "Call with EcoGuía" : "Llamada con EcoGuía"}
      className={cn(
        "relative isolate flex flex-col overflow-hidden border-border bg-background text-foreground sm:border",
        className,
      )}
    >
      <CallBackdrop />

      {/* Barra superior: estado de la llamada + duración. */}
      <header className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-8 sm:pt-6">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted">
            {en ? "Speaking practice" : "Práctica de speaking"}
          </p>
          <p className="truncate text-sm font-semibold">{areaName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-sm backdrop-blur-md">
          <span className="relative flex size-2">
            {!reduceMotion && (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            )}
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          <CallTimer startedAt={result.startedAt} />
        </div>
      </header>

      {/* Centro: contacto, estado y ondas de voz. */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-5 py-6 text-center">
        <div className="relative flex size-36 items-center justify-center sm:size-44">
          {isAssistantSpeaking &&
            !reduceMotion &&
            RING_DELAYS_S.map((delay) => (
              <motion.span
                key={delay}
                className="absolute inset-0 rounded-full border-2 border-accent/50"
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay }}
                aria-hidden="true"
              />
            ))}

          {phase === "recording" && (
            <motion.span
              className="absolute inset-0 rounded-full bg-accent/20"
              style={{ scale: micRingScale }}
              aria-hidden="true"
            />
          )}

          <motion.div
            animate={isAssistantSpeaking && !reduceMotion ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: 1.2, repeat: isAssistantSpeaking ? Infinity : 0, ease: "easeInOut" }}
            className="relative size-full"
          >
            <Image
              src="/eco-avatar.png"
              alt="EcoGuía"
              fill
              sizes="(min-width: 640px) 176px, 144px"
              className="rounded-full border-4 border-surface bg-accent-soft object-cover object-top shadow-2xl"
              priority
            />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-2xl font-semibold sm:text-3xl">EcoGuía</h2>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={statusLabel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-muted"
              aria-live="polite"
            >
              {statusLabel}
            </motion.p>
          </AnimatePresence>
        </div>

        <CallVoiceWave
          mode={
            phase === "recording" ? "user" : isAssistantSpeaking ? "assistant" : "idle"
          }
          level={micLevel}
        />
      </div>

      {/* Subtítulos de la conversación. */}
      <div className="px-4 sm:px-8">
        <AnimatePresence mode="wait">
          {lastAssistantTurn && (
            <motion.div
              key={lastAssistantTurn.id}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mx-auto flex max-h-36 w-full max-w-2xl flex-col gap-2 overflow-y-auto rounded-2xl border border-border bg-surface/75 px-4 py-3 text-center shadow-sm backdrop-blur-md sm:max-h-44 sm:px-6 sm:py-4"
            >
              <p className="text-sm leading-relaxed sm:text-base">
                {lastAssistantTurn.message}
              </p>
              {lastUserTurn && phase !== "recording" && (
                <p className="text-xs italic leading-relaxed text-muted">
                  {en ? "You: " : "Tú: "}
                  {lastUserTurn.message}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controles. */}
      <footer className="flex flex-col items-center gap-3 px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-8">
        <div className="flex items-end justify-center gap-8 sm:gap-12">
          <CallControlButton
            label={en ? "Listen" : "Escuchar"}
            disabled={phase !== "waiting" || !lastAssistantTurn}
            onClick={handleListenAgain}
            icon={<Volume2 className="size-6" aria-hidden="true" />}
          />

          <CallControlButton
              size="lg"
              isPulsing={phase === "recording"}
              tone={phase === "recording" ? "danger" : "primary"}
              label={micLabel}
              disabled={isMicDisabled}
              onClick={handleMicPress}
              aria-label={
                phase === "recording"
                  ? en
                    ? "Stop recording and send"
                    : "Detener grabación y enviar"
                  : en
                    ? "Start recording"
                    : "Empezar a grabar"
              }
              icon={
                phase === "processing" ? (
                  <Loader2 className="size-8 animate-spin" aria-hidden="true" />
                ) : phase === "recording" ? (
                  <Square className="size-7 fill-current" aria-hidden="true" />
                ) : (
                  <Mic className="size-8" aria-hidden="true" />
                )
              }
            />

          <HangUpDialog isLoading={finishCall.isPending} onConfirm={handleHangUp} />
        </div>

        {recorder.error && (
          <p className="max-w-sm text-center text-xs text-danger">{recorder.error}</p>
        )}
      </footer>
    </section>
  );
}
