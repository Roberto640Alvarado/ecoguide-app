"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

/** Panel del docente: llamadas de speaking de un estudiante (multi-turno),
 * con turnos y retroalimentación de IA expandibles una a una. */
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
    { limit: 20, sort: "startedAt:desc" },
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
        {en ? "No speaking calls yet." : "Todavía no hay llamadas de speaking."}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => {
        const isExpanded = expandedId === item.id;
        const isFinished = item.endedAt !== null;
        const studentTurnsCount = item.turns.filter(
          (turn) => turn.role === "user",
        ).length;

        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index, 8) * 0.04 }}
            className="overflow-hidden rounded-xl border border-border bg-surface"
          >
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-layer-hover"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning-soft-foreground">
                  <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <p className="truncate text-sm text-foreground">
                  {en
                    ? `${studentTurnsCount} turn${studentTurnsCount === 1 ? "" : "s"}`
                    : `${studentTurnsCount} turno${studentTurnsCount === 1 ? "" : "s"}`}
                  {!isFinished &&
                    (en ? " · in progress" : " · en progreso")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {item.score !== null && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${scoreColorClass(item.score)}`}
                  >
                    {item.score}/10
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted">
                        {en ? "Transcript" : "Transcripción"}
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {item.turns.map((turn) => (
                          <li key={turn.id} className="leading-relaxed">
                            <span className="font-semibold text-foreground">
                              {turn.role === "assistant"
                                ? "EcoGuía: "
                                : en
                                  ? "Student: "
                                  : "Estudiante: "}
                            </span>
                            <span className="text-foreground">
                              {turn.message}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {item.feedback && (
                      <div className="rounded-xl bg-accent-soft/50 p-3">
                        <p className="text-xs font-semibold text-accent-soft-foreground">
                          {en ? "AI feedback" : "Retroalimentación de IA"}
                        </p>
                        <p className="text-foreground">{item.feedback}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </ul>
  );
}
