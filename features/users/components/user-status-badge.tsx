import { useLanguageStore } from "@/store/language-store";

interface UserStatusBadgeProps {
  isActive: boolean;
}

export function UserStatusBadge({ isActive }: UserStatusBadgeProps) {
  const language = useLanguageStore((state) => state.language);

  const label = isActive
    ? language === "en"
      ? "Active"
      : "Activo"
    : language === "en"
      ? "Inactive"
      : "Inactivo";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive
          ? "bg-success-soft text-success-soft-foreground"
          : "bg-danger-soft text-danger-soft-foreground"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-success-soft-foreground" : "bg-danger-soft-foreground"
        }`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
