"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CallRecorderStatus = "idle" | "recording" | "unsupported";

interface UseCallRecorderResult {
  status: CallRecorderStatus;
  error: string | null;
  /** Empieza a grabar el turno del estudiante. */
  start: () => Promise<void>;
  /** Detiene la grabación y resuelve con el audio grabado (o null si falló). */
  stop: () => Promise<Blob | null>;
}

/**
 * Graba el turno del estudiante (solo MediaRecorder, sin Web Speech API): la
 * transcripción ya no ocurre en el navegador, se hace en el backend vía
 * Groq/Whisper (ver GroqTranscriptionService), así que este hook no necesita
 * gatear la UI por soporte de SpeechRecognition — MediaRecorder +
 * getUserMedia están soportados en todos los navegadores modernos, incluido
 * Firefox (a diferencia del viejo useSpeechRecorder).
 */
export function useCallRecorder(): UseCallRecorderResult {
  const [status, setStatus] = useState<CallRecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof MediaRecorder !== "undefined";

    if (!supported) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unsupported");
    }
  }, []);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices) {
      setStatus("unsupported");
      return;
    }

    setError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorder.start();

      setStatus("recording");
    } catch {
      setError(
        "No se pudo acceder al micrófono. Revisa los permisos del navegador.",
      );
      cleanupStream();
    }
  }, [cleanupStream]);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        cleanupStream();
        setStatus("idle");
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        cleanupStream();
        setStatus("idle");
        resolve(chunksRef.current.length > 0 ? blob : null);
      };

      mediaRecorder.stop();
    });
  }, [cleanupStream]);

  useEffect(() => cleanupStream, [cleanupStream]);

  return { status, error, start, stop };
}
