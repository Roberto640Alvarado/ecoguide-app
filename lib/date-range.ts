import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

/** Formato usado para serializar rangos de fecha en la URL/query params. */
export const DATE_RANGE_FORMAT = "yyyy-MM-dd";

/**
 * Convierte el valor serializado ("yyyy-MM-dd_yyyy-MM-dd", cualquiera de
 * los dos lados puede ir vacío) en un DateRange para el <Calendar/>.
 */
export function parseDateRangeValue(value: string): DateRange | undefined {
  if (!value) {
    return undefined;
  }

  const [fromRaw, toRaw] = value.split("_");
  const from = fromRaw ? new Date(`${fromRaw}T00:00:00`) : undefined;
  const to = toRaw ? new Date(`${toRaw}T00:00:00`) : undefined;

  if (!from && !to) {
    return undefined;
  }

  return { from, to };
}

/** Inverso de parseDateRangeValue: DateRange -> "yyyy-MM-dd_yyyy-MM-dd". */
export function serializeDateRange(range: DateRange | undefined): string {
  if (!range?.from && !range?.to) {
    return "";
  }

  const from = range?.from ? format(range.from, DATE_RANGE_FORMAT) : "";
  const to = range?.to ? format(range.to, DATE_RANGE_FORMAT) : "";

  return `${from}_${to}`;
}

/** Texto legible para mostrar el rango elegido (ej. "1 ene 2026 – 5 ene 2026"). */
export function formatDateRangeLabel(
  range: DateRange | undefined,
  language: string,
): string | null {
  if (!range?.from && !range?.to) {
    return null;
  }

  const dateLocale = language === "en" ? undefined : es;
  const formatted = (date: Date) =>
    format(date, "d MMM yyyy", { locale: dateLocale });

  if (range?.from && range?.to) {
    return `${formatted(range.from)} – ${formatted(range.to)}`;
  }

  if (range?.from) {
    return language === "en"
      ? `From ${formatted(range.from)}`
      : `Desde ${formatted(range.from)}`;
  }

  if (range?.to) {
    return language === "en"
      ? `Until ${formatted(range.to)}`
      : `Hasta ${formatted(range.to)}`;
  }

  return null;
}
