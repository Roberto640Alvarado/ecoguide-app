"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/store/language-store";
import type { PaginationMeta } from "@/types/api";

interface PaginationControlsProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

type PageEntry = number | "ellipsis";

// Ventana de páginas con elipsis: siempre primera y última página, más
// current-1..current+1 en el medio. Con 7 páginas o menos se listan todas
// sin elipsis.
function getPageEntries(current: number, totalPages: number): PageEntry[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const entries: PageEntry[] = [1];

  if (current > 3) {
    entries.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  for (let page = start; page <= end; page++) {
    entries.push(page);
  }

  if (current < totalPages - 2) {
    entries.push("ellipsis");
  }

  entries.push(totalPages);

  return entries;
}

export function PaginationControls({
  meta,
  onPageChange,
}: PaginationControlsProps) {
  const language = useLanguageStore((state) => state.language);
  const { page, totalPages, total, limit } = meta;

  if (total === 0) {
    return null;
  }

  const shown = Math.min(page * limit, total) - (page - 1) * limit;
  const pageEntries = getPageEntries(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        {language === "en"
          ? `Showing ${shown} of ${total} result${total === 1 ? "" : "s"}`
          : `Mostrando ${shown} de ${total} resultado${total === 1 ? "" : "s"}`}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={language === "en" ? "Previous page" : "Página anterior"}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>

        {pageEntries.map((entry, index) =>
          entry === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1.5 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Button
              key={entry}
              variant={entry === page ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => onPageChange(entry)}
              aria-label={
                language === "en" ? `Page ${entry}` : `Página ${entry}`
              }
              aria-current={entry === page ? "page" : undefined}
            >
              {entry}
            </Button>
          ),
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={language === "en" ? "Next page" : "Página siguiente"}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
