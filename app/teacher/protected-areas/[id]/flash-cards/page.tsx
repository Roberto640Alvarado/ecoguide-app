"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@heroui/react";
import { ArrowLeft, BookOpen, ImageOff, Search, SquarePen } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useFlashCards } from "@/features/flash-cards/hooks/use-flash-cards";
import { FlashCardAvatar } from "@/features/flash-cards/components/flash-card-avatar";
import { FlashCardTypeBadge } from "@/features/flash-cards/components/flash-card-type-badge";
import { RemoveFlashCardButton } from "@/features/flash-cards/components/remove-flash-card-button";
import {
  FLASH_CARD_TYPES,
  FLASH_CARD_TYPE_LABELS,
  type FlashCard,
  type FlashCardType,
} from "@/features/flash-cards/types/flash-card.types";

const PAGE_SIZE = 10;

export default function TeacherFlashCardsPage() {
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
  const [type, setType] = useQueryState("type", parseAsString.withDefault(""));
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault("order:asc"),
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

  const { data, isLoading } = useFlashCards({
    protectedAreaId: params.id,
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sort,
    type: (type || undefined) as FlashCardType | undefined,
  });

  const columns: ColumnDef<FlashCard, unknown>[] = [
    {
      id: "title",
      header: language === "en" ? "Flashcard" : "Flashcard",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-default-soft">
            {row.original.image ? (
              <Image
                src={row.original.image}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageOff className="h-4 w-4 text-muted" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {row.original.title}
            </p>
            <p className="truncate text-xs text-muted">{row.original.content}</p>
          </div>
        </div>
      ),
    },
    {
      id: "type",
      header: language === "en" ? "Category" : "Categoría",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FlashCardAvatar
            type={row.original.type}
            className="h-7 w-7 shrink-0 rounded-full bg-accent-soft object-contain"
          />
          <FlashCardTypeBadge type={row.original.type} />
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/teacher/protected-areas/${params.id}/flash-cards/${row.original.id}/edit`}
          >
            <Button
              variant="outline"
              size="sm"
              aria-label={language === "en" ? "Edit" : "Editar"}
            >
              <SquarePen className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <RemoveFlashCardButton
            flashCard={row.original}
            protectedAreaId={params.id}
          />
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
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">FlashCards</h1>
            <p className="text-sm text-muted">
              {area
                ? area.name
                : language === "en"
                  ? "Loading area..."
                  : "Cargando área..."}
            </p>
          </div>
        </div>
        <Link href={`/teacher/protected-areas/${params.id}/flash-cards/new`}>
          <Button variant="primary">
            {language === "en" ? "New flashcard" : "Nueva flashcard"}
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
              language === "en" ? "Search flashcards..." : "Buscar flashcards..."
            }
            className="input w-full pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="input sm:w-52"
          >
            <option value="">
              {language === "en" ? "All categories" : "Todas las categorías"}
            </option>
            {FLASH_CARD_TYPES.map((flashCardType) => (
              <option key={flashCardType} value={flashCardType}>
                {FLASH_CARD_TYPE_LABELS[flashCardType][language]}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="input sm:w-44"
          >
            <option value="order:asc">
              {language === "en" ? "Category order" : "Orden de categoría"}
            </option>
            <option value="title:asc">
              {language === "en" ? "Title (A-Z)" : "Título (A-Z)"}
            </option>
            <option value="createdAt:desc">
              {language === "en" ? "Newest first" : "Más recientes"}
            </option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        emptyMessage={
          language === "en"
            ? "No flashcards found for this area."
            : "No se encontraron flashcards para esta área."
        }
      />

      {data && <PaginationControls meta={data.meta} onPageChange={setPage} />}
    </div>
  );
}
