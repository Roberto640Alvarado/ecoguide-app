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

  // Fondo oscuro translúcido + blur fijo (no el tinte "soft" habitual) para
  // que la insignia se lea igual de bien sin importar el brillo de la foto
  // de portada sobre la que va superpuesta (ver ProtectedAreaCard).
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          isPublished ? "bg-success" : "bg-white/70"
        }`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
