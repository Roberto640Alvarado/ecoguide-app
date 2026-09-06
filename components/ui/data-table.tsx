"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Spinner } from "@heroui/react";
import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage: string;
  /** Se renderiza dentro del mismo contenedor con borde que la tabla, antes
   *  del header de columnas, separado por un border-b — una barra de
   *  filtros que necesitan más espacio que un ícono en el header de
   *  columna (ej. un rango de fechas) queda pegada a la tabla en vez de
   *  flotar arriba. */
  toolbar?: React.ReactNode;
  /** Se renderiza dentro del mismo contenedor con borde que la tabla (ej.
   *  <PaginationControls />), separado por un border-t — así el footer de
   *  paginación queda visualmente unido a la tabla en vez de flotar debajo. */
  footer?: React.ReactNode;
  /** Si se define, toda la fila se vuelve clickeable (con cursor-pointer y
   *  hover más marcado) y navega al detalle del recurso. Las columnas cuyo
   *  `id` aparezca en `interactiveColumnIds` (por defecto solo "actions")
   *  detienen la propagación del click para no disparar también la
   *  navegación de la fila — úsalo también para una columna con un control
   *  interactivo propio, ej. un switch en la columna de estado. */
  onRowClick?: (row: T) => void;
  interactiveColumnIds?: string[];
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage,
  toolbar,
  footer,
  onRowClick,
  interactiveColumnIds = ["actions"],
}: DataTableProps<T>) {
  // TanStack Table's return value isn't safely memoizable by the React
  // Compiler (it returns fresh functions each render by design); this is a
  // known, harmless interaction, not a bug.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (_row, index) => String(index),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {toolbar && (
        <div className="border-b border-border px-4 py-3">{toolbar}</div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-secondary/60">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted",
                      header.column.id === "actions" && "text-center",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <Spinner size="sm" />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                  className={cn(
                    "transition-colors hover:bg-surface-secondary/40",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 align-middle"
                      onClick={
                        onRowClick && interactiveColumnIds.includes(cell.column.id)
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
