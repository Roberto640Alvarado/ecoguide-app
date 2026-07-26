"use client";

import { useQuery } from "@tanstack/react-query";
import { useLanguageStore } from "@/store/language-store";
import { translateBatch } from "../api/translation.api";

/**
 * Traduce un lote de textos dinámicos (contenido escrito por el docente, o
 * generado por IA) al idioma seleccionado en el botón de idioma. El texto
 * estático de la UI ya está traducido a mano en cada componente — esto es
 * solo para lo que viene de la base de datos o de una respuesta de IA.
 *
 * Se asume que ese contenido siempre se escribe originalmente en español
 * (la plataforma es para docentes/estudiantes de El Salvador): cuando el
 * idioma activo es "es" no se traduce nada (passthrough inmediato, sin
 * request); cuando es "en" se pide la traducción a la API (cacheada tanto
 * en el backend como en React Query) y se muestra el texto original
 * mientras la traducción todavía no llega o si la llamada falla, para no
 * dejar un hueco en la UI.
 *
 * Devuelve siempre la misma cantidad de strings que la entrada, en el mismo
 * orden.
 */
export function useTranslatedTexts(texts: string[]): string[] {
  const language = useLanguageStore((state) => state.language);
  const shouldTranslate =
    language === "en" && texts.some((text) => text.trim().length > 0);

  const { data } = useQuery({
    queryKey: ["translation", "batch", texts],
    queryFn: () => translateBatch(texts, "EN"),
    enabled: shouldTranslate,
    staleTime: Infinity,
  });

  if (!shouldTranslate) return texts;

  return data?.translations ?? texts;
}

/** Variante para un solo texto — ver useTranslatedTexts. */
export function useTranslatedText(text: string): string {
  return useTranslatedTexts([text])[0];
}
