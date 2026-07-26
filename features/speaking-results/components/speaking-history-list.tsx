"use client";

import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { CalendarClock, MessagesSquare, Sparkles } from "lucide-react";
import { Spinner } from "@heroui/react";
import { FormModal } from "@/components/ui/form-modal";
import { useLanguageStore } from "@/store/language-store";
import { useSpeakingResultsByArea } from "../hooks/use-speaking-results-by-area";
import { SpeakingTurnBubble } from "./speaking-turn-bubble";
import type { SpeakingResult } from "../types/speaking-result.types";

interface SpeakingHistoryListProps {
  protectedAreaId: string;
}

function scoreColorClass(score: number) {
  if (score >= 8) return "bg-success-soft text-success-soft-foreground";
  if (score >= 5) return "bg-warning-soft text-warning-soft-foreground";
  return "bg-danger-soft text-danger-soft-foreground";
}

function PracticeDetail({
  item,
  studentLabel,
}: {
  item: SpeakingResult;
  studentLabel: string;
}) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";

  return (
    <div className="flex flex-col gap-5">
      {item.feedback && (
        <div className="flex flex-col gap-2 rounded-2xl border border-accent/30 bg-accent-soft/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              {en ? "AI feedback" : "Retroalimentación de IA"}
            </div>
            {item.score !== null && (
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${scoreColorClass(item.score)}`}
              >
                {item.score}/10
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            {item.feedback}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {item.turns.map((turn) => (
          <SpeakingTurnBubble
            key={turn.id}
            turn={turn}
            studentLabel={studentLabel}
          />
        ))}
      </div>
    </div>
  );
}

/** Historial de llamadas anteriores del estudiante en esta área (solo las
 * finalizadas, que son las que tienen calificación) — cada una abre un
 * modal con la conversación completa y la retroalimentación de la IA. */
export function SpeakingHistoryList({
  protectedAreaId,
}: SpeakingHistoryListProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const studentLabel = en ? "You" : "Tú";
  const { data, isLoading } = useSpeakingResultsByArea(protectedAreaId, {
    limit: 12,
    sort: "startedAt:desc",
  });

  const finishedItems = (data?.items ?? []).filter(
    (item) => item.endedAt !== null,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <MessagesSquare className="h-4 w-4 text-muted" aria-hidden="true" />
        {en ? "Past practices" : "Prácticas pasadas"}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="sm" />
        </div>
      ) : finishedItems.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface-secondary/40 px-6 py-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted">
            <CalendarClock className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm text-muted">
            {en
              ? "You haven't finished a call in this area yet. Once you do, you'll see the transcript and feedback here."
              : "Todavía no has finalizado una llamada en esta área. Cuando lo hagas, verás aquí la transcripción y la retroalimentación."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {finishedItems.map((item) => {
            const studentTurns = item.turns.filter(
              (turn) => turn.role === "user",
            ).length;

            return (
              <FormModal
                key={item.id}
                size="lg"
                title={en ? "Practice call" : "Llamada de práctica"}
                trigger={
                  <button
                    type="button"
                    className="flex h-full w-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-accent/40 hover:bg-accent-soft/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                        <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                        {formatDistanceToNow(new Date(item.startedAt), {
                          addSuffix: true,
                          locale: en ? enUS : es,
                        })}
                      </span>
                      {item.score !== null && (
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${scoreColorClass(item.score)}`}
                        >
                          {item.score}/10
                        </span>
                      )}
                    </div>

                    <p className="line-clamp-2 text-sm text-foreground">
                      {item.feedback ??
                        (en
                          ? "No feedback available."
                          : "Sin retroalimentación disponible.")}
                    </p>

                    <p className="mt-auto text-xs font-medium text-muted">
                      {en
                        ? `${studentTurns} turn${studentTurns === 1 ? "" : "s"} · View conversation`
                        : `${studentTurns} turno${studentTurns === 1 ? "" : "s"} · Ver conversación`}
                    </p>
                  </button>
                }
              >
                {() => (
                  <PracticeDetail item={item} studentLabel={studentLabel} />
                )}
              </FormModal>
            );
          })}
        </div>
      )}
    </div>
  );
}
