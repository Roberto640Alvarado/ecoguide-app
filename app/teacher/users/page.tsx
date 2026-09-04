"use client";

import { useMemo } from "react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { ColumnDef } from "@tanstack/react-table";
import type { DriveStep } from "driver.js";
import { Button, buttonVariants } from "@/components/ui/button";
import { ColumnFilter } from "@/components/ui/column-filter";
import { SquarePen, TrendingUp, Users as UsersIcon } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { PageHeader } from "@/components/layout/page-header";
import { PageTourBanner } from "@/components/layout/page-tour-banner";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { UserAvatar } from "@/components/ui/user-avatar";
import { usePageTour } from "@/hooks/use-page-tour";
import { useUsers } from "@/features/users/hooks/use-users";
import { UserRoleBadge } from "@/features/users/components/user-role-badge";
import { UserStatusBadge } from "@/features/users/components/user-status-badge";
import { EditUserModal } from "@/features/users/components/edit-user-modal";
import { UserStatusToggle } from "@/features/users/components/user-status-toggle";
import type { User, UserRole } from "@/features/users/types/user.types";

const PAGE_SIZE = 10;
const SORT = "createdAt:desc";

export default function TeacherUsersPage() {
  const language = useLanguageStore((state) => state.language);

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [role, setRole] = useQueryState("role", parseAsString.withDefault(""));

  const { data, isLoading } = useUsers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sort: SORT,
    role: (role || undefined) as UserRole | undefined,
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
              ? "Find a student or teacher by name or email."
              : "Encuentra un estudiante o docente por nombre o correo.",
        },
      },
      {
        element: '[data-tour="filter-role"]',
        popover: {
          title: language === "en" ? "Filter by role" : "Filtrar por rol",
          description:
            language === "en"
              ? "Narrow the list down to students or teachers only."
              : "Reduce la lista solo a estudiantes o solo a docentes.",
        },
      },
      {
        element: '[data-tour="table"]',
        popover: {
          title: language === "en" ? "Accounts" : "Cuentas",
          description:
            language === "en"
              ? "Sort by name or join date, edit an account, or deactivate it from here."
              : "Ordena por nombre o fecha de registro, edita una cuenta o desactívala desde aquí.",
        },
      },
    ];
  }, [isLoading, language]);

  const { start: startTour } = usePageTour({
    steps: tourSteps,
    storageKey: "teacher-users",
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
      id: "role",
      header: () => (
        <div className="flex items-center gap-1">
          <span>{language === "en" ? "Role" : "Rol"}</span>
          <ColumnFilter
            type="select"
            data-tour="filter-role"
            triggerLabel={language === "en" ? "Filter by role" : "Filtrar por rol"}
            popoverTitle={language === "en" ? "Role" : "Rol"}
            value={role}
            onApply={(value) => {
              setRole(value);
              setPage(1);
            }}
            options={[
              {
                value: "STUDENT",
                label: language === "en" ? "Student" : "Estudiante",
              },
              {
                value: "TEACHER",
                label: language === "en" ? "Teacher" : "Docente",
              },
            ]}
            clearLabel={language === "en" ? "Clear" : "Limpiar"}
            applyLabel={language === "en" ? "Apply" : "Aplicar"}
          />
        </div>
      ),
      cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
    },
    {
      id: "isActive",
      header: language === "en" ? "Status" : "Estado",
      cell: ({ row }) => <UserStatusBadge isActive={row.original.isActive} />,
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {row.original.role === "STUDENT" && (
            <Link
              href={`/teacher/users/${row.original.id}/progress`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              {language === "en" ? "Progress" : "Progreso"}
            </Link>
          )}
          <EditUserModal
            user={row.original}
            trigger={
              <Button variant="outline" size="sm">
                <SquarePen className="h-4 w-4" aria-hidden="true" />
                {language === "en" ? "Edit" : "Editar"}
              </Button>
            }
          />
          <UserStatusToggle user={row.original} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={UsersIcon}
        title={language === "en" ? "Students & teachers" : "Estudiantes y docentes"}
      />

      <PageTourBanner
        title={
          language === "en" ? "Get to know this section" : "Conoce esta sección"
        }
        description={
          language === "en"
            ? "Search accounts, filter by role, and manage students and teachers."
            : "Busca cuentas, fíltralas por rol y gestiona a estudiantes y docentes."
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
            language === "en" ? "No users found." : "No se encontraron usuarios."
          }
          footer={
            data && <PaginationControls meta={data.meta} onPageChange={setPage} />
          }
        />
      </div>
    </div>
  );
}
