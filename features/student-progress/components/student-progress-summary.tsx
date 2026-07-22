"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useStudentProgressOverview } from "../hooks/use-student-progress-overview";

/**
 * Widget compacto para el dashboard: resume cuántas áreas empezó/terminó el
 * estudiante y enlaza a la vista completa (/student/progress) con el
 * detalle por área.
 */
export function StudentProgressSummary() {
  const language = useLanguageStore((state) => state.language);
  const { data, isLoading } = useStudentProgressOverview({ limit: 100 });

  const items = data?.items ?? [];
  const areasStarted = items.filter((item) => item.stepsCompleted > 0).length;
  const areasCompleted = items.filter(
    (item) => item.stepsTotal > 0 && item.stepsCompleted === item.stepsTotal,
  ).length;

  return (
    <Link href="/student/progress" className="block">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:bg-layer-hover"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success-soft-foreground">
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground">
            {language === "en" ? "Your progress" : "Tu progreso"}
          </h3>
          <p className="text-sm text-muted">
            {isLoading
              ? language === "en"
                ? "Loading..."
                : "Cargando..."
              : language === "en"
                ? `${areasStarted} area(s) started · ${areasCompleted} completed`
                : `${areasStarted} área(s) iniciadas · ${areasCompleted} completadas`}
          </p>
        </div>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-muted"
          aria-hidden="true"
        />
      </motion.div>
    </Link>
  );
}
