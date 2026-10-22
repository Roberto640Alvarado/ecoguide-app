import type { Language } from "@/store/language-store";

/**
 * Extrae el `message` (ya en español, listo para mostrar) de un error de la
 * API, con un texto genérico de respaldo si el error no lo trae.
 */
export function getErrorMessage(error: unknown, language: Language): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return language === "en" ? "Something went wrong." : "Algo salió mal.";
}
