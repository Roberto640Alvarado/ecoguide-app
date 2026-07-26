"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "@heroui/react";
import { TrendingUp } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useStudentProgressOverviewForStudent } from "../hooks/use-student-progress-overview-for-student";
import { StudentProgressAreaCard } from "./student-progress-area-card";
import { TeacherAreaListRow } from "./teacher-area-list-row";
import { TeacherAreaDrillDown } from "./teacher-area-drill-down";

interface TeacherStudentProgressListProps {
  studentId: string;
}

/**
 * Vista del docente sobre el avance de un estudiante. En pantallas grandes
 * (lg+) usa un layout maestro/detalle: lista compacta de áreas a la
 * izquierda y el detalle completo (drill-down) a la derecha, aprovechando el
 * ancho disponible en vez de dejarlo en blanco. En pantallas angostas cae de
 * vuelta a un acordeón vertical (misma tarjeta que expande su propio
 * detalle debajo al hacer clic).
 */
export function TeacherStudentProgressList({
  studentId,
}: TeacherStudentProgressListProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
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
          {en
            ? "No protected areas available yet."
            : "Todavía no hay áreas protegidas disponibles."}
        </p>
      </div>
    );
  }

  const selectedProgress =
    items.find((item) => item.protectedAreaId === selectedAreaId) ?? items[0];

  return (
    <div className="flex flex-col gap-6">
      {isDesktop ? (
        <div className="flex items-start gap-5">
          <div className="flex w-[300px] shrink-0 flex-col gap-3 rounded-2xl border border-border bg-surface-secondary/30 p-3 xl:w-[320px]">
            <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {en ? "Protected areas" : "Áreas protegidas"} · {items.length}
            </p>
            <div className="flex flex-col gap-2">
              {items.map((progress, index) => (
                <TeacherAreaListRow
                  key={progress.protectedAreaId}
                  progress={progress}
                  index={index}
                  isSelected={selectedProgress.protectedAreaId === progress.protectedAreaId}
                  onSelect={() => setSelectedAreaId(progress.protectedAreaId)}
                />
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProgress.protectedAreaId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <StudentProgressAreaCard
                  progress={selectedProgress}
                  index={0}
                  disableLink
                  expanded
                  showExpandIndicator={false}
                  stepsColumns={4}
                />
                <div className="-mt-2 overflow-hidden rounded-b-2xl border border-t-0 border-border bg-surface">
                  <TeacherAreaDrillDown
                    studentId={studentId}
                    progress={selectedProgress}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((progress, index) => {
            const isExpanded = expandedAreaId === progress.protectedAreaId;

            return (
              <div key={progress.protectedAreaId}>
                <StudentProgressAreaCard
                  progress={progress}
                  index={index}
                  disableLink
                  expanded={isExpanded}
                  onClick={() =>
                    setExpandedAreaId(
                      isExpanded ? null : progress.protectedAreaId,
                    )
                  }
                />
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={progress.protectedAreaId}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="-mt-2 overflow-hidden rounded-b-2xl border border-t-0 border-border bg-surface"
                    >
                      <TeacherAreaDrillDown
                        studentId={studentId}
                        progress={progress}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
