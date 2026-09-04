"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Spinner } from "@heroui/react";
import type { DriveStep } from "driver.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPinned, Search } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { PageHeader } from "@/components/layout/page-header";
import { PageTourBanner } from "@/components/layout/page-tour-banner";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePageTour } from "@/hooks/use-page-tour";
import { useProtectedAreas } from "@/features/protected-areas/hooks/use-protected-areas";
import { ProtectedAreaCard } from "@/features/protected-areas/components/protected-area-card";

const PAGE_SIZE = 12;

export default function TeacherProtectedAreasPage() {
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

  const { data, isLoading } = useProtectedAreas({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sort,
    isPublished: status === "" ? undefined : status === "published",
  });

  const tourSteps = useMemo<DriveStep[]>(() => {
    if (isLoading) {
      return [];
    }

    return [
      {
        element: '[data-tour="action"]',
        popover: {
          title: language === "en" ? "New area" : "Nueva área",
          description:
            language === "en"
              ? "Create a new protected area for students to explore."
              : "Crea una nueva área protegida para que los estudiantes la exploren.",
        },
      },
      {
        element: '[data-tour="search"]',
        popover: {
          title: language === "en" ? "Search" : "Buscar",
          description:
            language === "en"
              ? "Find an area by name."
              : "Encuentra un área por nombre.",
        },
      },
      {
        element: '[data-tour="filter-status"]',
        popover: {
          title: language === "en" ? "Filter by status" : "Filtrar por estado",
          description:
            language === "en"
              ? "Show only published areas or only drafts."
              : "Muestra solo áreas publicadas o solo borradores.",
        },
      },
      {
        element: '[data-tour="grid"]',
        popover: {
          title: language === "en" ? "Areas" : "Áreas",
          description:
            language === "en"
              ? "Open \"Manage\" on any card to edit its content, or unpublish it."
              : "Abre \"Manage\" en cualquier tarjeta para editar su contenido o despublicarla.",
        },
      },
    ];
  }, [isLoading, language]);

  const { start: startTour } = usePageTour({
    steps: tourSteps,
    storageKey: "teacher-protected-areas",
  });

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={MapPinned}
        title={language === "en" ? "Protected Areas" : "Áreas protegidas"}
      />

      <PageTourBanner
        title={
          language === "en"
            ? "Learn to manage your areas"
            : "Aprende a administrar tus áreas"
        }
        description={
          language === "en"
            ? "Browse the list, filter by status, and create new protected areas."
            : "Explora el listado, filtra por estado y crea nuevas áreas protegidas."
        }
        buttonLabel={language === "en" ? "Take the tour" : "Ver tour guiado"}
        onStart={startTour}
      />

      <div className="flex justify-end">
        <Link href="/teacher/protected-areas/new" data-tour="action">
          <Button>{language === "en" ? "New area" : "Nueva área"}</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            data-tour="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              language === "en" ? "Search areas..." : "Buscar áreas..."
            }
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={status || "all"}
            onValueChange={(value) => {
              setStatus(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger data-tour="filter-status" className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === "en" ? "All statuses" : "Todos los estados"}
              </SelectItem>
              <SelectItem value="published">
                {language === "en" ? "Published" : "Publicadas"}
              </SelectItem>
              <SelectItem value="draft">
                {language === "en" ? "Draft" : "Borrador"}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">
                {language === "en" ? "Newest first" : "Más recientes"}
              </SelectItem>
              <SelectItem value="createdAt:asc">
                {language === "en" ? "Oldest first" : "Más antiguas"}
              </SelectItem>
              <SelectItem value="name:asc">
                {language === "en" ? "Name (A-Z)" : "Nombre (A-Z)"}
              </SelectItem>
              <SelectItem value="name:desc">
                {language === "en" ? "Name (Z-A)" : "Nombre (Z-A)"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="md" />
        </div>
      ) : data && data.items.length > 0 ? (
        <div
          data-tour="grid"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {data.items.map((area) => (
            <ProtectedAreaCard key={area.id} area={area} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {language === "en"
            ? "No protected areas found."
            : "No se encontraron áreas protegidas."}
        </div>
      )}

      {data && <PaginationControls meta={data.meta} onPageChange={setPage} />}
    </div>
  );
}
