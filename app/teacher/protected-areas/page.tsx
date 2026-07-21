"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Button, Spinner } from "@heroui/react";
import { MapPinned, Search } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { PaginationControls } from "@/components/ui/pagination-controls";
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
            <MapPinned className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {language === "en" ? "Protected Areas" : "Áreas protegidas"}
            </h1>
            <p className="text-sm text-muted">
              {language === "en"
                ? "Manage the protected areas students can explore."
                : "Administra las áreas protegidas que los estudiantes pueden explorar."}
            </p>
          </div>
        </div>
        <Link href="/teacher/protected-areas/new">
          <Button variant="primary">
            {language === "en" ? "New area" : "Nueva área"}
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
              language === "en" ? "Search areas..." : "Buscar áreas..."
            }
            className="input w-full pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="input sm:w-44"
          >
            <option value="">
              {language === "en" ? "All statuses" : "Todos los estados"}
            </option>
            <option value="published">
              {language === "en" ? "Published" : "Publicadas"}
            </option>
            <option value="draft">
              {language === "en" ? "Draft" : "Borrador"}
            </option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="input sm:w-44"
          >
            <option value="createdAt:desc">
              {language === "en" ? "Newest first" : "Más recientes"}
            </option>
            <option value="createdAt:asc">
              {language === "en" ? "Oldest first" : "Más antiguas"}
            </option>
            <option value="name:asc">
              {language === "en" ? "Name (A-Z)" : "Nombre (A-Z)"}
            </option>
            <option value="name:desc">
              {language === "en" ? "Name (Z-A)" : "Nombre (Z-A)"}
            </option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="md" />
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((area) => (
            <ProtectedAreaCard key={area.id} area={area} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted">
          {language === "en"
            ? "No protected areas found."
            : "No se encontraron áreas protegidas."}
        </div>
      )}

      {data && <PaginationControls meta={data.meta} onPageChange={setPage} />}
    </div>
  );
}
