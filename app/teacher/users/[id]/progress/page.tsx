"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/react";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useUser } from "@/features/users/hooks/use-user";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TeacherStudentProgressList } from "@/features/student-progress/components/teacher-student-progress-list";

export default function TeacherStudentProgressPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const { data: student, isLoading } = useUser(params.id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/teacher/users"
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {en ? "Back to users" : "Volver a usuarios"}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <UserAvatar
            name={student?.name}
            avatarUrl={student?.avatarUrl}
            size="md"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isLoading
              ? en
                ? "Loading..."
                : "Cargando..."
              : `${student?.name} ${student?.lastName}`}
          </h1>
          <p className="text-sm text-muted">
            {en ? "Progress by protected area" : "Avance por área protegida"}
          </p>
        </div>
      </motion.div>

      {!isLoading && student?.role === "TEACHER" ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-surface-secondary/40 py-16 text-center">
          <TrendingUp className="h-8 w-8 text-muted" aria-hidden="true" />
          <p className="text-sm text-muted">
            {en
              ? "Progress tracking only applies to students."
              : "El seguimiento de avance solo aplica a estudiantes."}
          </p>
        </div>
      ) : (
        <TeacherStudentProgressList studentId={params.id} />
      )}
    </div>
  );
}
