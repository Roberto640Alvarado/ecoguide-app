"use client";

import { Spinner } from "@heroui/react";
import { TrendingUp } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useStudentProgressOverview } from "../hooks/use-student-progress-overview";
import { StudentProgressAreaCard } from "./student-progress-area-card";
import { BadgeUnlockWatcher } from "./badge-unlock-watcher";

/**
 * Lista completa del avance del estudiante en cada área protegida publicada
 * (flashcards, speaking, chatbot, examen) — la vista de "todo lo que ha
 * hecho" que pidió el estudiante, un nivel de detalle más profundo que la
 * barra compacta del listado de áreas.
 */
export function StudentProgressOverview() {
  const language = useLanguageStore((state) => state.language);
  const { data, isLoading } = useStudentProgressOverview({ limit: 100 });

  const items = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="md" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-surface-secondary/40 py-16 text-center">
        <TrendingUp className="h-8 w-8 text-muted" aria-hidden="true" />
        <p className="text-sm text-muted">
          {language === "en"
            ? "No protected areas available yet."
            : "Todavía no hay áreas protegidas disponibles."}
        </p>
      </div>
    );
  }

  return (
    <>
      <BadgeUnlockWatcher
        protectedAreaIds={items.map((item) => item.protectedAreaId)}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((progress, index) => (
          <StudentProgressAreaCard
            key={progress.protectedAreaId}
            progress={progress}
            index={index}
          />
        ))}
      </div>
    </>
  );
}
