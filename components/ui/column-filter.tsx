"use client";

import { useState } from "react";
import { ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColumnFilterOption {
  value: string;
  label: string;
}

interface ColumnFilterProps {
  type: "text" | "select";
  triggerLabel: string;
  popoverTitle: string;
  value: string;
  onApply: (value: string) => void;
  placeholder?: string;
  options?: ColumnFilterOption[];
  clearLabel: string;
  applyLabel: string;
  "data-tour"?: string;
}

// Filtro por columna: ícono en el header de la tabla que abre un popover con
// un valor en borrador (no se aplica hasta tocar "Aplicar"). type="text" es
// un input libre (ej. columna "Proveedor"/"Nombre"); type="select" es una
// lista de checkboxes — nuestro modelo de datos solo admite un valor a la
// vez (isActive/role), así que aunque se ven como checkboxes se comportan
// de forma mutuamente excluyente (marcar una desmarca la otra). Ver
// CLAUDE.md, sección "Sistema de Diseño".
export function ColumnFilter({
  type,
  triggerLabel,
  popoverTitle,
  value,
  onApply,
  placeholder,
  options,
  clearLabel,
  applyLabel,
  "data-tour": dataTour,
}: ColumnFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const isActive = value !== "";

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(value);
    }
    setOpen(nextOpen);
  }

  function handleClear() {
    setDraft("");
    onApply("");
    setOpen(false);
  }

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  const Icon = ListFilter;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          data-tour={dataTour}
          aria-label={triggerLabel}
          className={cn(
            "h-6 w-6",
            isActive ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <PopoverTitle>{popoverTitle}</PopoverTitle>

        <div className="mt-3">
          {type === "text" && (
            <Input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
            />
          )}

          {type === "select" && (
            <div className="flex flex-col gap-2">
              {options?.map((option) => {
                const checked = draft === option.value;

                return (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) =>
                        setDraft(next === true ? option.value : "")
                      }
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={handleClear}>
            {clearLabel}
          </Button>
          <Button size="sm" onClick={handleApply}>
            {applyLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
