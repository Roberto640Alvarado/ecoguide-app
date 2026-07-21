"use client";

import { Button } from "@heroui/react";
import { Volume2, VolumeX } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { stripHtmlToText } from "@/lib/utils/rich-text";
import { useSpeechSynthesis } from "../hooks/use-speech-synthesis";

interface SpeakingIntroPlayerProps {
  title: string;
  instructionsHtml: string;
}

/**
 * El "modelo" se presenta en voz (TTS del navegador) leyendo el título y las
 * indicaciones del docente, antes de que el estudiante grabe su respuesta —
 * como si el guía le preguntara algo directamente.
 */
export function SpeakingIntroPlayer({
  title,
  instructionsHtml,
}: SpeakingIntroPlayerProps) {
  const language = useLanguageStore((state) => state.language);
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const introText = `${title}. ${stripHtmlToText(instructionsHtml)}`;

  return (
    <Button
      variant="outline"
      onPress={() => (isSpeaking ? stop() : speak(introText))}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="h-4 w-4" aria-hidden="true" />
          {language === "en" ? "Stop" : "Detener"}
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          {language === "en" ? "Listen to your guide" : "Escuchar a tu guía"}
        </>
      )}
    </Button>
  );
}
