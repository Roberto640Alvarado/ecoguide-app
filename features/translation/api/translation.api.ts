import { apiPost } from "@/lib/api/client";
import type { TranslationLanguage } from "../types/translation.types";

/**
 * Traduce un lote de textos dinámicos (contenido de la BD o generado por
 * IA) al idioma indicado. El backend cachea cada traducción (colección
 * translation_cache) para no volver a llamar a DeepL con el mismo texto.
 */
export function translateBatch(
  texts: string[],
  targetLanguage: TranslationLanguage,
) {
  return apiPost<{ translations: string[] }>("/translation/batch", {
    texts,
    targetLanguage,
  });
}
