"use client";

import { useState } from "react";
import { Spinner } from "@heroui/react";
import { TrendingUp } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useStudentProgressOverviewForStudent } from "../hooks/use-student-progress-overview-for-student";
import { StudentProgressAreaCard } from "./student-progress-area-card";
import { TeacherAreaDrillDown } from "./teacher-area-drill-down";

interface TeacherStudentProgressListProps {
  studentId: string;
}

/**
 * Vista del docente sobre el avance de un estudiante: mismas tarjetas por
 * área que la vista del estudiante, pero al hacer clic expanden el detalle
 * (qué respondió) en vez de navegar.
 */
export function TeacherStudentProgressList({
  studentId,
}: TeacherStudentProgressListProps) {
  const language = useLanguageStore((state) => state.language);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);
  const { data, isLoading } = useStudentProgressOverviewForStudent(
    studentId,
    { limit: 100 },
  );

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
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((progress, index) => {
        const isExpanded = expandedAreaId === progress.protectedAreaId;

        return (
          <div key={progress.protectedAreaId} className="lg:col-span-1">
            <StudentProgressAreaCard
              progress={progress}
              index={index}
              disableLink
              onClick={() =>
                setExpandedAreaId(
                  isExpanded ? null : progress.protectedAreaId,
                )
              }
            />
            {isExpanded && (
              <div className="-mt-2 rounded-b-2xl border border-t-0 border-border bg-surface">
                <TeacherAreaDrillDown
                  studentId={studentId}
                  progress={progress}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
