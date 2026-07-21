"use client";

import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { History } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useSpeakingResultsByArea } from "../hooks/use-speaking-results-by-area";

interface SpeakingHistoryListProps {
  protectedAreaId: string;
}

function scoreColorClass(score: number) {
  if (score >= 8) return "bg-success-soft text-success-soft-foreground";
  if (score >= 5) return "bg-warning-soft text-warning-soft-foreground";
  return "bg-danger-soft text-danger-soft-foreground";
}

/** Historial de intentos anteriores del estudiante en esta área ("n
 * intentos" — cada envío queda guardado, no reemplaza al anterior). */
export function SpeakingHistoryList({
  protectedAreaId,
}: SpeakingHistoryListProps) {
  const language = useLanguageStore((state) => state.language);
  const { data, isLoading } = useSpeakingResultsByArea(protectedAreaId, {
    limit: 10,
    sort: "createdAt:desc",
  });

  if (isLoading || !data || data.items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <History className="h-4 w-4 text-muted" aria-hidden="true" />
        {language === "en" ? "Previous attempts" : "Intentos anteriores"}
      </div>

      <ul className="flex flex-col gap-2">
        {data.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">
                {item.transcription}
              </p>
              <p className="text-xs text-muted">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                  locale: language === "en" ? enUS : es,
                })}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${scoreColorClass(item.score)}`}
            >
              {item.score}/10
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
