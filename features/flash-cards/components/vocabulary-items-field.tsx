"use client";

import { useState } from "react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FileInput, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "@heroui/react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/store/language-store";
import { useGeneratePronunciation } from "../hooks/use-generate-pronunciation";
import { usePronunciationPlayer } from "../hooks/use-pronunciation-player";
import { parseVocabularyFromContent } from "../utils/parse-vocabulary-from-content";
import { VocabularyAudioControl } from "./vocabulary-audio-control";
import type { FlashCardFormValues } from "../schemas/flash-card.schema";
import {
  VOCABULARY_ITEMS_MAX,
  VOCABULARY_WORD_MAX_LENGTH,
  type PronunciationLanguage,
} from "../types/flash-card.types";

interface VocabularyItemsFieldProps {
  control: Control<FlashCardFormValues>;
  setValue: UseFormSetValue<FlashCardFormValues>;
  errors: FieldErrors<FlashCardFormValues>;
}

const EMPTY_ITEM = {
  wordEn: "",
  wordEs: "",
  audioEnUrl: null,
  audioEsUrl: null,
};

const inputClassName =
  "py-2 px-3 block w-full min-w-0 bg-layer border border-layer-line rounded-lg text-sm text-foreground placeholder:text-muted-foreground-1 focus:outline-hidden focus:border-primary-focus focus:ring-1 focus:ring-primary-focus aria-invalid:border-danger";

const AUDIO_FIELD = {
  en: "audioEnUrl",
  es: "audioEsUrl",
} as const;

/**
 * Editor de las palabras de una flashcard VOCABULARY: cada fila es un par
 * inglés/español con su audio. El docente puede generar, escuchar y
 * regenerar cada pronunciación antes de guardar; las que no genere se crean
 * automáticamente al guardar la flashcard.
 */
