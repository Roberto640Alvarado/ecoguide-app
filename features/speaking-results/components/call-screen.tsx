"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Spinner, toast } from "@heroui/react";
import { Mic, PhoneOff, Square } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguageStore } from "@/store/language-store";
import { useCallRecorder } from "../hooks/use-call-recorder";
import { useSendSpeakingTurn } from "../hooks/use-send-speaking-turn";
import { useFinishSpeakingResult } from "../hooks/use-finish-speaking-result";
import { useSpeechAudio } from "../hooks/use-speech-audio";
import type { SpeakingResult } from "../types/speaking-result.types";

type CallUiPhase =
  | "assistant-speaking"
  | "waiting"
  | "recording"
  | "processing";

interface CallScreenProps {
  result: SpeakingResult;
  onUpdated: (result: SpeakingResult) => void;
  onEnded: (result: SpeakingResult) => void;
}

function errorMessage(error: unknown, fallback: string): string {
  return error && typeof error === "object" && "message" in error
    ? String((error as { message: unknown }).message)
    : fallback;
}

/**
 * Pantalla de la "llamada" de práctica de speaking, estilo Meet/Zoom: la IA
 * habla (voces neuronales generadas en el backend, ver useSpeechAudio /
 * EdgeTtsService) y luego el estudiante graba su turno con el botón de
 * micrófono; al soltar/detener, el audio se envía al backend para
 * transcribirse (Groq/Whisper) y generar la siguiente respuesta de la IA en
 * un solo round trip (ver useSendSpeakingTurn). El botón de colgar finaliza
 * la llamada y dispara la retroalimentación final.
 */
