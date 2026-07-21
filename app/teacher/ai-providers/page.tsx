"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@heroui/react";
import { Cpu, Eye, Search, SquarePen } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { DataTable } from "@/components/ui/data-table";
import { SortableHeader } from "@/components/ui/sortable-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAIProviders } from "@/features/ai-providers/hooks/use-ai-providers";
import { ProviderStatusBadge } from "@/features/ai-providers/components/provider-status-badge";
import { CreateProviderModal } from "@/features/ai-providers/components/create-provider-modal";
import { EditProviderModal } from "@/features/ai-providers/components/edit-provider-modal";
import { DeactivateProviderButton } from "@/features/ai-providers/components/deactivate-provider-button";
import type { AIProvider } from "@/features/ai-providers/types/ai-provider.types";

const PAGE_SIZE = 10;

export default function TeacherAIProvidersPage() {
  const language = useLanguageStore((state) => state.language);

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

  const { data, isLoading } = useAIProviders({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sort,
    isActive: status === "" ? undefined : status === "active",
  });

  function handleSortChange(field: string) {
    if (sortField === field) {
      setSort(`${field}:${sortOrder === "asc" ? "desc" : "asc"}`);
    } else {
      setSort(`${field}:asc`);
    }
    setPage(1);
  }

  const columns: ColumnDef<AIProvider, unknown>[] = [
    {
      id: "providerName",
      header: () => (
        <SortableHeader
          label={language === "en" ? "Provider" : "Proveedor"}
          field="providerName"
          currentSort={{ field: sortField, order: sortOrder }}
          onSortChange={handleSortChange}
        />
      ),
      cell: ({ row }) => (
        <Link
          href={`/teacher/ai-providers/${row.original.id}`}
          className="flex items-center gap-3 hover:underline"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
            <Cpu className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-medium text-foreground">
            {row.original.providerName}
          </span>
        </Link>
      ),
    },
    {
      id: "models",
      header: language === "en" ? "Models" : "Modelos",
      cell: ({ row }) => (
        <span className="text-muted">
          {row.original.models.length}{" "}
          {language === "en" ? "models" : "modelos"}
        </span>
      ),
    },
    {
      id: "isActive",
      header: language === "en" ? "Status" : "Estado",
      cell: ({ row }) => (
        <ProviderStatusBadge isActive={row.original.isActive} />
      ),
    },
    {
      id: "createdAt",
      header: () => (
        <SortableHeader
          label={language === "en" ? "Created" : "Creado"}
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
          <Link href={`/teacher/ai-providers/${row.original.id}`}>
            <Button
              variant="outline"
              size="sm"
              aria-label={language === "en" ? "View models" : "Ver modelos"}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <EditProviderModal
            provider={row.original}
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
          <DeactivateProviderButton provider={row.original} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
            <Cpu className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === "en" ? "AI Providers" : "Proveedores de IA"}
            </h1>
            <p className="text-sm text-muted">
              {language === "en"
                ? "Configure providers and their model catalog."
                : "Configura los proveedores y su catálogo de modelos."}
            </p>
          </div>
        </div>
        <CreateProviderModal
          trigger={
            <Button variant="primary">
              {language === "en" ? "New provider" : "Nuevo proveedor"}
            </Button>
          }
        />
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
                ? "Search providers..."
                : "Buscar proveedores..."
            }
            className="input w-full pl-9"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input sm:w-48"
        >
          <option value="">
            {language === "en" ? "All statuses" : "Todos los estados"}
          </option>
          <option value="active">
            {language === "en" ? "Active" : "Activos"}
          </option>
          <option value="inactive">
            {language === "en" ? "Inactive" : "Inactivos"}
          </option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage={
          language === "en"
            ? "No providers found."
            : "No se encontraron proveedores."
        }
      />

      {data && <PaginationControls meta={data.meta} onPageChange={setPage} />}
    </div>
  );
}
