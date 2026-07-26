"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEarnedAreaBadges } from "../api/student-progress.api";

export function useEarnedAreaBadges(protectedAreaId: string) {
  return useQuery({
    queryKey: ["student-progress", "badges", protectedAreaId],
    queryFn: () => fetchEarnedAreaBadges(protectedAreaId),
    enabled: !!protectedAreaId,
  });
}
