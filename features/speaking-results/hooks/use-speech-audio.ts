"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiPostBinary } from "@/lib/api/client";

interface UseSpeechAudioResult {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
}

/**
 * Reproduce texto como audio real generado en el backend (voces neuronales
 * de Microsoft Edge, ver EdgeTtsService) en vez de `speechSynthesis` del
 * navegador — mucho más natural, pero depende de un protocolo no oficial de
 * Microsoft (ver comentario en EdgeTtsService); si esto llegara a fallar
 * seguido, el reemplazo más simple es volver a useSpeechSynthesis.
 */
export function useSpeechAudio(): UseSpeechAudioResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanupObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    cleanupObjectUrl();
    setIsSpeaking(false);
  }, [cleanupObjectUrl]);

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        return;
      }

      stop();
      setIsLoading(true);

      try {
        const buffer = await apiPostBinary("/speaking-results/tts", { text });
        const url = URL.createObjectURL(
          new Blob([buffer], { type: "audio/mpeg" }),
        );
        objectUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => stop();
        audio.onerror = () => stop();

        await audio.play();
      } catch {
        setIsSpeaking(false);
        cleanupObjectUrl();
      } finally {
        setIsLoading(false);
      }
    },
    [stop, cleanupObjectUrl],
  );

  useEffect(() => stop, [stop]);

  return { speak, stop, isSpeaking, isLoading };
}
