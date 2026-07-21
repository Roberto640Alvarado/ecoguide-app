"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, MapPinned, SquarePen } from "lucide-react";
import { Button } from "@heroui/react";
import { useLanguageStore } from "@/store/language-store";
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
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border bg-surface">
      <div className="relative h-36 w-full bg-accent-soft">
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
        <div className="absolute right-3 top-3">
          <ProtectedAreaStatusBadge isPublished={area.isPublished} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-foreground">{area.name}</h3>
          <p className="line-clamp-2 text-sm text-muted">{area.description}</p>
        </div>

        <p className="text-xs text-muted">
          {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}
        </p>

        <div className="mt-auto flex items-center justify-end gap-2 pt-2">
          <Link href={`/teacher/protected-areas/${area.id}/flash-cards`}>
            <Button
              variant="outline"
              size="sm"
              aria-label={language === "en" ? "FlashCards" : "FlashCards"}
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <PublishAreaButton area={area} />
          <Link href={`/teacher/protected-areas/${area.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              aria-label={language === "en" ? "Edit" : "Editar"}
            >
              <SquarePen className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <UnpublishAreaButton area={area} />
        </div>
      </div>
    </div>
  );
}
