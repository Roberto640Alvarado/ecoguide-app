"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechSynthesisResult {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
}

/**
 * Envoltorio sobre la Web Speech Synthesis API (TTS del navegador, soportada
 * en Chrome/Edge/Safari/Firefox — a diferencia de SpeechRecognition, aquí no
 * hace falta gatear la UI por soporte). Se usa para que el "modelo" de la
 * práctica de speaking se presente en voz alta (instrucciones) y para leer
 * la retroalimentación de la IA, además de mostrarla como texto.
 */
export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !text.trim()
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => stop, [stop]);

  return { speak, stop, isSpeaking };
}
