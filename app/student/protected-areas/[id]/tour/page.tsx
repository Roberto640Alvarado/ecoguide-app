"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button, Spinner, toast } from "@heroui/react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bot,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Lock,
  Medal,
  MessagesSquare,
  Share2,
  Sparkles,
} from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useStudentAreaProgress } from "@/features/student-progress/hooks/use-student-area-progress";
import { useEarnedAreaBadges } from "@/features/student-progress/hooks/use-earned-area-badges";
import { useCheckAreaBadges } from "@/features/student-progress/hooks/use-check-area-badges";
import { useSpeakingResultsByArea } from "@/features/speaking-results/hooks/use-speaking-results-by-area";
import { BadgeUnlockDialog } from "@/features/badges/components/badge-unlock-dialog";
import type { Badge } from "@/features/badges/types/badge.types";
import type { StudentAreaProgress } from "@/features/student-progress/types/student-progress.types";
import {
  useTranslatedText,
  useTranslatedTexts,
} from "@/features/translation/hooks/use-translated-texts";

type StepStatus = "locked" | "available" | "done" | "unconfigured";

interface TourStepDef {
  key: "flashCards" | "speaking" | "chatbot" | "test";
  icon: typeof BookOpen;
  title: { en: string; es: string };
  description: { en: string; es: string };
  href: string;
  available: boolean;
  done: boolean;
}

interface ComputedStep extends TourStepDef {
  status: StepStatus;
}

/**
 * Encadena el estado de cada paso: un paso solo se desbloquea si todos los
 * anteriores ya están hechos (o no aplican porque el área no los tiene
 * configurados) — así el estudiante avanza en orden y "Nota" solo se
 * desbloquea cuando de verdad terminó todo el recorrido.
 */
function computeSteps(defs: TourStepDef[]): {
  steps: ComputedStep[];
  allSatisfied: boolean;
} {
  let previousSatisfied = true;

  const steps = defs.map((def) => {
    let status: StepStatus;

    if (!def.available) {
      status = "unconfigured";
    } else if (!previousSatisfied) {
      status = "locked";
    } else if (def.done) {
      status = "done";
    } else {
      status = "available";
    }

    previousSatisfied = previousSatisfied && (!def.available || def.done);

    return { ...def, status };
  });

  return { steps, allSatisfied: previousSatisfied };
}

function buildStepDefs(
  protectedAreaId: string,
  progress: StudentAreaProgress,
): TourStepDef[] {
  return [
    {
      key: "flashCards",
      icon: BookOpen,
      href: `/student/protected-areas/${protectedAreaId}/flash-cards`,
      available: progress.flashCards.available,
      done: progress.flashCards.completed,
      title: { en: "FlashCards", es: "FlashCards" },
      description: {
        en: "Learn key vocabulary and facts about this area.",
        es: "Aprende vocabulario clave y datos sobre esta área.",
      },
    },
    {
      key: "speaking",
      icon: MessagesSquare,
      href: `/student/protected-areas/${protectedAreaId}/speaking-practice`,
      available: progress.speaking.available,
      done: progress.speaking.finished > 0,
      title: { en: "Speaking practice", es: "Práctica de speaking" },
      description: {
        en: "Record yourself and get AI feedback on your pronunciation.",
        es: "Grábate y recibe retroalimentación de IA sobre tu pronunciación.",
      },
    },
    {
      key: "chatbot",
      icon: Bot,
      href: `/student/protected-areas/${protectedAreaId}/chatbot`,
      available: progress.chatbot.available,
      done: progress.chatbot.finishedConversations > 0,
      title: { en: "Chatbot", es: "Chatbot" },
      description: {
        en: "Hold a real conversation as a tour guide for this area.",
        es: "Sostén una conversación real como guía turístico de esta área.",
      },
    },
    {
      key: "test",
      icon: ClipboardCheck,
      href: `/student/protected-areas/${protectedAreaId}/test`,
      available: progress.test.available,
      done: progress.test.passed,
      title: { en: "Test", es: "Examen" },
      description: {
        en: "Answer a short quiz to check what you've learned.",
        es: "Responde un examen corto para comprobar lo que aprendiste.",
      },
    },
  ];
}

function scoreColorClass(score: number) {
  if (score >= 8) return "bg-success-soft text-success-soft-foreground";
  if (score >= 5) return "bg-warning-soft text-warning-soft-foreground";
  return "bg-danger-soft text-danger-soft-foreground";
}

