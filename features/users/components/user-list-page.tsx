"use client";

import { useMemo } from "react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { ColumnDef } from "@tanstack/react-table";
import type { DriveStep } from "driver.js";
import type { LucideIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnFilter } from "@/components/ui/column-filter";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { FilterX, SquarePen, TrendingUp } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { PageHeader } from "@/components/layout/page-header";
import { PageTourBanner } from "@/components/layout/page-tour-banner";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { UserAvatar } from "@/components/ui/user-avatar";
import { usePageTour } from "@/hooks/use-page-tour";
import { useUsers } from "../hooks/use-users";
import { EditUserModal } from "./edit-user-modal";
import { UserStatusToggle } from "./user-status-toggle";
import type { User, UserRole } from "../types/user.types";

const PAGE_SIZE = 10;
const SORT = "createdAt:desc";

interface UserListPageProps {
  role: UserRole;
  icon: LucideIcon;
  /** Si se muestra el botón "Progreso" en la columna de acciones (solo
   *  tiene sentido para estudiantes). */
  showProgress: boolean;
  tourStorageKey: string;
}

// Listado de cuentas de una sola audiencia (Estudiantes o Docentes). Antes
// era una sola tabla con columna "Rol" y un filtro para alternar entre
// ambas; ahora que cada audiencia vive en su propio módulo del sidebar, el
// rol es fijo (no hay nada que filtrar) y esa columna ya no aporta nada.
export function UserListPage({
  role,
  icon,
  showProgress,
  tourStorageKey,
}: UserListPageProps) {
  const language = useLanguageStore((state) => state.language);
  const isStudents = role === "STUDENT";

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(""),
  );
  const [dateRange, setDateRange] = useQueryState(
    "joined",
    parseAsString.withDefault(""),
  );

  const [createdFrom, createdTo] = dateRange.split("_");
  const hasActiveFilters = search !== "" || status !== "" || dateRange !== "";

  function handleClearFilters() {
    setSearch("");
    setStatus("");
    setDateRange("");
    setPage(1);
  }

  const { data, isLoading } = useUsers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sort: SORT,
    role,
    isActive: status === "" ? undefined : status === "active",
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
  });

  const tourSteps = useMemo<DriveStep[]>(() => {
    if (isLoading) {
      return [];
    }

    return [
      {
        element: '[data-tour="search"]',
        popover: {
          title: language === "en" ? "Search" : "Buscar",
          description:
            language === "en"
              ? "Find an account by name or email."
              : "Encuentra una cuenta por nombre o correo.",
        },
      },
      {
        element: '[data-tour="filter-status"]',
        popover: {
          title: language === "en" ? "Filter by status" : "Filtrar por estado",
          description:
            language === "en"
              ? "Show only active accounts or only inactive ones."
              : "Muestra solo cuentas activas o solo inactivas.",
        },
      },
      {
        element: '[data-tour="filter-date"]',
        popover: {
          title: language === "en" ? "Filter by date" : "Filtrar por fecha",
          description:
            language === "en"
              ? "Narrow the list down to a join date range."
              : "Reduce la lista a un rango de fechas de registro.",
        },
      },
      {
        element: '[data-tour="table"]',
        popover: {
          title: language === "en" ? "Accounts" : "Cuentas",
          description: isStudents
            ? language === "en"
              ? "Toggle an account active or check a student's progress from here."
              : "Activa o desactiva una cuenta, o consulta el progreso de un estudiante desde aquí."
            : language === "en"
              ? "Toggle an account active or edit its details from here."
              : "Activa o desactiva una cuenta, o edita sus datos desde aquí.",
        },
      },
    ];
  }, [isLoading, isStudents, language]);

  const { start: startTour } = usePageTour({
    steps: tourSteps,
    storageKey: tourStorageKey,
  });

  const columns: ColumnDef<User, unknown>[] = [
    {
      id: "name",
      header: () => (
        <div className="flex items-center gap-1">
          <span>{language === "en" ? "Name" : "Nombre"}</span>
          <ColumnFilter
            type="text"
            data-tour="search"
            triggerLabel={language === "en" ? "Filter by name" : "Filtrar por nombre"}
            popoverTitle={language === "en" ? "Name" : "Nombre"}
            value={search}
            onApply={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder={
              language === "en"
                ? "Search by name or email..."
                : "Buscar por nombre o correo..."
            }
            clearLabel={language === "en" ? "Clear" : "Limpiar"}
            applyLabel={language === "en" ? "Apply" : "Aplicar"}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <UserAvatar
            name={row.original.name}
            avatarUrl={row.original.avatarUrl}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {row.original.name} {row.original.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "isActive",
      header: () => (
        <div className="flex items-center gap-1">
          <span>{language === "en" ? "Status" : "Estado"}</span>
          <ColumnFilter
            type="select"
            data-tour="filter-status"
            triggerLabel={
              language === "en" ? "Filter by status" : "Filtrar por estado"
            }
            popoverTitle={language === "en" ? "Status" : "Estado"}
            value={status}
            onApply={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[
              { value: "active", label: language === "en" ? "Active" : "Activo" },
              {
                value: "inactive",
                label: language === "en" ? "Inactive" : "Inactivo",
              },
            ]}
            clearLabel={language === "en" ? "Clear" : "Limpiar"}
            applyLabel={language === "en" ? "Apply" : "Aplicar"}
          />
        </div>
      ),
      cell: ({ row }) => <UserStatusToggle user={row.original} />,
    },
    {
      id: "createdAt",
      header: language === "en" ? "Joined" : "Registrado",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString(
          language === "en" ? "en-US" : "es-SV",
          { year: "numeric", month: "short", day: "numeric" },
        ),
    },
    {
      id: "actions",
      header: language === "en" ? "Actions" : "Acciones",
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {showProgress && row.original.role === "STUDENT" && (
            <Link
              href={`/teacher/users/${row.original.id}/progress`}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "rounded-full",
              )}
            >
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
              {language === "en" ? "Progress" : "Progreso"}
            </Link>
          )}
          <EditUserModal
            user={row.original}
            trigger={
              <Button variant="outline" size="sm" className="rounded-full">
                <SquarePen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                {language === "en" ? "Edit" : "Editar"}
              </Button>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={icon}
        title={
          isStudents
            ? language === "en"
              ? "Students"
              : "Estudiantes"
            : language === "en"
              ? "Teachers"
              : "Docentes"
        }
      />

      <PageTourBanner
        title={
          language === "en" ? "Get to know this section" : "Conoce esta sección"
        }
        description={
          isStudents
            ? language === "en"
              ? "Search students, filter by status or join date, and check their progress."
              : "Busca estudiantes, fíltralos por estado o fecha de registro, y consulta su progreso."
            : language === "en"
              ? "Search teachers and filter by status or join date."
              : "Busca docentes y fíltralos por estado o fecha de registro."
        }
        buttonLabel={language === "en" ? "Take the tour" : "Ver tour guiado"}
        onStart={startTour}
      />

      <div data-tour="table">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          emptyMessage={
            isStudents
              ? language === "en"
                ? "No students found."
                : "No se encontraron estudiantes."
              : language === "en"
                ? "No teachers found."
                : "No se encontraron docentes."
          }
          toolbar={
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <DateRangeFilter
                data-tour="filter-date"
                value={dateRange}
                onApply={(value) => {
                  setDateRange(value);
                  setPage(1);
                }}
                placeholder={language === "en" ? "Join date" : "Fecha de registro"}
                popoverTitle={language === "en" ? "Join date" : "Fecha de registro"}
                clearLabel={language === "en" ? "Clear" : "Limpiar"}
                applyLabel={language === "en" ? "Apply" : "Aplicar"}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                className="w-full sm:w-auto"
              >
                <FilterX className="h-4 w-4" aria-hidden="true" />
                {language === "en" ? "Clear filters" : "Limpiar filtros"}
              </Button>
            </div>
          }
          footer={
            data && <PaginationControls meta={data.meta} onPageChange={setPage} />
          }
        />
      </div>
    </div>
  );
}
