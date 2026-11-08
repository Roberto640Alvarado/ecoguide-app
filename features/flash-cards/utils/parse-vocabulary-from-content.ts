import type { VocabularyItem } from "../types/flash-card.types";

// "Volcanic caldera: Caldera volcánica." o "River - Río"
const PAIR_PATTERN = /^(.+?)\s*(?::|\s[-–—]\s)\s*(.+?)[.;]?$/;

interface ParsedVocabulary {
  items: VocabularyItem[];
  /** Todas las líneas con texto eran pares (el contenido era solo la lista). */
  isOnlyVocabulary: boolean;
}

/**
 * Extrae pares "inglés: español" del HTML del contenido, para migrar las
 * flashcards de vocabulario que se escribieron como lista en el contenido
 * antes de existir `vocabularyItems`. Solo corre en el cliente (DOMParser).
 */
export function parseVocabularyFromContent(html: string): ParsedVocabulary {
  if (typeof window === "undefined" || !html.trim()) {
    return { items: [], isOnlyVocabulary: false };
  }

  const doc = new DOMParser().parseFromString(
    html.replace(/<br\s*\/?>/gi, "\n"),
    "text/html",
  );
  const blocks = Array.from(doc.body.querySelectorAll("p, li"));
  const lines = (
    blocks.length > 0
      ? blocks.map((block) => block.textContent ?? "")
      : [doc.body.textContent ?? ""]
  )
    .flatMap((text) => text.split("\n"))
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const items = lines.flatMap((line) => {
    const match = PAIR_PATTERN.exec(line);
    if (!match) return [];

    return [
      {
        wordEn: match[1].trim(),
        wordEs: match[2].trim(),
        audioEnUrl: null,
        audioEsUrl: null,
      },
    ];
  });

  return {
    items,
    isOnlyVocabulary: items.length > 0 && items.length === lines.length,
  };
}
