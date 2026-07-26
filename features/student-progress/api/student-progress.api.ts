import { apiGet, apiPost } from "@/lib/api/client";
import type { PaginatedResult } from "@/types/api";
import type {
  Badge,
  BadgeAwardResult,
} from "@/features/badges/types/badge.types";
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

/**
 * Revisa si el estudiante ya terminó el recorrido de un área y, de ser así,
 * le otorga sus insignias (idempotente — ver checkAndAwardBadges en la API).
 */
export function checkAreaBadges(protectedAreaId: string) {
  return apiPost<BadgeAwardResult>(
    `/student-progress/by-area/${protectedAreaId}/check-badges`,
  );
}

/** Insignias que el estudiante ya obtuvo en un área (sin otorgar nada nuevo). */
export function fetchEarnedAreaBadges(protectedAreaId: string) {
  return apiGet<Badge[]>(`/student-progress/by-area/${protectedAreaId}/badges`);
}

/** Todas las insignias que el estudiante ya obtuvo, en cualquier área. */
export function fetchAllEarnedBadges() {
  return apiGet<Badge[]>("/student-progress/badges");
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
