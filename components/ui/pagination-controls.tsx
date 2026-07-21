"use client";

import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import type { PaginationMeta } from "@/types/api";

interface PaginationControlsProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  meta,
  onPageChange,
}: PaginationControlsProps) {
  const language = useLanguageStore((state) => state.language);
  const { page, totalPages, total } = meta;

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <p className="text-xs text-muted">
        {language === "en"
          ? `${total} result${total === 1 ? "" : "s"} · page ${page} of ${totalPages}`
          : `${total} resultado${total === 1 ? "" : "s"} · página ${page} de ${totalPages}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          isDisabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {language === "en" ? "Previous" : "Anterior"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          isDisabled={page >= totalPages}
          onPress={() => onPageChange(page + 1)}
        >
          {language === "en" ? "Next" : "Siguiente"}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
