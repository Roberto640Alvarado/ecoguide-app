import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { SpeakingPractice } from "../types/speaking-practice.types";
import type { SpeakingPracticeFormValues } from "../schemas/speaking-practice.schema";

export function fetchSpeakingPracticeByArea(protectedAreaId: string) {
  return apiGet<SpeakingPractice | null>(
    `/speaking-practices/by-area/${protectedAreaId}`,
  );
}

export function createSpeakingPractice(payload: SpeakingPracticeFormValues) {
  return apiPost<SpeakingPractice>("/speaking-practices", payload);
}

export function updateSpeakingPractice(
  id: string,
  payload: Partial<SpeakingPracticeFormValues>,
) {
  // UpdateSpeakingPracticeDto nunca acepta `protectedAreaId` (no se puede
  // reasignar la práctica a otra área) — si viaja, la API responde 400
  // "should not exist" por el whitelist estricto del ValidationPipe.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { protectedAreaId: _protectedAreaId, ...rest } = payload;

  return apiPatch<SpeakingPractice>(`/speaking-practices/${id}`, rest);
}
