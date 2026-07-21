"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Spinner, toast } from "@heroui/react";
import { Mic, RotateCcw, Send, Square } from "lucide-react";
import { TextareaField } from "@/components/ui/textarea-field";
import { useLanguageStore } from "@/store/language-store";
import { useSpeechRecorder } from "../hooks/use-speech-recorder";
import { useUploadSpeakingAudio } from "../hooks/use-upload-speaking-audio";
import { useCreateSpeakingResult } from "../hooks/use-create-speaking-result";
import type { SpeakingResult } from "../types/speaking-result.types";

interface SpeakingRecorderProps {
  protectedAreaId: string;
  onSubmitted: (result: SpeakingResult) => void;
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

/**
 * Graba la respuesta del estudiante (MediaRecorder + Web Speech API para la
 * transcripción en vivo), deja revisar/corregir la transcripción antes de
 * enviar, sube el audio a Cloudinary y crea el SpeakingResult — la API se
 * encarga de llamar a la IA con el prompt del docente y devolver
 * retroalimentación + calificación.
 */
export function SpeakingRecorder({
  protectedAreaId,
  onSubmitted,
}: SpeakingRecorderProps) {
  const language = useLanguageStore((state) => state.language);
  const recorder = useSpeechRecorder();
  const uploadAudio = useUploadSpeakingAudio();
  const createResult = useCreateSpeakingResult();

  const [editedTranscript, setEditedTranscript] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Precarga el textarea editable con la transcripción final apenas se
    // detiene la grabación, para que el estudiante pueda corregirla.
    if (recorder.status === "stopped") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditedTranscript(recorder.transcript);
    }
  }, [recorder.status, recorder.transcript]);

  useEffect(() => {
    if (recorder.status !== "recording") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [recorder.status]);

  const audioPreviewUrl = useMemo(
    () => (recorder.audioBlob ? URL.createObjectURL(recorder.audioBlob) : null),
    [recorder.audioBlob],
  );

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  const isSubmitting = uploadAudio.isPending || createResult.isPending;

  async function handleSubmit() {
    if (!recorder.audioBlob) {
      return;
    }

    if (!editedTranscript.trim()) {
      toast.danger(
        language === "en"
          ? "The transcript can't be empty."
          : "La transcripción no puede estar vacía.",
      );
      return;
    }

    try {
      const { url } = await uploadAudio.mutateAsync(recorder.audioBlob);
      const result = await createResult.mutateAsync({
        protectedAreaId,
        audioUrl: url,
        transcription: editedTranscript.trim(),
      });

      onSubmitted(result);
      recorder.reset();
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : language === "en"
            ? "Something went wrong."
            : "Algo salió mal.";

      toast.danger(message);
    }
  }

  if (recorder.status === "unsupported") {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-secondary/40 p-5 text-sm text-muted">
        {language === "en"
          ? "Your browser doesn't support speech recognition. Try Chrome or Edge on desktop or Android."
          : "Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge en escritorio o Android."}
      </div>
    );
  }

  if (recorder.status === "idle") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent-soft-foreground">
          <Mic className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-semibold text-foreground">
            {language === "en" ? "Ready to record?" : "¿Listo para grabar?"}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {language === "en"
              ? "Speak in English about the topic above. Take your time."
              : "Habla en inglés sobre el tema de arriba. Tómate tu tiempo."}
          </p>
        </div>
        <Button variant="primary" size="lg" onPress={() => recorder.start()}>
          <Mic className="h-4 w-4" aria-hidden="true" />
          {language === "en" ? "Start recording" : "Empezar a grabar"}
        </Button>
        {recorder.error && (
          <p className="text-xs text-danger">{recorder.error}</p>
        )}
      </div>
    );
  }

  if (recorder.status === "recording") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-danger/30 bg-danger-soft/40 p-8 text-center">
        <span className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger/40" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-danger text-white">
            <Mic className="h-7 w-7" aria-hidden="true" />
          </span>
        </span>
        <p className="text-sm font-medium text-foreground">
          {language === "en" ? "Recording..." : "Grabando..."}{" "}
          {formatElapsed(elapsedSeconds)}
        </p>
        <div className="min-h-12 max-w-md rounded-xl bg-surface px-4 py-3 text-sm text-muted">
          {recorder.transcript ||
            (language === "en" ? "Listening..." : "Escuchando...")}
        </div>
        <Button variant="danger" onPress={recorder.stop}>
          <Square className="h-4 w-4" aria-hidden="true" />
          {language === "en" ? "Stop" : "Detener"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {language === "en" ? "Review your answer" : "Revisa tu respuesta"}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {language === "en"
            ? "Fix the transcript if something was misheard, then submit."
            : "Corrige la transcripción si algo se transcribió mal y luego envía."}
        </p>
      </div>

      {audioPreviewUrl && (
         
        <audio controls src={audioPreviewUrl} className="w-full" />
      )}

      <TextareaField
        label={language === "en" ? "Transcript" : "Transcripción"}
        value={editedTranscript}
        onChange={(e) => setEditedTranscript(e.target.value)}
        rows={4}
      />

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          onPress={recorder.reset}
          isDisabled={isSubmitting}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {language === "en" ? "Record again" : "Grabar de nuevo"}
        </Button>
        <Button
          variant="primary"
          onPress={handleSubmit}
          isDisabled={isSubmitting}
        >
          {isSubmitting ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              {language === "en" ? "Submit" : "Enviar"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
