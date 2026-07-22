"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { StudentProgressOverview } from "@/features/student-progress/components/student-progress-overview";

export default function StudentProgressPage() {
  const language = useLanguageStore((state) => state.language);

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

      <StudentProgressOverview />
    </div>
  );
}
