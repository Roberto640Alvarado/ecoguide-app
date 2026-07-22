"use client";

import { motion } from "framer-motion";
import { MessagesSquare, MapPinned, BookOpen } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StudentProgressSummary } from "@/features/student-progress/components/student-progress-summary";

const cards = [
  {
    icon: MessagesSquare,
    en: {
      title: "Practice conversations",
      description: "Answer questions and give directions like a real tour guide.",
    },
    es: {
      title: "Practica conversaciones",
      description: "Responde preguntas y da direcciones como un guía turístico real.",
    },
  },
  {
    icon: MapPinned,
    en: {
      title: "Protected areas quiz",
      description: "Test your knowledge about each protected area.",
    },
    es: {
      title: "Quiz de áreas protegidas",
      description: "Pon a prueba tus conocimientos sobre cada área protegida.",
    },
  },
  {
    icon: BookOpen,
    en: { title: "FlashCards", description: "Review vocabulary at your own pace." },
    es: {
      title: "FlashCards",
      description: "Repasa vocabulario a tu propio ritmo.",
    },
  },
];

export default function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const language = useLanguageStore((state) => state.language);

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-8"
      >
        <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="lg" />
        <div>
          <p className="text-sm font-semibold text-accent">
            {language === "en" ? "Student panel" : "Panel de estudiante"}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            {language === "en" ? "Welcome" : "Bienvenido"}
            {user ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
            {language === "en"
              ? "This is an example of your future student dashboard. Practice modules will appear here as they become available."
              : "Este es un ejemplo de tu futuro panel de estudiante. Los módulos de práctica aparecerán aquí a medida que estén disponibles."}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const copy = card[language];
          return (
            <motion.div
              key={copy.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="relative flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
            >
              <span className="absolute right-4 top-4 rounded-full bg-default-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {language === "en" ? "Coming soon" : "Próximamente"}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-base font-semibold text-foreground">
                {copy.title}
              </h3>
              <p className="text-sm text-muted">{copy.description}</p>
            </motion.div>
          );
        })}
      </div>

      <StudentProgressSummary />
    </div>
  );
}
