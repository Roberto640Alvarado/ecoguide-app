"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSpeakingResultsForStudent } from "../api/speaking-results.api";
import type { FindSpeakingResultsParams } from "../types/speaking-result.types";

/** Uso del docente: llamadas de speaking de un estudiante específico. */
export function useSpeakingResultsForStudent(
  studentId: string,
  protectedAreaId: string,
  params: FindSpeakingResultsParams = {},
) {
  return useQuery({
    queryKey: [
      "speaking-results",
      "teacher",
      studentId,
      protectedAreaId,
      params,
    ],
    queryFn: () =>
      fetchSpeakingResultsForStudent(studentId, protectedAreaId, params),
    enabled: !!studentId && !!protectedAreaId,
  });
}
