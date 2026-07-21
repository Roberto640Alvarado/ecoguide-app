import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { PaginatedResult } from "@/types/api";
import type {
  FindFlashCardsParams,
  FlashCard,
} from "../types/flash-card.types";
import type { FlashCardFormValues } from "../schemas/flash-card.schema";

/**
 * Los campos question/options/correctAnswer solo aplican al tipo
 * ENVIRONMENTAL; se limpian antes de enviarlos para no mandar datos
 * irrelevantes de un formulario que el usuario pudo haber llenado y luego
 * cambiado de tipo. image: "" (placeholder del formulario) se convierte en
 * undefined para no violar la validación @IsUrl (opcional) de la API.
 */
function normalizePayload<T extends Partial<FlashCardFormValues>>(
  payload: T,
): T {
  const normalized: Partial<FlashCardFormValues> = {
    ...payload,
    image: payload.image ? payload.image : undefined,
  };

  if (normalized.type && normalized.type !== "ENVIRONMENTAL") {
    normalized.question = undefined;
    normalized.options = undefined;
    normalized.correctAnswer = undefined;
  } else if (normalized.options) {
    // Descarta las filas de opción vacías que el usuario no llenó (el
    // editor de opciones permite dejarlas en blanco mientras escribe).
    normalized.options = normalized.options.filter(
      (option) => option.trim().length > 0,
    );
  }

  return normalized as T;
}

export function fetchFlashCards(params: FindFlashCardsParams) {
  return apiGet<PaginatedResult<FlashCard>>("/flash-cards", { params });
}

export function fetchFlashCard(id: string) {
  return apiGet<FlashCard>(`/flash-cards/${id}`);
}

export function createFlashCard(
  protectedAreaId: string,
  payload: FlashCardFormValues,
) {
  return apiPost<FlashCard>("/flash-cards", {
    ...normalizePayload(payload),
    protectedAreaId,
  });
}

export function updateFlashCard(
  id: string,
  payload: Partial<FlashCardFormValues>,
) {
  return apiPatch<FlashCard>(`/flash-cards/${id}`, normalizePayload(payload));
}

export function removeFlashCard(id: string) {
  return apiDelete<null>(`/flash-cards/${id}`);
}

/**
 * Ver el comentario equivalente en protected-areas.api.ts: hay que anular el
 * header Content-Type para que Axios envíe multipart/form-data en vez de
 * convertir el FormData a JSON.
 */
export function uploadFlashCardImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiPost<{ url: string }>("/upload-files", formData, {
    params: { folder: "flash-cards" },
    headers: { "Content-Type": undefined },
  });
}
