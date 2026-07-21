import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { Test } from "../types/test.types";
import type { TestFormValues } from "../schemas/test.schema";

export function fetchTestByArea(protectedAreaId: string) {
  return apiGet<Test | null>(`/tests/by-area/${protectedAreaId}`);
}

export function createTest(payload: TestFormValues) {
  return apiPost<Test>("/tests", payload);
}

export function updateTest(id: string, payload: Partial<TestFormValues>) {
  return apiPatch<Test>(`/tests/${id}`, payload);
}
