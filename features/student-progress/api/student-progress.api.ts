import { apiGet, apiPost } from "@/lib/api/client";
import type { PaginatedResult } from "@/types/api";
import type {
  FindStudentProgressParams,
  StudentAreaProgress,
} from "../types/student-progress.types";

export function fetchStudentProgressOverview(
  params: FindStudentProgressParams,
) {
  return apiGet<PaginatedResult<StudentAreaProgress>>("/student-progress", {
    params,
  });
}

export function fetchStudentAreaProgress(protectedAreaId: string) {
  return apiGet<StudentAreaProgress>(
    `/student-progress/by-area/${protectedAreaId}`,
  );
}

export function markFlashcardsCompleted(protectedAreaId: string) {
  return apiPost<null>(
    `/student-progress/by-area/${protectedAreaId}/flashcards-completed`,
  );
}

/** Uso del docente: avance de un estudiante específico en todas sus áreas. */
export function fetchStudentProgressOverviewForStudent(
  studentId: string,
  params: FindStudentProgressParams,
) {
  return apiGet<PaginatedResult<StudentAreaProgress>>(
    `/student-progress/students/${studentId}`,
    { params },
  );
}

/** Uso del docente: avance de un estudiante específico en un área. */
export function fetchStudentAreaProgressForStudent(
  studentId: string,
  protectedAreaId: string,
) {
  return apiGet<StudentAreaProgress>(
    `/student-progress/students/${studentId}/by-area/${protectedAreaId}`,
  );
}
