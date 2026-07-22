"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchStudentProgressOverviewForStudent } from "../api/student-progress.api";
import type { FindStudentProgressParams } from "../types/student-progress.types";

/** Uso del docente: avance de un estudiante específico en todas sus áreas. */
export function useStudentProgressOverviewForStudent(
  studentId: string,
  params: FindStudentProgressParams = {},
) {
  return useQuery({
    queryKey: ["student-progress", "students", studentId, params],
    queryFn: () => fetchStudentProgressOverviewForStudent(studentId, params),
    enabled: !!studentId,
    placeholderData: keepPreviousData,
  });
}
