"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { ColumnDef } from "@tanstack/react-table";
import type { DriveStep } from "driver.js";
import { Button } from "@/components/ui/button";
import { ColumnFilter } from "@/components/ui/column-filter";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { Cpu, FilterX, Plus, SquarePen } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { PageHeader } from "@/components/layout/page-header";
import { PageTourBanner } from "@/components/layout/page-tour-banner";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePageTour } from "@/hooks/use-page-tour";
import { useAIProviders } from "@/features/ai-providers/hooks/use-ai-providers";
import { CreateProviderModal } from "@/features/ai-providers/components/create-provider-modal";
import { EditProviderModal } from "@/features/ai-providers/components/edit-provider-modal";
import { ProviderStatusToggle } from "@/features/ai-providers/components/provider-status-toggle";
import type { AIProvider } from "@/features/ai-providers/types/ai-provider.types";

const PAGE_SIZE = 10;
const SORT = "createdAt:desc";

export default function TeacherAIProvidersPage() {
  const language = useLanguageStore((state) => state.language);
  const router = useRouter();

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
    "created",
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

  const { data, isLoading } = useAIProviders({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sort: SORT,
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
        element: '[data-tour="action"]',
        popover: {
          title: language === "en" ? "New provider" : "Nuevo proveedor",
          description:
            language === "en"
              ? "Connect a new AI provider and its model catalog."
              : "Conecta un nuevo proveedor de IA y su catálogo de modelos.",
        },
      },
      {
        element: '[data-tour="search"]',
        popover: {
          title: language === "en" ? "Search" : "Buscar",
          description:
            language === "en"
              ? "Find a provider by name."
              : "Encuentra un proveedor por nombre.",
        },
      },
      {
        element: '[data-tour="filter-status"]',
        popover: {
          title: language === "en" ? "Filter by status" : "Filtrar por estado",
          description:
            language === "en"
              ? "Show only active providers or only inactive ones."
              : "Muestra solo proveedores activos o solo inactivos.",
        },
      },
      {
        element: '[data-tour="filter-date"]',
        popover: {
          title: language === "en" ? "Filter by date" : "Filtrar por fecha",
          description:
            language === "en"
              ? "Narrow the list down to a creation date range."
              : "Reduce la lista a un rango de fechas de creación.",
        },
      },
      {
        element: '[data-tour="table"]',
        popover: {
          title: language === "en" ? "Providers" : "Proveedores",
          description:
            language === "en"
              ? "Click a row to see its models, edit its configuration, or toggle it active/inactive."
              : "Haz click en una fila para ver sus modelos, editar su configuración o activarla/desactivarla.",
        },
      },
    ];
  }, [isLoading, language]);

  const { start: startTour } = usePageTour({
    steps: tourSteps,
    storageKey: "teacher-ai-providers",
  });

  const columns: ColumnDef<AIProvider, unknown>[] = [
    {
      id: "providerName",
      header: () => (
        <div className="flex items-center gap-1">
          <span>{language === "en" ? "Provider" : "Proveedor"}</span>
          <ColumnFilter
            type="text"
            data-tour="search"
            triggerLabel={
              language === "en" ? "Filter by provider" : "Filtrar por proveedor"
            }
            popoverTitle={language === "en" ? "Provider" : "Proveedor"}
            value={search}
            onApply={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder={
              language === "en"
                ? "Search providers..."
                : "Buscar proveedores..."
            }
            clearLabel={language === "en" ? "Clear" : "Limpiar"}
            applyLabel={language === "en" ? "Apply" : "Aplicar"}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Cpu className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-medium text-foreground">
            {row.original.providerName}
          </span>
        </div>
      ),
    },
    {
      id: "models",
      header: language === "en" ? "Models" : "Modelos",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.models.length}{" "}
          {language === "en" ? "models" : "modelos"}
        </span>
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
      cell: ({ row }) => <ProviderStatusToggle provider={row.original} />,
    },
    {
      id: "createdAt",
      header: language === "en" ? "Created" : "Creado",
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
        <div className="flex items-center justify-center">
          <EditProviderModal
            provider={row.original}
            trigger={
              <Button variant="outline" size="sm">
                <SquarePen className="h-4 w-4" aria-hidden="true" />
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
        icon={Cpu}
        title={language === "en" ? "AI Providers" : "Proveedores de IA"}
      />

      <PageTourBanner
        title={
          language === "en"
            ? "Set up your AI providers"
            : "Configura tus proveedores de IA"
        }
        description={
          language === "en"
            ? "Search providers, filter by status or creation date, and add a new one."
            : "Busca proveedores, fíltralos por estado o fecha de creación, y agrega uno nuevo."
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
            language === "en"
              ? "No providers found."
              : "No se encontraron proveedores."
          }
          onRowClick={(row) => router.push(`/teacher/ai-providers/${row.id}`)}
          interactiveColumnIds={["actions", "isActive"]}
          toolbar={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <DateRangeFilter
                  data-tour="filter-date"
                  value={dateRange}
                  onApply={(value) => {
                    setDateRange(value);
                    setPage(1);
                  }}
                  placeholder={
                    language === "en" ? "Created date" : "Fecha de creación"
                  }
                  popoverTitle={
                    language === "en" ? "Created date" : "Fecha de creación"
                  }
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
              <CreateProviderModal
                trigger={
                  <Button data-tour="action" className="w-full sm:w-auto">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {language === "en" ? "New provider" : "Nuevo proveedor"}
                  </Button>
                }
              />
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
