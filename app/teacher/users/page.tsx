"use client";

import { useEffect, useState } from "react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@heroui/react";
import { Search, SquarePen, Users as UsersIcon } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { DataTable } from "@/components/ui/data-table";
import { SortableHeader } from "@/components/ui/sortable-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useUsers } from "@/features/users/hooks/use-users";
import { UserRoleBadge } from "@/features/users/components/user-role-badge";
import { UserStatusBadge } from "@/features/users/components/user-status-badge";
import { EditUserModal } from "@/features/users/components/edit-user-modal";
import { DeactivateUserButton } from "@/features/users/components/deactivate-user-button";
import type { User, UserRole } from "@/features/users/types/user.types";

const PAGE_SIZE = 10;

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
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault("createdAt:desc"),
  );

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const [sortField, sortOrderRaw] = sort.split(":");
  const sortOrder: "asc" | "desc" = sortOrderRaw === "asc" ? "asc" : "desc";

  const { data, isLoading } = useUsers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sort,
    role: (role || undefined) as UserRole | undefined,
  });

  function handleSortChange(field: string) {
    if (sortField === field) {
      setSort(`${field}:${sortOrder === "asc" ? "desc" : "asc"}`);
    } else {
      setSort(`${field}:asc`);
    }
    setPage(1);
  }

  const columns: ColumnDef<User, unknown>[] = [
    {
      id: "name",
      header: () => (
        <SortableHeader
          label={language === "en" ? "Name" : "Nombre"}
          field="name"
          currentSort={{ field: sortField, order: sortOrder }}
          onSortChange={handleSortChange}
        />
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
            <p className="truncate text-xs text-muted">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: language === "en" ? "Role" : "Rol",
      cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
    },
    {
      id: "isActive",
      header: language === "en" ? "Status" : "Estado",
      cell: ({ row }) => <UserStatusBadge isActive={row.original.isActive} />,
    },
    {
      id: "createdAt",
      header: () => (
        <SortableHeader
          label={language === "en" ? "Joined" : "Registrado"}
          field="createdAt"
          currentSort={{ field: sortField, order: sortOrder }}
          onSortChange={handleSortChange}
        />
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString(
          language === "en" ? "en-US" : "es-SV",
          { year: "numeric", month: "short", day: "numeric" },
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <EditUserModal
            user={row.original}
            trigger={
              <Button
                variant="outline"
                size="sm"
                aria-label={language === "en" ? "Edit" : "Editar"}
              >
                <SquarePen className="h-4 w-4" aria-hidden="true" />
              </Button>
            }
          />
          <DeactivateUserButton user={row.original} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
          <UsersIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === "en" ? "Students & teachers" : "Estudiantes y docentes"}
          </h1>
          <p className="text-sm text-muted">
            {language === "en"
              ? "View, edit and deactivate platform accounts."
              : "Consulta, edita y desactiva cuentas de la plataforma."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              language === "en"
                ? "Search by name or email..."
                : "Buscar por nombre o correo..."
            }
            className="input w-full pl-9"
          />
        </div>

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="input sm:w-52"
        >
          <option value="">
            {language === "en" ? "All roles" : "Todos los roles"}
          </option>
          <option value="STUDENT">
            {language === "en" ? "Students" : "Estudiantes"}
          </option>
          <option value="TEACHER">
            {language === "en" ? "Teachers" : "Docentes"}
          </option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage={
          language === "en" ? "No users found." : "No se encontraron usuarios."
        }
      />

      {data && <PaginationControls meta={data.meta} onPageChange={setPage} />}
    </div>
  );
}
