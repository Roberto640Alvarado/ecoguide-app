"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchStudentProgressOverview } from "../api/student-progress.api";
import type { FindStudentProgressParams } from "../types/student-progress.types";

export function useStudentProgressOverview(
  params: FindStudentProgressParams = {},
) {
  return useQuery({
    queryKey: ["student-progress", "overview", params],
    queryFn: () => fetchStudentProgressOverview(params),
    placeholderData: keepPreviousData,
  });
}
