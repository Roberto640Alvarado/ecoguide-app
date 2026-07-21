"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTestConfig } from "../api/student-tests.api";

export function useTestConfig(protectedAreaId: string) {
  return useQuery({
    queryKey: ["student-tests", "config", protectedAreaId],
    queryFn: () => fetchTestConfig(protectedAreaId),
    enabled: !!protectedAreaId,
  });
}
