"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { DriveStep } from "driver.js";
import { TrendingUp } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { PageTourBanner } from "@/components/layout/page-tour-banner";
import { usePageTour } from "@/hooks/use-page-tour";
import { useStudentProgressOverview } from "@/features/student-progress/hooks/use-student-progress-overview";
import { StudentProgressOverview } from "@/features/student-progress/components/student-progress-overview";

export default function StudentProgressPage() {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";

  // Misma query que StudentProgressOverview (misma key): react-query la
  // comparte, así que no hay request extra. Solo sirve para saber si ya hay
  // tarjetas que resaltar en el tour.
  const { data, isLoading } = useStudentProgressOverview({ limit: 100 });
  const hasAreas = !isLoading && (data?.items.length ?? 0) > 0;

  const tourSteps = useMemo<DriveStep[]>(() => {
    if (!hasAreas) {
      return [];
    }

    return [
      {
        element: '[data-tour="progress-list"]',
        popover: {
          title: en ? "Your areas" : "Tus áreas",
          description: en
            ? "One card per protected area, with everything you've done in it."
            : "Una tarjeta por área protegida, con todo lo que has hecho en ella.",
        },
      },
      {
        element: '[data-tour="progress-list"] > :first-child > a',
        popover: {
          title: en ? "Area and overall progress" : "Área y avance general",
          description: en
            ? "The photo shows the area, how many steps you've completed and your overall percentage. Tap it to open the area."
            : "La foto muestra el área, cuántos pasos has completado y tu porcentaje general. Tócala para abrir el área.",
        },
      },
      {
        element: '[data-tour="progress-list"] > :first-child > div',
        popover: {
          title: en ? "Status of each stage" : "Estado de cada etapa",
          description: en
            ? "FlashCards, Speaking, Chatbot and Test, each with a quick detail (best score, chats, attempts). A green check means it's done; a lock means the teacher hasn't set it up yet."
            : "FlashCards, Speaking, Chatbot y Examen, cada una con un detalle rápido (mejor nota, chats, intentos). Un check verde significa que ya la completaste; un candado, que tu docente aún no la configura.",
        },
      },
    ];
  }, [hasAreas, en]);

  const { start: startTour } = usePageTour({
    steps: tourSteps,
    storageKey: "student-progress",
  });

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === "en" ? "My progress" : "Mi progreso"}
          </h1>
          <p className="text-sm text-muted">
            {language === "en"
              ? "Everything you've done in each protected area."
              : "Todo lo que has hecho en cada área protegida."}
          </p>
        </div>
      </motion.div>

      {hasAreas && (
        <PageTourBanner
          title={en ? "Not sure how to read this? Take the tour" : "¿No sabes cómo leer esto? Haz el tour"}
          description={
            en
              ? "Learn what each card, percentage and stage status means."
              : "Aprende qué significa cada tarjeta, porcentaje y estado de etapa."
          }
          buttonLabel={en ? "Take the tour" : "Ver tour guiado"}
          onStart={startTour}
        />
      )}

      <StudentProgressOverview />
    </div>
  );
}
