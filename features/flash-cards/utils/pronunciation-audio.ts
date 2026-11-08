import type { FlashCard, VocabularyItem } from "../types/flash-card.types";

export const MISSING_PRONUNCIATION_AUDIO_MESSAGE =
  "Algunas pronunciaciones no se pudieron generar. Revisa que haya un proveedor OpenAI activo y vuelve a guardar para reintentar.";

export function isVocabularyItemMissingAudio(item: VocabularyItem): boolean {
  return !item.audioEnUrl || !item.audioEsUrl;
}

/**
 * La API guarda la flashcard aunque falle la generación de algún audio
 * (queda en `null`); el docente debe enterarse para reintentar.
 */
export function isMissingPronunciationAudio(flashCard: FlashCard): boolean {
  return (
    flashCard.type === "VOCABULARY" &&
    (flashCard.vocabularyItems ?? []).some(isVocabularyItemMissingAudio)
  );
}
