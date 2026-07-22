import { apiGet, apiPost } from "@/lib/api/client";
import type { PaginatedResult } from "@/types/api";
import type {
  CreateSpeakingResultPayload,
  FindSpeakingResultsParams,
  SpeakingResult,
} from "../types/speaking-result.types";

export function fetchSpeakingResultsByArea(
  protectedAreaId: string,
  params: FindSpeakingResultsParams,
) {
  return apiGet<PaginatedResult<SpeakingResult>>(
    `/speaking-results/by-area/${protectedAreaId}`,
    { params },
  );
}

/** Uso del docente: intentos de speaking de un estudiante específico. */
export function fetchSpeakingResultsForStudent(
  studentId: string,
  protectedAreaId: string,
  params: FindSpeakingResultsParams,
) {
  return apiGet<PaginatedResult<SpeakingResult>>(
    `/speaking-results/teacher/students/${studentId}/by-area/${protectedAreaId}`,
    { params },
  );
}

export function createSpeakingResult(payload: CreateSpeakingResultPayload) {
  return apiPost<SpeakingResult>("/speaking-results", payload);
}

/**
 * Sube el audio grabado por el estudiante vía el endpoint genérico
 * /upload-files/audio y devuelve su URL. Ver ImageUploader para el porqué de
 * anular Content-Type: apiClient lo fija en application/json por defecto, lo
 * que le impediría a Axios armar el multipart/form-data correcto.
 */
export function uploadSpeakingAudio(blob: Blob) {
  const formData = new FormData();
  formData.append("file", blob, "speaking-practice.webm");

  return apiPost<{ url: string }>("/upload-files/audio", formData, {
    params: { folder: "speaking-results" },
    headers: { "Content-Type": undefined },
  });
}
