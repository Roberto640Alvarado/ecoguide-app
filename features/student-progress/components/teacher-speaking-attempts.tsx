"use client";

import { useState } from "react";
import { Spinner } from "@heroui/react";
import { ChevronDown, Mic } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useSpeakingResultsForStudent } from "@/features/speaking-results/hooks/use-speaking-results-for-student";

interface TeacherSpeakingAttemptsProps {
  studentId: string;
  protectedAreaId: string;
}

function scoreColorClass(score: number) {
  if (score >= 8) return "bg-success-soft text-success-soft-foreground";
  if (score >= 5) return "bg-warning-soft text-warning-soft-foreground";
  return "bg-danger-soft text-danger-soft-foreground";
}

/** Panel del docente: intentos de speaking de un estudiante, con
 * transcripción, retroalimentación de IA y audio, expandibles uno a uno. */
export function TeacherSpeakingAttempts({
  studentId,
  protectedAreaId,
}: TeacherSpeakingAttemptsProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading } = useSpeakingResultsForStudent(
    studentId,
    protectedAreaId,
    { limit: 20, sort: "createdAt:desc" },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner size="sm" />
      </div>
    );
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <p className="py-3 text-sm text-muted">
        {en ? "No speaking attempts yet." : "Todavía no hay intentos de speaking."}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const isExpanded = expandedId === item.id;

        return (
          <li
            key={item.id}
            className="rounded-xl border border-border bg-surface"
          >
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Mic className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <p className="truncate text-sm text-foreground">
                  {item.transcription}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${scoreColorClass(item.score)}`}
                >
                  {item.score}/10
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </div>
            </button>
            {isExpanded && (
              <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-muted">
                    {en ? "Transcription" : "Transcripción"}
                  </p>
                  <p className="text-foreground">{item.transcription}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted">
                    {en ? "AI feedback" : "Retroalimentación de IA"}
                  </p>
                  <p className="text-foreground">{item.feedback}</p>
                </div>
                <a
                  href={item.audioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit text-xs font-medium text-accent hover:underline"
                >
                  {en ? "Listen to audio" : "Escuchar audio"}
                </a>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
