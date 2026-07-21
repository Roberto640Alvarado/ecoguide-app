import { useLanguageStore } from "@/store/language-store";

interface ProtectedAreaStatusBadgeProps {
  isPublished: boolean;
}

export function ProtectedAreaStatusBadge({
  isPublished,
}: ProtectedAreaStatusBadgeProps) {
  const language = useLanguageStore((state) => state.language);

  const label = isPublished
    ? language === "en"
      ? "Published"
      : "Publicada"
    : language === "en"
      ? "Draft"
      : "Borrador";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isPublished
          ? "bg-success-soft text-success-soft-foreground"
          : "bg-default-soft text-muted"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isPublished ? "bg-success-soft-foreground" : "bg-muted"
        }`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
