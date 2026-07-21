import type { UserRole } from "../types/auth.types";

/** Ruta del panel correspondiente al rol del usuario autenticado. */
export function getDashboardPath(role: UserRole): string {
  return role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";
}
