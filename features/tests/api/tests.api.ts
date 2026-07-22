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
  // UpdateTestDto nunca acepta `protectedAreaId` (no se puede reasignar el
  // examen a otra área) — si viaja, la API responde 400 "should not exist"
  // por el whitelist estricto del ValidationPipe.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { protectedAreaId: _protectedAreaId, ...rest } = payload;

  return apiPatch<Test>(`/tests/${id}`, rest);
}
