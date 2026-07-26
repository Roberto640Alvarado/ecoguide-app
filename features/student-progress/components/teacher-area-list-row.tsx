"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, MapPinned } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import type { StudentAreaProgress } from "../types/student-progress.types";

interface TeacherAreaListRowProps {
  progress: StudentAreaProgress;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * Fila compacta de un área para el panel maestro/detalle del docente en
 * pantallas grandes (ver TeacherStudentProgressList): sirve de selector en
 * una lista lateral angosta, mientras el detalle completo se muestra en el
 * panel derecho.
 */
export function TeacherAreaListRow({
  progress,
  index,
  isSelected,
  onSelect,
}: TeacherAreaListRowProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.05 }}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.99 }}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
        isSelected
          ? "border-accent/50 bg-accent-soft/40 shadow-sm"
          : "border-border bg-surface hover:bg-layer-hover"
      }`}
    >
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-accent-soft">
        {progress.areaImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={progress.areaImage}
            alt={progress.areaName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <MapPinned
              className="h-5 w-5 text-accent-soft-foreground"
              aria-hidden="true"
            />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {progress.areaName}
        </p>
        <p className="truncate text-xs text-muted">
          {progress.stepsCompleted}/{progress.stepsTotal}{" "}
          {en ? "steps" : "pasos"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {progress.progressPercent === 100 ? (
          <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
        ) : (
          <span className="text-xs font-bold text-foreground">
            {progress.progressPercent}%
          </span>
        )}
        <ChevronRight
          className={`h-4 w-4 shrink-0 transition-colors ${
            isSelected ? "text-accent" : "text-muted"
          }`}
          aria-hidden="true"
        />
      </div>
    </motion.button>
  );
}
