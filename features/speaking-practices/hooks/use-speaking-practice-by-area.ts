"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSpeakingPracticeByArea } from "../api/speaking-practices.api";

export function useSpeakingPracticeByArea(protectedAreaId: string) {
  return useQuery({
    queryKey: ["speaking-practices", "by-area", protectedAreaId],
    queryFn: () => fetchSpeakingPracticeByArea(protectedAreaId),
    enabled: !!protectedAreaId,
  });
}