export function VocabularyItemsField({
  control,
  setValue,
  errors,
}: VocabularyItemsFieldProps) {
  const language = useLanguageStore((state) => state.language);
  const reduceMotion = useReducedMotion();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "vocabularyItems",
  });
  const items = useWatch({ control, name: "vocabularyItems" }) ?? [];
  const content = useWatch({ control, name: "content" }) ?? "";
  const player = usePronunciationPlayer();
  const generateAll = useGeneratePronunciation();
  const [generatingAll, setGeneratingAll] = useState<{
    done: number;
    total: number;
  } | null>(null);

  const missingAudios = items.flatMap((item, index) =>
    (["en", "es"] as const)
      .filter((lang) => {
        const word = lang === "en" ? item.wordEn : item.wordEs;
        return word.trim().length > 0 && !item[AUDIO_FIELD[lang]];
      })
      .map((lang) => ({ index, lang })),
  );
  const isFull = fields.length >= VOCABULARY_ITEMS_MAX;
  const importable =
    fields.length === 0 ? parseVocabularyFromContent(content) : null;
  const listError =
    errors.vocabularyItems?.message ?? errors.vocabularyItems?.root?.message;

  function handleWordChange(
    index: number,
    lang: PronunciationLanguage,
    value: string,
  ) {
    setValue(
      `vocabularyItems.${index}.${lang === "en" ? "wordEn" : "wordEs"}`,
      value,
      { shouldDirty: true, shouldValidate: !!errors.vocabularyItems },
    );

    // El audio ya no corresponde a la palabra: se descarta para que se
    // vuelva a generar (botón o al guardar).
    if (items[index]?.[AUDIO_FIELD[lang]]) {
      setValue(`vocabularyItems.${index}.${AUDIO_FIELD[lang]}`, null, {
        shouldDirty: true,
      });
    }
  }

  function handleRemove(index: number) {
    player.stop();
    remove(index);
  }

  function handleImport() {
    if (!importable) return;

    replace(importable.items);

    // Si el contenido era solo la lista, se vacía para no mostrarla dos
    // veces al estudiante.
    if (importable.isOnlyVocabulary) {
      setValue("content", "", { shouldDirty: true });
    }
  }

  async function handleGenerateAll() {
    player.stop();
    setGeneratingAll({ done: 0, total: missingAudios.length });
    let failed = 0;

    // Una a la vez: evita el rate limit de OpenAI y deja ver el progreso.
    for (const [position, { index, lang }] of missingAudios.entries()) {
      const item = items[index];
      try {
        const { url } = await generateAll.mutateAsync({
          text: lang === "en" ? item.wordEn : item.wordEs,
          language: lang,
        });
        setValue(`vocabularyItems.${index}.${AUDIO_FIELD[lang]}`, url, {
          shouldDirty: true,
        });
      } catch {
        failed += 1;
      }
      setGeneratingAll({ done: position + 1, total: missingAudios.length });
    }

    setGeneratingAll(null);

    if (failed === 0) {
      toast.success(
        language === "en"
          ? "Pronunciations generated."
          : "Pronunciaciones generadas.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {importable && importable.items.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-primary/50 bg-success-soft/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">
            {language === "en"
              ? `We found ${importable.items.length} words in the content. Import them as a list?`
              : `Encontramos ${importable.items.length} palabras en el contenido. ¿Las importamos a la lista?`}
          </p>
          <Button
            type="button"
            size="sm"
            onClick={handleImport}
            className="w-full sm:w-auto"
          >
            <FileInput aria-hidden="true" />
            {language === "en" ? "Import words" : "Importar palabras"}
          </Button>
        </div>
      )}

      {fields.length > 0 && (
        <div className="hidden grid-cols-[2rem_1fr_1fr_2.25rem] gap-3 px-1 text-xs font-medium uppercase tracking-wide text-muted lg:grid">
          <span>#</span>
          <span>{language === "en" ? "English" : "Inglés"}</span>
          <span>{language === "en" ? "Spanish" : "Español"}</span>
          <span />
        </div>
      )}

      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {fields.map((field, index) => {
            const item = items[index] ?? EMPTY_ITEM;
            const itemErrors = errors.vocabularyItems?.[index];

            return (
              <motion.li
                key={field.id}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-[2rem_1fr_2.25rem] items-start gap-3 rounded-2xl border border-border bg-background p-3 lg:grid-cols-[2rem_1fr_1fr_2.25rem] lg:border-0 lg:bg-transparent lg:p-0"
              >
                <span className="mt-1.5 flex size-7 items-center justify-center rounded-full bg-default-soft text-xs font-semibold text-foreground">
                  {index + 1}
                </span>

                <div className="col-start-2 row-start-1 flex min-w-0 flex-col gap-3 lg:contents">
                  {(["en", "es"] as const).map((lang) => {
                    const wordKey = lang === "en" ? "wordEn" : "wordEs";
                    const word = item[wordKey];
                    const error = itemErrors?.[wordKey]?.message;
                    const inputId = `vocabulary-${field.id}-${lang}`;
                    const playKey = `${field.id}-${lang}`;

                    return (
                      <div key={lang} className="flex min-w-0 flex-col gap-1">
                        <label
                          htmlFor={inputId}
                          className="text-xs font-medium text-muted lg:sr-only"
                        >
                          {lang === "en"
                            ? language === "en"
                              ? "English"
                              : "Inglés"
                            : language === "en"
                              ? "Spanish"
                              : "Español"}
                        </label>
                        <div className="flex min-w-0 items-center gap-2">
                          <input
                            id={inputId}
                            value={word}
                            onChange={(event) =>
                              handleWordChange(index, lang, event.target.value)
                            }
                            maxLength={VOCABULARY_WORD_MAX_LENGTH}
                            placeholder={
                              lang === "en" ? "Volcanic caldera" : "Caldera volcánica"
                            }
                            aria-invalid={!!error}
                            className={inputClassName}
                          />
                          <VocabularyAudioControl
                            text={word}
                            language={lang}
                            audioUrl={item[AUDIO_FIELD[lang]]}
                            onAudioChange={(url) =>
                              setValue(
                                `vocabularyItems.${index}.${AUDIO_FIELD[lang]}`,
                                url,
                                { shouldDirty: true },
                              )
                            }
                            isPlaying={player.playingKey === playKey}
                            onPlay={() =>
                              player.play({
                                key: playKey,
                                language: lang,
                                text: word,
                                audioUrl: item[AUDIO_FIELD[lang]],
                              })
                            }
                            onStop={player.stop}
                          />
                        </div>
                        {error && <p className="text-xs text-danger">{error}</p>}
                      </div>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemove(index)}
                  aria-label={
                    language === "en"
                      ? `Remove word ${index + 1}`
                      : `Quitar palabra ${index + 1}`
                  }
                  className="mt-0.5 text-muted hover:text-danger"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {fields.length === 0 && !importable?.items.length && (
        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          {language === "en"
            ? "No words yet. Add the first one."
            : "Aún no hay palabras. Agrega la primera."}
        </p>
      )}

      {listError && <p className="text-xs text-danger">{listError}</p>}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(EMPTY_ITEM)}
          disabled={isFull}
          className="w-full sm:w-auto"
        >
          <Plus aria-hidden="true" />
          {language === "en" ? "Add word" : "Agregar palabra"}
          <span className="text-muted">
            {fields.length}/{VOCABULARY_ITEMS_MAX}
          </span>
        </Button>

        {missingAudios.length > 0 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleGenerateAll}
            disabled={generatingAll !== null}
            className="w-full sm:w-auto"
          >
            {generatingAll ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {language === "en" ? "Generating" : "Generando"}{" "}
                {generatingAll.done}/{generatingAll.total}
              </>
            ) : (
              <>
                <Sparkles aria-hidden="true" />
                {language === "en"
                  ? `Generate missing audio (${missingAudios.length})`
                  : `Generar audios faltantes (${missingAudios.length})`}
              </>
            )}
          </Button>
        )}
      </div>

      {missingAudios.length > 0 && (
        <p className="text-xs text-muted">
          {language === "en"
            ? "Any audio you don't generate now is created automatically when you save."
            : "Los audios que no generes ahora se crean automáticamente al guardar."}
        </p>
      )}
    </div>
  );
}
