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
  return apiPatch<SpeakingPractice>(`/speaking-practices/${id}`, payload);
}
