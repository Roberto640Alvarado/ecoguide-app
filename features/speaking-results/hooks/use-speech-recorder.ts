"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechRecorderStatus =
  | "idle"
  | "recording"
  | "stopped"
  | "unsupported";

interface UseSpeechRecorderResult {
  status: SpeechRecorderStatus;
  transcript: string;
  audioBlob: Blob | null;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

/**
 * Graba audio (MediaRecorder) y transcribe en vivo (Web Speech API) al mismo
 * tiempo: el audio se sube tal cual a Cloudinary (SpeakingResult.audioUrl es
 * requerido en el schema) y la transcripción se manda como texto a la API
 * para que la IA la evalúe — así no hace falta un paso extra de
 * speech-to-text en el backend.
 *
 * El idioma de reconocimiento se fija en inglés (en-US) sin importar el
 * idioma de la interfaz: la práctica siempre es de speaking en inglés.
 */
export function useSpeechRecorder(): UseSpeechRecorderResult {
  const [status, setStatus] = useState<SpeechRecorderStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      !!(window.SpeechRecognition ?? window.webkitSpeechRecognition) &&
      !!navigator.mediaDevices;

    if (!supported) {
      // Detección de soporte del navegador (Web Speech API); solo se conoce
      // en el cliente, de ahí el useEffect en vez de un estado inicial.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unsupported");
    }
  }, []);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor || !navigator.mediaDevices) {
      setStatus("unsupported");
      return;
    }

    setError(null);
    setTranscript("");
    setAudioBlob(null);
    finalTranscriptRef.current = "";
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
      mediaRecorder.onstop = () => {
        setAudioBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
      };
      mediaRecorder.start();

      const recognition = new SpeechRecognitionCtor();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interim = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];

          if (result.isFinal) {
            finalTranscriptRef.current += `${result[0].transcript} `;
          } else {
            interim += result[0].transcript;
          }
        }

        setTranscript(`${finalTranscriptRef.current}${interim}`.trim());
      };
      recognition.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setError(
            "Necesitas dar permiso de micrófono para grabar tu respuesta.",
          );
        }
      };

      recognition.start();
      recognitionRef.current = recognition;

      setStatus("recording");
    } catch {
      setError(
        "No se pudo acceder al micrófono. Revisa los permisos del navegador.",
      );
      cleanupStream();
    }
  }, [cleanupStream]);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    cleanupStream();
    setStatus("stopped");
  }, [cleanupStream]);

  const reset = useCallback(() => {
    setStatus("idle");
    setTranscript("");
    setAudioBlob(null);
    setError(null);
  }, []);

  useEffect(() => cleanupStream, [cleanupStream]);

  return { status, transcript, audioBlob, error, start, stop, reset };
}
