"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSpeakingResultsByArea } from "../api/speaking-results.api";
import type { FindSpeakingResultsParams } from "../types/speaking-result.types";

export function useSpeakingResultsByArea(
  protectedAreaId: string,
  params: FindSpeakingResultsParams = {},
) {
  return useQuery({
    queryKey: ["speaking-results", protectedAreaId, params],
    queryFn: () => fetchSpeakingResultsByArea(protectedAreaId, params),
    enabled: !!protectedAreaId,
  });
}
