"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PronunciationLanguage } from "../types/flash-card.types";

const BROWSER_VOICE_LANG: Record<PronunciationLanguage, string> = {
  en: "en-US",
  es: "es-US",
};
// Un poco más lento que lo normal: es vocabulario para aprender.
const BROWSER_VOICE_RATE = 0.9;

interface PlayOptions {
  /** Identifica qué botón está sonando (ej. "3-en"). */
  key: string;
  language: PronunciationLanguage;
  text: string;
  audioUrl: string | null;
}

interface UsePronunciationPlayerResult {
  /** Key del audio que está sonando ahora mismo, o `null`. */
  playingKey: string | null;
  play: (options: PlayOptions) => void;
  stop: () => void;
}

/**
 * Reproduce pronunciaciones de vocabulario, una a la vez. Usa el MP3 que la
 * API generó con IA (no hay llamada a la IA en cada clic). Si la palabra
 * todavía no tiene audio, o el navegador no lo puede reproducir, usa la voz
 * del navegador (`speechSynthesis`) como respaldo para que el botón nunca
 * quede "muerto".
 */
export function usePronunciationPlayer(): UsePronunciationPlayerResult {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setPlayingKey(null);
  }, []);

  useEffect(() => stop, [stop]);

  const play = useCallback(
    ({ key, language, text, audioUrl }: PlayOptions) => {
      stop();
      setPlayingKey(key);

      const speakWithBrowser = () => {
        if (!("speechSynthesis" in window)) {
          setPlayingKey(null);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = BROWSER_VOICE_LANG[language];
        utterance.rate = BROWSER_VOICE_RATE;
        utterance.onend = () => setPlayingKey(null);
        utterance.onerror = () => setPlayingKey(null);
        window.speechSynthesis.speak(utterance);
      };

      if (!audioUrl) {
        speakWithBrowser();
        return;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        if (audioRef.current === audio) audioRef.current = null;
        setPlayingKey(null);
      };

      audio.play().catch(() => {
        // Solo cae al respaldo si este audio sigue siendo el actual (no se
        // detuvo ni se reemplazó por otro clic mientras cargaba).
        if (audioRef.current !== audio) return;
        audioRef.current = null;
        speakWithBrowser();
      });
    },
    [stop],
  );

  return { playingKey, play, stop };
}
