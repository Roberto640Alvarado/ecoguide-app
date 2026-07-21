"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bot,
  BookOpen,
  ClipboardCheck,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";

interface TourStep {
  icon: typeof BookOpen;
  /** Si está presente, la etapa ya existe y este paso enlaza a su vista en
   * vez de mostrar la insignia "Coming soon". */
  href?: string;
  en: { title: string; description: string };
  es: { title: string; description: string };
}

export default function StudentAreaTourPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const { data: area, isLoading } = useProtectedArea(params.id);

  const STEPS: TourStep[] = [
    {
      icon: BookOpen,
      href: `/student/protected-areas/${params.id}/flash-cards`,
      en: {
        title: "FlashCards",
        description: "Learn key vocabulary and facts about this area.",
      },
      es: {
        title: "FlashCards",
        description: "Aprende vocabulario clave y datos sobre esta área.",
      },
    },
    {
      icon: MessagesSquare,
      href: `/student/protected-areas/${params.id}/speaking-practice`,
      en: {
        title: "Speaking practice",
        description: "Record yourself and get AI feedback on your pronunciation.",
      },
      es: {
        title: "Práctica de speaking",
        description: "Grábate y recibe retroalimentación de IA sobre tu pronunciación.",
      },
    },
    {
      icon: Bot,
      href: `/student/protected-areas/${params.id}/chatbot`,
      en: {
        title: "Chatbot",
        description: "Hold a real conversation as a tour guide for this area.",
      },
      es: {
        title: "Chatbot",
        description: "Sostén una conversación real como guía turístico de esta área.",
      },
    },
    {
      icon: ClipboardCheck,
      href: `/student/protected-areas/${params.id}/test`,
      en: {
        title: "Test",
        description: "Answer a short quiz to check what you've learned.",
      },
      es: {
        title: "Examen",
        description: "Responde un examen corto para comprobar lo que aprendiste.",
      },
    },
    {
      icon: Award,
      en: {
        title: "Grade",
        description: "See your final score and revisit the tour anytime.",
      },
      es: {
        title: "Nota",
        description: "Consulta tu calificación final y repasa el recorrido cuando quieras.",
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/student/protected-areas/${params.id}`}
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to area" : "Volver al área"}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === "en" ? "Guided tour" : "Recorrido guiado"}
          </h1>
          <p className="text-sm text-muted">
            {isLoading ? (
              language === "en" ? (
                "Loading area..."
              ) : (
                "Cargando área..."
              )
            ) : (
              area?.name
            )}
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="md" />
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border border-dashed border-border bg-surface-secondary/40 p-4 text-sm text-muted"
          >
            {language === "en"
              ? "This is a preview of the tour. Each stage will unlock as it becomes available."
              : "Esta es una vista previa del recorrido. Cada etapa se irá habilitando a medida que esté disponible."}
          </motion.div>

          <ol className="relative flex flex-col gap-6 pl-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const copy = step[language];
              const isLast = index === STEPS.length - 1;
              const isAvailable = !!step.href;

              const cardContent = (
                <>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {copy.title}
                    </h3>
                    <p className="text-xs text-muted sm:text-sm">
                      {copy.description}
                    </p>
                  </div>
                  {isAvailable ? (
                    <span className="flex w-fit shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                      {language === "en" ? "Start" : "Comenzar"}
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="w-fit shrink-0 rounded-full bg-default-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                      {language === "en" ? "Coming soon" : "Próximamente"}
                    </span>
                  )}
                </>
              );

              return (
                <motion.li
                  key={copy.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + index * 0.1 }}
                  className="relative flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-surface ${
                        isAvailable
                          ? "border-accent text-accent"
                          : "border-border text-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {!isLast && (
                      <motion.span
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                        style={{ transformOrigin: "top" }}
                        className="mt-1 w-0.5 flex-1 bg-border"
                      />
                    )}
                  </div>

                  {isAvailable ? (
                    <Link
                      href={step.href!}
                      className="flex flex-1 flex-col gap-1 rounded-2xl border border-accent bg-accent-soft/40 p-4 pb-6 transition-colors hover:bg-accent-soft/70 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <div className="flex flex-1 flex-col gap-1 rounded-2xl border border-border bg-surface p-4 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      {cardContent}
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