function EarnedBadgeItem({ badge }: { badge: Badge }) {
  const translatedName = useTranslatedText(badge.name);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <div
          className="absolute inset-0 -z-10 rounded-full bg-warning-soft blur-xl"
          aria-hidden="true"
        />
        {badge.imageUrl ? (
          <Image
            src={badge.imageUrl}
            alt={badge.name}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full border-4 border-surface object-contain shadow-lg"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface bg-warning-soft text-warning-soft-foreground shadow-lg">
            <Medal className="h-8 w-8" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-foreground">
        {translatedName}
      </p>
    </div>
  );
}

export default function StudentAreaTourPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";

  const { data: area, isLoading: isLoadingArea } = useProtectedArea(params.id);
  const { data: progress, isLoading: isLoadingProgress } =
    useStudentAreaProgress(params.id);
  const { data: earnedBadges } = useEarnedAreaBadges(params.id);
  const { data: speakingResults } = useSpeakingResultsByArea(params.id, {
    limit: 20,
    sort: "startedAt:desc",
  });
  const { mutate: checkAreaBadges } = useCheckAreaBadges();
  const [translatedAreaName, translatedFirstBadgeName] = useTranslatedTexts([
    area?.name ?? "",
    earnedBadges?.[0]?.name ?? "",
  ]);

  const [justUnlocked, setJustUnlocked] = useState<Badge[]>([]);
  const hasCheckedRef = useRef(false);

  const isLoading = isLoadingArea || isLoadingProgress;
  // Equivalente a stepsCompleted === stepsTotal (ver computeSteps más abajo)
  // — se calcula acá por separado solo para no mover ese cálculo antes del
  // useEffect.
  const isTourComplete = (progress?.progressPercent ?? 0) === 100;

  useEffect(() => {
    if (!isTourComplete || hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    checkAreaBadges(params.id, {
      onSuccess: (result) => {
        if (result.justUnlocked.length > 0) {
          setJustUnlocked(result.justUnlocked);
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTourComplete, params.id]);

  async function handleShare() {
    if (!area) return;

    const badgeName = earnedBadges?.[0]?.name ? translatedFirstBadgeName : null;
    const text = badgeName
      ? en
        ? `I completed the ${translatedAreaName} tour on EcoGuide and earned the "${badgeName}" badge! 🏆🌿`
        : `¡Completé el recorrido de ${translatedAreaName} en EcoGuide y obtuve la insignia "${badgeName}"! 🏆🌿`
      : en
        ? `I completed the ${translatedAreaName} tour on EcoGuide! 🌿`
        : `¡Completé el recorrido de ${translatedAreaName} en EcoGuide! 🌿`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "EcoGuide", text });
      } catch {
        // El usuario canceló el share — no es un error a reportar.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(
        en ? "Copied to clipboard!" : "¡Copiado al portapapeles!",
      );
    } catch {
      toast.danger(
        en ? "Couldn't share right now." : "No se pudo compartir en este momento.",
      );
    }
  }

  const { steps, allSatisfied } =
    progress && progress.stepsTotal > 0
      ? computeSteps(buildStepDefs(params.id, progress))
      : { steps: [], allSatisfied: false };
  const notaUnlocked = progress ? progress.stepsTotal > 0 && allSatisfied : false;

  const bestSpeakingResult =
    progress && progress.speaking.bestScore !== null
      ? (speakingResults?.items.find(
          (item) => item.score === progress.speaking.bestScore,
        ) ?? null)
      : null;
  const translatedSpeakingFeedback = useTranslatedText(
    bestSpeakingResult?.feedback ?? "",
  );

  return (
    <div className="flex flex-col gap-6">
      <BadgeUnlockDialog
        badge={justUnlocked[0] ?? null}
        onClose={() => setJustUnlocked((prev) => prev.slice(1))}
      />

      <Link
        href={`/student/protected-areas/${params.id}`}
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {en ? "Back to area" : "Volver al área"}
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
            {en ? "Guided tour" : "Recorrido guiado"}
          </h1>
          <p className="text-sm text-muted">
            {isLoadingArea
              ? en
                ? "Loading area..."
                : "Cargando área..."
              : translatedAreaName}
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
            {en
              ? "Complete each stage in order to unlock the next one."
              : "Completa cada etapa en orden para desbloquear la siguiente."}
          </motion.div>

          <ol className="relative flex flex-col gap-6 pl-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const copy = {
                title: step.title[language],
                description: step.description[language],
              };

              const circleClass =
                step.status === "done"
                  ? "border-success bg-success-soft text-success"
                  : step.status === "available"
                    ? "border-accent text-accent"
                    : "border-border text-muted";

              const cardBorderClass =
                step.status === "available"
                  ? "border-accent bg-accent-soft/40 hover:bg-accent-soft/70"
                  : step.status === "done"
                    ? "border-success/40 bg-success-soft/20 hover:bg-success-soft/30"
                    : "border-border bg-surface";

              const chip =
                step.status === "done" ? (
                  <span className="flex w-fit shrink-0 items-center gap-1 rounded-full bg-success px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-success-foreground">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    {en ? "Review" : "Revisar"}
                  </span>
                ) : step.status === "available" ? (
                  <span className="flex w-fit shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                    {en ? "Start" : "Comenzar"}
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                ) : step.status === "locked" ? (
                  <span className="flex w-fit shrink-0 items-center gap-1 rounded-full bg-default-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    {en ? "Locked" : "Bloqueada"}
                  </span>
                ) : (
                  <span className="w-fit shrink-0 rounded-full bg-default-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {en ? "Not configured" : "No configurada"}
                  </span>
                );

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
                  {chip}
                </>
              );

              const isClickable =
                step.status === "available" || step.status === "done";

              return (
                <motion.li
                  key={step.key}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + index * 0.1 }}
                  className="relative flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-surface ${circleClass}`}
                    >
                      {step.status === "done" ? (
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      ) : step.status === "locked" ? (
                        <Lock className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                    <motion.span
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      style={{ transformOrigin: "top" }}
                      className="mt-1 w-0.5 flex-1 bg-border"
                    />
                  </div>

                  {isClickable ? (
                    <Link
                      href={step.href}
                      className={`flex flex-1 flex-col gap-1 rounded-2xl border p-4 pb-6 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${cardBorderClass}`}
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <div
                      className={`flex flex-1 flex-col gap-1 rounded-2xl border p-4 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${cardBorderClass}`}
                    >
                      {cardContent}
                    </div>
                  )}
                </motion.li>
              );
            })}

            {/* Nota — resumen final, solo se desbloquea al terminar todo lo anterior */}
            <motion.li
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + steps.length * 0.1 }}
              className="relative flex gap-4"
            >
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-surface ${
                    notaUnlocked
                      ? "border-success bg-success-soft text-success"
                      : "border-border text-muted"
                  }`}
                >
                  <Award className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>

              {notaUnlocked ? (
                <div className="flex flex-1 flex-col gap-5 rounded-2xl border border-success/40 bg-success-soft/10 p-5 sm:p-6">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-success">
                      {en ? "Tour completed!" : "¡Recorrido completado!"}
                    </p>
                    {earnedBadges && earnedBadges.length > 0 ? (
                      <div className="flex flex-wrap items-center justify-center gap-4">
                        {earnedBadges.map((badge) => (
                          <EarnedBadgeItem key={badge.id} badge={badge} />
                        ))}
                      </div>
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-default-soft text-muted">
                        <Medal className="h-7 w-7" aria-hidden="true" />
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {progress?.speaking.available && (
                      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                            <MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" />
                            Speaking
                          </span>
                          {progress.speaking.bestScore !== null && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-bold ${scoreColorClass(progress.speaking.bestScore)}`}
                            >
                              {progress.speaking.bestScore}/10
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground">
                          {bestSpeakingResult?.feedback
                            ? translatedSpeakingFeedback
                            : en
                              ? "No feedback available yet."
                              : "Todavía no hay retroalimentación."}
                        </p>
                      </div>
                    )}

                    {progress?.test.available && (
                      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            {en ? "Test" : "Examen"}
                          </span>
                          {progress.test.bestScore !== null && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-bold ${scoreColorClass(progress.test.bestScore)}`}
                            >
                              {progress.test.bestScore}/{progress.test.passingScore}
                            </span>
                          )}
                        </div>
                        <p className="flex items-center gap-1.5 text-sm text-foreground">
                          {progress.test.passed ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                              {en ? "Passed" : "Aprobado"}
                            </>
                          ) : (
                            en ? "Not passed" : "No aprobado"
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    className="gap-1.5 self-center"
                    onPress={handleShare}
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    {en ? "Share achievement" : "Compartir logro"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-1 flex-col gap-1 rounded-2xl border border-border bg-surface p-4 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {en ? "Grade" : "Nota"}
                    </h3>
                    <p className="text-xs text-muted sm:text-sm">
                      {en
                        ? "See your final score and revisit the tour anytime."
                        : "Consulta tu calificación final y repasa el recorrido cuando quieras."}
                    </p>
                  </div>
                  <span className="flex w-fit shrink-0 items-center gap-1 rounded-full bg-default-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    {en ? "Locked" : "Bloqueada"}
                  </span>
                </div>
              )}
            </motion.li>
          </ol>
        </>
      )}
    </div>
  );
}
