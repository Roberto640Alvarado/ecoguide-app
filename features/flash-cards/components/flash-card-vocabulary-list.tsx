"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Headphones } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { usePronunciationPlayer } from "../hooks/use-pronunciation-player";
import { PronunciationButton } from "./pronunciation-button";
import type {
  PronunciationLanguage,
  VocabularyItem,
} from "../types/flash-card.types";

interface FlashCardVocabularyListProps {
  items: VocabularyItem[];
}

const LANGUAGE_TAG: Record<PronunciationLanguage, string> = {
  en: "EN",
  es: "ES",
};

const LISTEN_LABEL = {
  en: { en: "Listen in English", es: "Escuchar en inglés" },
  es: { en: "Listen in Spanish", es: "Escuchar en español" },
} as const;

/**
 * Vista del estudiante de una flashcard de vocabulario: cada palabra en
 * inglés (protagonista) y su traducción al español, con un botón para
 * escuchar cada pronunciación. Reproduce el MP3 guardado (generado con IA
 * por el docente); no hay llamada a la IA al dar clic.
 */
/**
 * Solo la tarjeta actual del mazo está montada: al pasar a otra, el player
 * se desmonta y corta el audio.
 */
export function FlashCardVocabularyList({ items }: FlashCardVocabularyListProps) {
  const language = useLanguageStore((state) => state.language);
  const reduceMotion = useReducedMotion();
  const { playingKey, play, stop } = usePronunciationPlayer();

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2 text-xs font-medium text-muted">
        <Headphones className="size-4 shrink-0" aria-hidden="true" />
        {language === "en"
          ? `${items.length} ${items.length === 1 ? "word" : "words"}. Tap the speaker to listen.`
          : `${items.length} ${items.length === 1 ? "palabra" : "palabras"}. Toca la bocina para escuchar.`}
      </p>

      <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <motion.li
            key={`${item.wordEn}-${index}`}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
              delay: reduceMotion ? 0 : 0.3 + index * 0.04,
            }}
            className="flex min-w-0 gap-3 rounded-2xl border border-border bg-background p-3 shadow-xs sm:p-4"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {(["en", "es"] as const).map((lang) => {
                const word = lang === "en" ? item.wordEn : item.wordEs;
                const audioUrl = lang === "en" ? item.audioEnUrl : item.audioEsUrl;
                const key = `${index}-${lang}`;
                const isPlaying = playingKey === key;

                return (
                  <div
                    key={lang}
                    className={`flex min-w-0 items-center gap-3 ${
                      lang === "es" ? "border-t border-border/70 pt-2" : ""
                    }`}
                  >
                    <PronunciationButton
                      size={lang === "en" ? "md" : "sm"}
                      tone={lang === "en" ? "primary" : "accent"}
                      isPlaying={isPlaying}
                      onClick={() =>
                        isPlaying
                          ? stop()
                          : play({ key, language: lang, text: word, audioUrl })
                      }
                      label={`${LISTEN_LABEL[lang][language]}: ${word}`}
                    />
                    <p
                      lang={lang}
                      className={`min-w-0 flex-1 break-words ${
                        lang === "en"
                          ? "text-base font-semibold text-foreground sm:text-lg"
                          : "text-sm text-muted sm:text-base"
                      }`}
                    >
                      {word}
                    </p>
                    <span className="shrink-0 rounded-md bg-default-soft px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-muted">
                      {LANGUAGE_TAG[lang]}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