export function CallScreen({ result, onUpdated, onEnded }: CallScreenProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const { speak, stop: stopSpeaking, isSpeaking, isLoading: isSpeechLoading } =
    useSpeechAudio();
  const recorder = useCallRecorder();
  const sendTurn = useSendSpeakingTurn();
  const finishCall = useFinishSpeakingResult();

  const [phase, setPhase] = useState<CallUiPhase>("assistant-speaking");
  const spokenIdsRef = useRef<Set<string>>(new Set());
  // El audio se genera en el backend (round trip de red), así que hay una
  // ventana entre "empezamos a hablar" y "el audio realmente está sonando"
  // donde isSpeaking sigue en false — este ref evita que el efecto de abajo
  // interprete ese momento como "ya terminó de hablar".
  const hasStartedPlayingRef = useRef(false);

  const lastTurn = result.turns[result.turns.length - 1] ?? null;
  const lastAssistantTurn = [...result.turns]
    .reverse()
    .find((turn) => turn.role === "assistant");
  const lastUserTurn = [...result.turns]
    .reverse()
    .find((turn) => turn.role === "user");

  useEffect(() => {
    if (!lastTurn || lastTurn.role !== "assistant") {
      return;
    }

    if (spokenIdsRef.current.has(lastTurn.id)) {
      return;
    }

    spokenIdsRef.current.add(lastTurn.id);
    setPhase("assistant-speaking");
    hasStartedPlayingRef.current = false;
    void speak(lastTurn.message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTurn?.id]);

  useEffect(() => {
    if (isSpeaking) {
      hasStartedPlayingRef.current = true;
      return;
    }

    if (hasStartedPlayingRef.current && phase === "assistant-speaking") {
      hasStartedPlayingRef.current = false;
      // Sincroniza con el evento externo `onended` del audio (ver
      // useSpeechAudio) — no hay forma de derivarlo durante el render.
       
      setPhase("waiting");
    }
  }, [isSpeaking, phase]);

  useEffect(() => stopSpeaking, [stopSpeaking]);

  const isMicDisabled =
    phase === "assistant-speaking" ||
    phase === "processing" ||
    finishCall.isPending;

  async function handleMicPress() {
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

    if (phase === "recording") {
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
        const updated = await sendTurn.mutateAsync({
          id: result.id,
          audioBlob: blob,
        });
        onUpdated(updated);
      } catch (error) {
        toast.danger(
          errorMessage(
            error,
            en ? "Something went wrong." : "Algo salió mal.",
          ),
        );
        setPhase("waiting");
      }
    }
  }

  async function handleHangUp() {
    stopSpeaking();

    try {
      const updated = await finishCall.mutateAsync(result.id);
      onEnded(updated);
    } catch (error) {
      toast.danger(
        errorMessage(error, en ? "Something went wrong." : "Algo salió mal."),
      );
    }
  }

  const statusLabel =
    phase === "assistant-speaking" && isSpeechLoading
      ? en
        ? "Getting ready to speak..."
        : "Preparando el audio..."
      : {
          "assistant-speaking": en ? "Speaking..." : "Hablando...",
          waiting: en ? "Tap the mic to speak" : "Toca el micrófono para hablar",
          recording: en
            ? "Listening... tap to stop"
            : "Escuchando... toca para detener",
          processing: en ? "Thinking..." : "Pensando...",
        }[phase];

  return (
    <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl border border-border bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-surface-secondary/60 via-surface to-surface px-6 py-10 sm:py-14">
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-soft/70 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-4">
        <motion.div
          animate={
            phase === "assistant-speaking"
              ? { scale: [1, 1.05, 1] }
              : { scale: 1 }
          }
          transition={{
            duration: 1.1,
            repeat: phase === "assistant-speaking" ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="relative flex h-32 w-32 items-center justify-center"
        >
          {phase === "assistant-speaking" && (
            <>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/30" />
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-accent/20"
                style={{ animationDelay: "0.4s" }}
              />
            </>
          )}
          <div className="absolute inset-1 -z-10 rounded-full bg-accent-soft blur-xl" />
          <Image
            src="/eco-avatar.png"
            alt="EcoGuía"
            width={128}
            height={128}
            className="relative h-32 w-32 rounded-full border-4 border-surface object-cover object-top shadow-lg"
            priority
          />
          {(phase === "waiting" || phase === "recording") && (
            <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-success">
              <span className="h-2 w-2 rounded-full bg-success-foreground" />
            </span>
          )}
        </motion.div>

        <div className="text-center">
          <p className="font-semibold text-foreground">EcoGuía</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-muted"
            >
              {statusLabel}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex w-full max-w-md flex-col gap-2 rounded-2xl bg-layer/70 px-4 py-3 text-center">
        {lastAssistantTurn && (
          <p className="text-sm leading-relaxed text-foreground">
            {lastAssistantTurn.message}
          </p>
        )}
        {lastUserTurn && phase !== "recording" && (
          <p className="text-xs italic leading-relaxed text-muted">
            {en ? "You: " : "Tú: "}
            {lastUserTurn.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6">
        <ConfirmDialog
          trigger={
            <Button
              variant="danger"
              size="lg"
              isDisabled={finishCall.isPending}
              className="rounded-full"
              aria-label={en ? "Hang up" : "Colgar"}
            >
              {finishCall.isPending ? (
                <Spinner size="sm" />
              ) : (
                <PhoneOff className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          }
          title={en ? "Finish this call?" : "¿Finalizar esta llamada?"}
          description={
            en
              ? "You'll get feedback and a score based on this conversation. You won't be able to add more turns afterward."
              : "Recibirás retroalimentación y una calificación basada en esta conversación. Después no podrás agregar más turnos."
          }
          confirmLabel={en ? "Hang up" : "Colgar"}
          isLoading={finishCall.isPending}
          onConfirm={handleHangUp}
        />

        <button
          type="button"
          onClick={handleMicPress}
          disabled={isMicDisabled}
          aria-label={
            phase === "recording"
              ? en
                ? "Stop recording"
                : "Detener grabación"
              : en
                ? "Start recording"
                : "Empezar a grabar"
          }
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {phase === "recording" && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger/50" />
          )}
          <span
            className={`relative flex h-20 w-20 items-center justify-center rounded-full ${
              phase === "recording" ? "bg-danger" : "bg-primary"
            }`}
          >
            {phase === "processing" ? (
              <Spinner size="md" />
            ) : phase === "recording" ? (
              <Square className="h-7 w-7" aria-hidden="true" />
            ) : (
              <Mic className="h-7 w-7" aria-hidden="true" />
            )}
          </span>
        </button>
      </div>

      {recorder.error && (
        <p className="text-xs text-danger">{recorder.error}</p>
      )}
    </div>
  );
}
