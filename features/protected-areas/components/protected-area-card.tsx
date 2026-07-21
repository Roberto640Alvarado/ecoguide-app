"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { BookOpen, MapPin, MapPinned, SquarePen } from "lucide-react";
import { Button } from "@heroui/react";
import { useLanguageStore } from "@/store/language-store";
import { stripHtmlToText } from "@/lib/utils/rich-text";
import { ProtectedAreaStatusBadge } from "./protected-area-status-badge";
import { UnpublishAreaButton } from "./unpublish-area-button";
import { PublishAreaButton } from "./publish-area-button";
import type { ProtectedArea } from "../types/protected-area.types";

interface ProtectedAreaCardProps {
  area: ProtectedArea;
}

export function ProtectedAreaCard({ area }: ProtectedAreaCardProps) {
  const language = useLanguageStore((state) => state.language);
  const coverImage = area.images[0];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
      {/* Portada: foto + título/descripción superpuestos, con degradado
          para que el texto blanco sea legible sobre cualquier imagen. */}
      <div className="relative h-48 w-full shrink-0 bg-accent-soft sm:h-52">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={area.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPinned
              className="h-8 w-8 text-accent-soft-foreground"
              aria-hidden="true"
            />
          </div>
        )}

        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold text-white">
              {area.name}
            </h3>
            <ProtectedAreaStatusBadge isPublished={area.isPublished} />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-white/85">
            {stripHtmlToText(area.description)}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-default-soft px-3 py-1 text-xs font-medium text-muted">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}
          </span>
          <span className="text-xs text-muted">
            {language === "en" ? "Updated " : "Actualizada "}
            {formatDistanceToNow(new Date(area.updatedAt), {
              addSuffix: true,
              locale: language === "en" ? enUS : es,
            })}
          </span>
        </div>

        {/* Acciones con ícono + texto visible, pensadas para que cada botón
            se entienda de un vistazo (editar / flashcards / publicar-
            despublicar) en vez de depender solo de un ícono. */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <Link href={`/teacher/protected-areas/${area.id}/flash-cards`}>
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              FlashCards
            </Button>
          </Link>
          <Link href={`/teacher/protected-areas/${area.id}/edit`}>
            <Button variant="outline" size="sm">
              <SquarePen className="h-4 w-4" aria-hidden="true" />
              {language === "en" ? "Edit" : "Editar"}
            </Button>
          </Link>
          <PublishAreaButton area={area} />
          <UnpublishAreaButton area={area} />
        </div>
      </div>
    </div>
  );
}
