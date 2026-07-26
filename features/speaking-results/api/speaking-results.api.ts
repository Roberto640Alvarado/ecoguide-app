import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { PaginatedResult } from "@/types/api";
import type {
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

export function fetchSpeakingResult(id: string) {
  return apiGet<SpeakingResult>(`/speaking-results/${id}`);
}

/** Uso del docente: llamadas de speaking de un estudiante específico. */
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

/** Uso del docente: turnos completos de una llamada de speaking. */
export function fetchSpeakingResultForTeacher(id: string) {
  return apiGet<SpeakingResult>(`/speaking-results/teacher/${id}`);
}

export function startSpeakingResult(protectedAreaId: string) {
  return apiPost<SpeakingResult>("/speaking-results", { protectedAreaId });
}

/**
 * Envía el audio del turno del estudiante. anular Content-Type: apiClient lo
 * fija en application/json por defecto, lo que le impediría a Axios armar el
 * multipart/form-data correcto (mismo patrón que el viejo
 * uploadSpeakingAudio, ver ImageUploader).
 */
export function sendSpeakingTurn(id: string, audioBlob: Blob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "turn.webm");

  return apiPost<SpeakingResult>(`/speaking-results/${id}/turns`, formData, {
    headers: { "Content-Type": undefined },
  });
}

export function finishSpeakingResult(id: string) {
  return apiPatch<SpeakingResult>(`/speaking-results/${id}/finish`, {});
}
