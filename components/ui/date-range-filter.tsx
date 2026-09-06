"use client";

import { useState } from "react";
import { es } from "date-fns/locale";
import { CalendarRange } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatDateRangeLabel,
  parseDateRangeValue,
  serializeDateRange,
} from "@/lib/date-range";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language-store";

interface DateRangeFilterProps {
  /** "yyyy-MM-dd_yyyy-MM-dd" (cualquiera de los dos lados puede ir vacío). */
  value: string;
  onApply: (value: string) => void;
  placeholder: string;
  popoverTitle: string;
  clearLabel: string;
  applyLabel: string;
  className?: string;
  "data-tour"?: string;
}

// Filtro de rango de fechas para la barra de herramientas de una tabla (a
// diferencia de ColumnFilter, que vive dentro del header de una columna):
// un botón con pinta de input que muestra el rango elegido, y un popover
// con el calendario + Limpiar/Aplicar. Igual que ColumnFilter, el valor no
// se aplica hasta tocar "Aplicar".
export function DateRangeFilter({
  value,
  onApply,
  placeholder,
  popoverTitle,
  clearLabel,
  applyLabel,
  className,
  "data-tour": dataTour,
}: DateRangeFilterProps) {
  const language = useLanguageStore((state) => state.language);
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(() =>
    parseDateRangeValue(value),
  );
  const isActive = value !== "";
  const appliedLabel = formatDateRangeLabel(parseDateRangeValue(value), language);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraftRange(parseDateRangeValue(value));
    }
    setOpen(nextOpen);
  }

  function handleClear() {
    setDraftRange(undefined);
    onApply("");
    setOpen(false);
  }

  function handleApply() {
    onApply(serializeDateRange(draftRange));
    setOpen(false);
  }

  const draftLabel = formatDateRangeLabel(draftRange, language);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-tour={dataTour}
          className={cn(
            "w-full justify-start gap-2 text-left font-normal sm:w-64",
            isActive ? "text-foreground" : "text-muted-foreground",
            className,
          )}
        >
          <CalendarRange className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{appliedLabel ?? placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <PopoverTitle className="px-1">{popoverTitle}</PopoverTitle>

        <div className="mt-3 flex flex-col gap-1">
          {draftLabel && (
            <p className="px-1 text-xs text-muted-foreground">{draftLabel}</p>
          )}
          <Calendar
            mode="range"
            autoFocus
            numberOfMonths={1}
            locale={language === "en" ? undefined : es}
            selected={draftRange}
            onSelect={setDraftRange}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 px-1">
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
