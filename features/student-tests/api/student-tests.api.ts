import { apiGet, apiPost } from "@/lib/api/client";
import type { PaginatedResult } from "@/types/api";
import type {
  StudentTestConfig,
  StudentTestResult,
  TeacherStudentTestResult,
} from "../types/student-test.types";

export interface SubmitTestPayload {
  protectedAreaId: string;
  answers: { questionId: string; studentAnswer: string }[];
}

export interface FindTeacherStudentTestsParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export function fetchTestConfig(protectedAreaId: string) {
  return apiGet<StudentTestConfig>(`/student-tests/config/${protectedAreaId}`);
}

export function submitTest(payload: SubmitTestPayload) {
  return apiPost<StudentTestResult>("/student-tests", payload);
}

/** Uso del docente: intentos de examen de un estudiante, con el detalle de cada respuesta. */
export function fetchStudentTestsForStudent(
  studentId: string,
  protectedAreaId: string,
  params: FindTeacherStudentTestsParams,
) {
  return apiGet<PaginatedResult<TeacherStudentTestResult>>(
    `/student-tests/teacher/students/${studentId}/by-area/${protectedAreaId}`,
    { params },
  );
}
