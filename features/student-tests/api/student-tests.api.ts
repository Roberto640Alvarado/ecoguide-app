import { apiGet, apiPost } from "@/lib/api/client";
import type { StudentTestConfig, StudentTestResult } from "../types/student-test.types";

export interface SubmitTestPayload {
  protectedAreaId: string;
  answers: { questionId: string; studentAnswer: string }[];
}

export function fetchTestConfig(protectedAreaId: string) {
  return apiGet<StudentTestConfig>(`/student-tests/config/${protectedAreaId}`);
}

export function submitTest(payload: SubmitTestPayload) {
  return apiPost<StudentTestResult>("/student-tests", payload);
}
