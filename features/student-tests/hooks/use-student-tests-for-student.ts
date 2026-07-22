"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchStudentTestsForStudent,
  type FindTeacherStudentTestsParams,
} from "../api/student-tests.api";

/** Uso del docente: intentos de examen de un estudiante, con el detalle de cada respuesta. */
export function useStudentTestsForStudent(
  studentId: string,
  protectedAreaId: string,
  params: FindTeacherStudentTestsParams = {},
) {
  return useQuery({
    queryKey: ["student-tests", "teacher", studentId, protectedAreaId, params],
    queryFn: () =>
      fetchStudentTestsForStudent(studentId, protectedAreaId, params),
    enabled: !!studentId && !!protectedAreaId,
  });
}
