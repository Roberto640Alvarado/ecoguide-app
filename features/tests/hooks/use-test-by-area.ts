"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTestByArea } from "../api/tests.api";

export function useTestByArea(protectedAreaId: string) {
  return useQuery({
    queryKey: ["tests", "by-area", protectedAreaId],
    queryFn: () => fetchTestByArea(protectedAreaId),
    enabled: !!protectedAreaId,
  });
}
