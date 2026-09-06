# Mover el filtro de fecha de "Registrado" al toolbar de la tabla

## Objetivo

En Estudiantes/Docentes, el filtro de rango de fechas de la columna
"Registrado" vivía como un ícono en el header de la columna (mismo patrón
que "Estado"). El usuario pidió que en su lugar haya un espacio superior
pegado a la tabla (arriba, como un toolbar) con el buscador de rango de
fechas y un botón de "Limpiar filtros".

## Cambios realizados

1. `lib/date-range.ts` (nuevo): se extraen a un módulo compartido los
   helpers `parseDateRangeValue`, `serializeDateRange` y
   `formatDateRangeLabel` que antes vivían duplicados dentro de
   `column-filter.tsx`, para poder reusarlos también en el nuevo
   `date-range-filter.tsx`.
2. `components/ui/date-range-filter.tsx` (nuevo): componente
   `DateRangeFilter`, con la forma de un botón/input (no un ícono como
   `ColumnFilter`) pensado para vivir en un toolbar. Mismo patrón de
   "borrador hasta Aplicar" + Limpiar/Aplicar.
3. `components/ui/column-filter.tsx`: se elimina por completo el
   `type="date-range"` (ya no se usa en ningún header de columna) — vuelve
   a soportar solo `"text"` y `"select"`. Se quitan los imports/estado que
   solo servían para el calendario (`Calendar`, `CalendarRange`,
   `DateRange`, `useLanguageStore`, helpers de `lib/date-range`).
4. `components/ui/data-table.tsx`: nuevo prop `toolbar?: React.ReactNode`,
   renderizado arriba de la tabla con `border-b` (simétrico al `footer`
   existente, que usa `border-t`), para que se sienta "pegado" a la tabla.
5. `features/users/components/user-list-page.tsx`:
   - La columna "Registrado" vuelve a tener solo el label de texto (sin
     ícono de filtro en el header).
   - Se agrega el prop `toolbar` a `<DataTable>` con el nuevo
     `DateRangeFilter` (filtro de fecha) + un botón "Limpiar filtros"
     (`FilterX`, `variant="ghost"`) que resetea búsqueda + estado + rango
     de fechas + página, deshabilitado cuando no hay ningún filtro activo.
   - El tour guiado (`data-tour="filter-date"`) ahora apunta al trigger del
     `DateRangeFilter` en el toolbar en vez del ícono del header.

## Decisión de diseño no confirmada

"Limpiar filtros" se implementó como un botón que limpia **todos** los
filtros activos de la vista (nombre, estado, rango de fechas), no solo el
rango de fechas — a confirmar con el usuario si su intención era más
acotada.

## Verificación

- `npm run lint`: 0 errores (solo las 5 advertencias preexistentes de
  `react-hooks/incompatible-library` por `watch()`, no relacionadas).
- `npm run build`: compila y type-checkea sin errores.
