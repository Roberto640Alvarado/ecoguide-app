"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiPostBinary } from "@/lib/api/client";
import { getAudioContext } from "../utils/audio-unlock";

/**
 * Cómo terminó la reproducción de un turno de la IA:
 * - "neural": se escuchó la voz neuronal generada en el backend.
 * - "browser": falló la voz neuronal y se usó `speechSynthesis` del navegador.
 * - "failed": no se pudo reproducir ningún audio (el texto sigue en pantalla).
 * - "stopped": se detuvo a propósito (ej. el estudiante colgó).
 */
export type SpeechPlayback = "neural" | "browser" | "failed" | "stopped";

interface UseSpeechAudioResult {
  /** Resuelve cuando el audio termina (o falla), nunca se queda colgada. */
  speak: (text: string) => Promise<SpeechPlayback>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
}

const BROWSER_VOICE_LANG = "en-US";
// Respaldo por si `speechSynthesis` nunca dispara `onend` (bug conocido de
// Chrome con textos largos): tiempo estimado de lectura + margen.
const BROWSER_WORDS_PER_SECOND = 2;
const BROWSER_SAFETY_MARGIN_MS = 4000;

/**
 * Reproduce texto como audio MP3 generado en el backend con la voz
 * neuronal de OpenAI (ver SpeechSynthesisService en ecoguide-api). Si la
 * petición falla o el navegador bloquea la reproducción, se usa
 * `speechSynthesis` del navegador como respaldo.
 *
 * `speak` siempre resuelve: la pantalla de llamada depende de eso para pasar
 * de "Hablando…" al turno del estudiante, aunque no haya sonado nada.
 */
export function useSpeechAudio(): UseSpeechAudioResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  // Termina la reproducción en curso (resuelve su promesa) al detenerla.
  const finishRef = useRef<(() => void) | null>(null);
  // Se incrementa en cada stop(): invalida una petición de TTS que siga en
  // vuelo para que no empiece a sonar después de colgar.
  const requestIdRef = useRef(0);

  const stop = useCallback(() => {
    requestIdRef.current += 1;
    finishRef.current?.();
    finishRef.current = null;

    if (sourceRef.current) {
      sourceRef.current.onended = null;

      try {
        sourceRef.current.stop();
      } catch {
        // Ya se había detenido.
      }

      sourceRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.onplaying = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  /**
   * Reproduce el MP3 con Web Audio sobre el AudioContext desbloqueado en el
   * clic del estudiante (ver unlockAudio). Resuelve `true` si sonó.
   */
  const playWithAudioContext = useCallback(
    async (buffer: ArrayBuffer): Promise<boolean> => {
      const context = getAudioContext();

      if (!context) {
        return false;
      }

      try {
        if (context.state !== "running") {
          await context.resume();
        }

        if (context.state !== "running") {
          return false;
        }

        // decodeAudioData "consume" el buffer: se pasa una copia para que
        // el respaldo con <audio> aún pueda usar el original.
        const audioBuffer = await context.decodeAudioData(buffer.slice(0));

        return await new Promise<boolean>((resolve) => {
          const source = context.createBufferSource();
          let isSettled = false;

          const finish = () => {
            if (isSettled) {
              return;
            }

            isSettled = true;

            if (finishRef.current === finish) {
              finishRef.current = null;
            }

            if (sourceRef.current === source) {
              sourceRef.current = null;
            }

            setIsSpeaking(false);
            resolve(true);
          };

          source.buffer = audioBuffer;
          source.connect(context.destination);
          source.onended = finish;
          sourceRef.current = source;
          finishRef.current = finish;
          source.start(0);
          setIsSpeaking(true);
        });
      } catch {
        return false;
      }
    },
    [],
  );

  /** Respaldo con <audio>. Resuelve `true` si el audio llegó a sonar. */
  const playWithAudioElement = useCallback(
    (buffer: ArrayBuffer) =>
      new Promise<boolean>((resolve) => {
        const url = URL.createObjectURL(
          new Blob([buffer], { type: "audio/mpeg" }),
        );
        const audio = new Audio(url);
        let hasStarted = false;
        let isSettled = false;

        objectUrlRef.current = url;
        audioRef.current = audio;

        const finish = () => {
          if (isSettled) {
            return;
          }

          isSettled = true;

          if (finishRef.current === finish) {
            finishRef.current = null;
          }

          if (audioRef.current === audio) {
            audioRef.current = null;
          }

          if (objectUrlRef.current === url) {
            URL.revokeObjectURL(url);
            objectUrlRef.current = null;
          }

          setIsSpeaking(false);
          resolve(hasStarted);
        };

        finishRef.current = finish;
        audio.onplaying = () => {
          hasStarted = true;
          setIsSpeaking(true);
        };
        audio.onended = finish;
        audio.onerror = finish;
        // play() se rechaza si el navegador bloquea la reproducción
        // automática (política de autoplay) o el MP3 está vacío/corrupto.
        audio.play().catch(finish);
      }),
    [],
  );

  /** Resuelve `true` si la voz del navegador llegó a hablar. */
  const speakWithBrowserVoice = useCallback(
    (text: string) =>
      new Promise<boolean>((resolve) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          resolve(false);
          return;
        }

        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        const englishVoice = synth
          .getVoices()
          .find((voice) => voice.lang.startsWith("en"));
        let hasStarted = false;
        let isSettled = false;
        utterance.lang = BROWSER_VOICE_LANG;

        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        const finish = () => {
          if (isSettled) {
            return;
          }

          isSettled = true;
          window.clearTimeout(safetyTimer);

          if (finishRef.current === finish) {
            finishRef.current = null;
          }

          setIsSpeaking(false);
          resolve(hasStarted);
        };

        const wordCount = text.trim().split(/\s+/).length;
        const safetyTimer = window.setTimeout(
          finish,
          (wordCount / BROWSER_WORDS_PER_SECOND) * 1000 + BROWSER_SAFETY_MARGIN_MS,
        );

        finishRef.current = finish;
        utterance.onstart = () => {
          hasStarted = true;
          setIsSpeaking(true);
        };
        utterance.onend = finish;
        utterance.onerror = finish;

        synth.cancel();
        synth.speak(utterance);
      }),
    [],
  );

  const speak = useCallback(
    async (text: string): Promise<SpeechPlayback> => {
      if (!text.trim()) {
        return "failed";
      }

      stop();
      const requestId = requestIdRef.current;
      setIsLoading(true);

      let buffer: ArrayBuffer | null = null;

      try {
        buffer = await apiPostBinary("/speaking-results/tts", { text });
      } catch {
        buffer = null;
      }

      if (requestId !== requestIdRef.current) {
        return "stopped";
      }

      setIsLoading(false);

      if (buffer && buffer.byteLength > 0) {
        const hasPlayed =
          (await playWithAudioContext(buffer)) ||
          (requestId === requestIdRef.current &&
            (await playWithAudioElement(buffer)));

        if (requestId !== requestIdRef.current) {
          return "stopped";
        }

        if (hasPlayed) {
          return "neural";
        }
      }

      const hasSpoken = await speakWithBrowserVoice(text);

      if (requestId !== requestIdRef.current) {
        return "stopped";
      }

      return hasSpoken ? "browser" : "failed";
    },
    [stop, playWithAudioContext, playWithAudioElement, speakWithBrowserVoice],
  );

  useEffect(() => stop, [stop]);

  return { speak, stop, isSpeaking, isLoading };
}
