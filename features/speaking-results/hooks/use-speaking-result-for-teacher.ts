"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSpeakingResultForTeacher } from "../api/speaking-results.api";

/** Uso del docente: turnos completos de una llamada de speaking. */
export function useSpeakingResultForTeacher(id: string | null) {
  return useQuery({
    queryKey: ["speaking-results", "teacher", "detail", id],
    queryFn: () => fetchSpeakingResultForTeacher(id as string),
    enabled: !!id,
  });
}
