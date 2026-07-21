import { useLanguageStore } from "@/store/language-store";
import type { UserRole } from "../types/user.types";

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const language = useLanguageStore((state) => state.language);
  const isTeacher = role === "TEACHER";

  const label = isTeacher
    ? language === "en"
      ? "Teacher"
      : "Docente"
    : language === "en"
      ? "Student"
      : "Estudiante";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        isTeacher
          ? "bg-accent-soft text-accent-soft-foreground"
          : "bg-default-soft text-foreground"
      }`}
    >
      {label}
    </span>
  );
}
