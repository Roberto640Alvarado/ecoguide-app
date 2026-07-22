"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStudentAreaProgress } from "../api/student-progress.api";

export function useStudentAreaProgress(protectedAreaId: string) {
  return useQuery({
    queryKey: ["student-progress", "by-area", protectedAreaId],
    queryFn: () => fetchStudentAreaProgress(protectedAreaId),
    enabled: !!protectedAreaId,
  });
}
