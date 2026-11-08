"use client";

import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/store/language-store";
import { useGeneratePronunciation } from "../hooks/use-generate-pronunciation";
import { PronunciationButton } from "./pronunciation-button";
import type { PronunciationLanguage } from "../types/flash-card.types";

interface VocabularyAudioControlProps {
  text: string;
  language: PronunciationLanguage;
  audioUrl: string | null;
  onAudioChange: (url: string) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
}

const LANGUAGE_NAME = {
  en: { en: "English", es: "inglés" },
  es: { en: "Spanish", es: "español" },
} as const;

/**
 * Controles del audio de una palabra en el formulario del docente:
 * - Sin audio: "Generar" (llama a la IA una vez y guarda la URL en el form).
 * - Con audio: escuchar + regenerar (por si la pronunciación no convence).
 * Si el docente cambia la palabra, el formulario descarta el audio anterior
 * y vuelve a aparecer "Generar".
 */
export function VocabularyAudioControl({
  text,
  language,
  audioUrl,
  onAudioChange,
  isPlaying,
  onPlay,
  onStop,
}: VocabularyAudioControlProps) {
  const uiLanguage = useLanguageStore((state) => state.language);
  const generate = useGeneratePronunciation();
  const languageName = LANGUAGE_NAME[language][uiLanguage];
  const hasText = text.trim().length > 0;

  function handleGenerate() {
    onStop();
    generate.mutate(
      { text, language },
      { onSuccess: ({ url }) => onAudioChange(url) },
    );
  }

  if (!audioUrl) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        disabled={!hasText || generate.isPending}
        aria-label={
          uiLanguage === "en"
            ? `Generate ${languageName} audio`
            : `Generar audio en ${languageName}`
        }
        className="h-9 shrink-0"
      >
        {generate.isPending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles aria-hidden="true" />
        )}
        <span className="hidden sm:inline">
          {uiLanguage === "en" ? "Generate" : "Generar"}
        </span>
      </Button>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      <PronunciationButton
        size="sm"
        tone={language === "en" ? "primary" : "accent"}
        isPlaying={isPlaying}
        onClick={isPlaying ? onStop : onPlay}
        label={
          uiLanguage === "en"
            ? `Listen in ${languageName}: ${text}`
            : `Escuchar en ${languageName}: ${text}`
        }
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleGenerate}
        disabled={generate.isPending}
        aria-label={
          uiLanguage === "en"
            ? `Regenerate ${languageName} audio`
            : `Regenerar audio en ${languageName}`
        }
        title={uiLanguage === "en" ? "Regenerate" : "Regenerar"}
        className="text-muted"
      >
        <RefreshCw
          className={generate.isPending ? "animate-spin" : undefined}
          aria-hidden="true"
        />
      </Button>
    </div>
  );
}
