"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@heroui/react";
import { ArrowLeft, ImageOff, Medal, Search, SquarePen } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useBadges } from "@/features/badges/hooks/use-badges";
import { RemoveBadgeButton } from "@/features/badges/components/remove-badge-button";
import type { Badge } from "@/features/badges/types/badge.types";

const PAGE_SIZE = 10;

export default function TeacherBadgesPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const { data: area } = useProtectedArea(params.id);

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [search, setSearch] = useQueryState(
    "search",
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

  const { data, isLoading } = useBadges({
    protectedAreaId: params.id,
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sort,
  });

  const columns: ColumnDef<Badge, unknown>[] = [
    {
      id: "name",
      header: language === "en" ? "Badge" : "Insignia",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-default-soft">
            {row.original.imageUrl ? (
              <Image
                src={row.original.imageUrl}
                alt=""
                fill
                sizes="40px"
                className="object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageOff className="h-4 w-4 text-muted" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="min-w-0 max-w-xs sm:max-w-sm lg:max-w-md">
            <p className="truncate font-medium text-foreground">
              {row.original.name}
            </p>
            <p className="truncate text-xs text-muted">
              {row.original.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "message",
      header: language === "en" ? "Message to student" : "Mensaje al estudiante",
      cell: ({ row }) => (
        <p className="max-w-xs truncate text-sm text-muted">
          {row.original.message}
        </p>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/teacher/protected-areas/${params.id}/badges/${row.original.id}/edit`}
          >
            <Button
              variant="outline"
              size="sm"
              aria-label={language === "en" ? "Edit" : "Editar"}
            >
              <SquarePen className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <RemoveBadgeButton badge={row.original} protectedAreaId={params.id} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/teacher/protected-areas"
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to protected areas" : "Volver a áreas protegidas"}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
            <Medal className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === "en" ? "Badges" : "Insignias"}
            </h1>
            <p className="text-sm text-muted">
              {area
                ? area.name
                : language === "en"
                  ? "Loading area..."
                  : "Cargando área..."}
            </p>
          </div>
        </div>
        <Link href={`/teacher/protected-areas/${params.id}/badges/new`}>
          <Button variant="primary">
            {language === "en" ? "New badge" : "Nueva insignia"}
          </Button>
        </Link>
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
              language === "en" ? "Search badges..." : "Buscar insignias..."
            }
            className="input w-full pl-9"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="input sm:w-52"
        >
          <option value="createdAt:desc">
            {language === "en" ? "Newest first" : "Más recientes"}
          </option>
          <option value="name:asc">
            {language === "en" ? "Name (A-Z)" : "Nombre (A-Z)"}
          </option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage={
          language === "en"
            ? "No badges found for this area."
            : "No se encontraron insignias para esta área."
        }
      />

      {data && <PaginationControls meta={data.meta} onPageChange={setPage} />}
    </div>
  );
}
