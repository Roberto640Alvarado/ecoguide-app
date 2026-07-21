"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface SortState {
  field: string;
  order: "asc" | "desc";
}

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSort: SortState | null;
  onSortChange: (field: string) => void;
}

export function SortableHeader({
  label,
  field,
  currentSort,
  onSortChange,
}: SortableHeaderProps) {
  const isActive = currentSort?.field === field;

  return (
    <button
      type="button"
      onClick={() => onSortChange(field)}
      className="flex items-center gap-1 transition-colors hover:text-foreground"
    >
      {label}
      {isActive ? (
        currentSort?.order === "asc" ? (
          <ArrowUp className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ArrowDown className="h-3 w-3" aria-hidden="true" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
      )}
    </button>
  );
}
