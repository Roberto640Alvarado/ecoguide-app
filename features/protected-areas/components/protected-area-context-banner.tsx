"use client";

import { MapPinned } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { stripHtmlToText } from "@/lib/utils/rich-text";
import type { ProtectedArea } from "../types/protected-area.types";

interface ProtectedAreaContextBannerProps {
  area: ProtectedArea;
}

/**
 * Banner de contexto que se muestra arriba de los formularios de config de
 * Speaking Practice y Chatbot: le recuerda al docente para qué área
 * protegida está escribiendo el prompt, ya que ambos config son 1:1 por
 * área y el resto de instrucciones las agrega el propio docente sabiendo
 * de qué área se trata.
 */
export function ProtectedAreaContextBanner({
  area,
}: ProtectedAreaContextBannerProps) {
  const language = useLanguageStore((state) => state.language);

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface-secondary/50 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
        <MapPinned className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {language === "en"
            ? "Context for this configuration"
            : "Contexto de esta configuración"}
        </p>
        <p className="text-sm font-semibold text-foreground">{area.name}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">
          {stripHtmlToText(area.description)}
        </p>
      </div>
    </div>
  );
}
