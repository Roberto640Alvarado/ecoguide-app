"use client";

import { Button } from "@heroui/react";
import { Eye } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useUpdateProtectedArea } from "../hooks/use-update-protected-area";
import type { ProtectedArea } from "../types/protected-area.types";

interface PublishAreaButtonProps {
  area: ProtectedArea;
}

/** Acción rápida para republicar un área en borrador (no es destructiva, no requiere confirmación). */
export function PublishAreaButton({ area }: PublishAreaButtonProps) {
  const language = useLanguageStore((state) => state.language);
  const updateArea = useUpdateProtectedArea(area.id);

  if (area.isPublished) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={language === "en" ? "Publish" : "Publicar"}
      isDisabled={updateArea.isPending}
      onPress={() => updateArea.mutate({ isPublished: true })}
    >
      <Eye className="h-4 w-4" aria-hidden="true" />
      {language === "en" ? "Publish" : "Publicar"}
    </Button>
  );
}
