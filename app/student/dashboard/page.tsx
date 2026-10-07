"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Medal,
  MessagesSquare,
  Mic,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { useStudentProgressOverview } from "@/features/student-progress/hooks/use-student-progress-overview";
import { useAllEarnedBadges } from "@/features/student-progress/hooks/use-all-earned-badges";
import { StudentProgressAreaCard } from "@/features/student-progress/components/student-progress-area-card";
import { useTranslatedText } from "@/features/translation/hooks/use-translated-texts";
import type { Badge } from "@/features/badges/types/badge.types";

interface StatCardProps {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  accent: "accent" | "success" | "warning" | "default";
  delay: number;
}

const ACCENT_CLASSES: Record<StatCardProps["accent"], string> = {
  accent: "bg-accent-soft text-accent-soft-foreground",
  success: "bg-success-soft text-success-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
  default: "bg-default-soft text-muted",
};

function StatCard({ icon: Icon, label, value, accent, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ACCENT_CLASSES[accent]}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-bold leading-tight text-foreground">
          {value}
        </p>
        <p className="truncate text-xs text-muted">{label}</p>
      </div>
    </motion.div>
  );
}

interface CapabilityCardProps {
  icon: typeof MessagesSquare;
  title: string;
  description: string;
  delay: number;
}

function CapabilityCard({ icon: Icon, title, description, delay }: CapabilityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-secondary/30 p-5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
    </motion.div>
  );
}

export default function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";

  const { data: overview, isLoading: isOverviewLoading } =
    useStudentProgressOverview({ limit: 100 });
  const { data: badges, isLoading: isBadgesLoading } = useAllEarnedBadges();

  const items = overview?.items ?? [];
  const areasStarted = items.filter((item) => item.stepsCompleted > 0).length;
  const areasCompleted = items.filter(
    (item) => item.stepsTotal > 0 && item.stepsCompleted === item.stepsTotal,
  ).length;
  const bestSpeakingScore = items.reduce<number | null>((best, item) => {
    if (item.speaking.bestScore === null) return best;
    if (best === null) return item.speaking.bestScore;
    return Math.max(best, item.speaking.bestScore);
  }, null);
  const badgesCount = badges?.length ?? 0;

  const continueItems = [...items]
    .filter((item) => item.stepsTotal > 0)
    .sort((a, b) => {
      const aInProgress = a.stepsCompleted > 0 && a.stepsCompleted < a.stepsTotal;
      const bInProgress = b.stepsCompleted > 0 && b.stepsCompleted < b.stepsTotal;
      if (aInProgress !== bInProgress) return aInProgress ? -1 : 1;
      return b.progressPercent - a.progressPercent;
    })
    .slice(0, 4);

  // CTA de la nueva sección "todo lo que puedes hacer": si el estudiante ya
  // tiene un área en progreso, lo manda directo a continuar su recorrido
  // (tour, que es quien controla el orden flashcards -> speaking -> chatbot
  // -> test); si no ha empezado ninguna, lo manda a elegir un área.
  const primaryContinueItem = continueItems[0];
  // Fondo del hero: la foto de portada de un área protegida ya cargada en el
  // sistema (la primera, en orden de "continuar", que tenga imagen).
  const heroImage = continueItems.find((item) => item.areaImage)?.areaImage ?? null;
  const capabilitiesCtaHref = primaryContinueItem
    ? `/student/protected-areas/${primaryContinueItem.protectedAreaId}/tour`
    : "/student/protected-areas";
  const capabilitiesCtaLabel = primaryContinueItem
    ? en
      ? `Continue: ${primaryContinueItem.areaName}`
      : `Continuar: ${primaryContinueItem.areaName}`
    : en
      ? "Explore protected areas"
      : "Explorar áreas protegidas";

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="lg" />
          <div>
            <p className="text-sm font-semibold text-accent">
              {en ? "Student panel" : "Panel de estudiante"}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              {en ? "Welcome" : "Bienvenido"}
              {user ? `, ${user.name}` : ""} 👋
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
              {en
                ? "Here's a quick look at your progress across every protected area."
                : "Aquí tienes un vistazo rápido de tu avance en cada área protegida."}
            </p>
          </div>
        </div>
        <Link
          href="/student/progress"
          className="inline-flex shrink-0 items-center gap-1 self-start rounded-full border border-border bg-surface-secondary/40 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-layer-hover sm:self-auto"
        >
          {en ? "View full progress" : "Ver avance completo"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <div className="relative isolate overflow-hidden bg-accent-soft">
          {heroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 -z-20 h-full w-full object-cover sm:left-[35%] sm:w-[65%]"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-b from-surface/95 via-surface/80 to-surface/40 sm:bg-gradient-to-r sm:from-surface sm:from-40% sm:via-surface/70 sm:via-55% sm:to-transparent"
          />
          <div className="relative flex flex-col items-start gap-5 p-6 pb-24 sm:max-w-[60%] sm:p-8 sm:pb-28">
            <div className="max-w-xl">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {en
                ? "Everything you can do in EcoGuide"
                : "Todo lo que puedes hacer en EcoGuide"}
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              {en
                ? "Explore protected areas, chat in English with an AI guide, practice your pronunciation, and learn key vocabulary along the way."
                : "Explora áreas protegidas, conversa en inglés con un guía de IA, practica tu pronunciación y aprende vocabulario clave en el camino."}
            </p>
            </div>
            <Button asChild size="lg">
              <Link href={capabilitiesCtaHref}>
                {capabilitiesCtaLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <svg
            aria-hidden="true"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-[-1px] h-14 w-full fill-current text-surface sm:h-20"
          >
            <path d="M0 70 C 240 130 480 20 760 50 C 1040 80 1240 130 1440 60 L1440 120 L0 120 Z" />
          </svg>
        </div>

        <div className="grid gap-4 px-6 pb-6 sm:grid-cols-3 sm:px-8 sm:pb-8">
          <CapabilityCard
            icon={MessagesSquare}
            title={en ? "Practice real conversations" : "Practica conversaciones reales"}
            description={
              en
                ? "Chat in English with an AI guide about each protected area."
                : "Conversa en inglés con un guía de IA sobre cada área protegida."
            }
            delay={0.1}
          />
          <CapabilityCard
            icon={BookOpen}
            title={en ? "Learn with flashcards" : "Aprende con flashcards"}
            description={
              en
                ? "Review the key vocabulary before each tour."
                : "Repasa el vocabulario clave antes de cada recorrido."
            }
            delay={0.15}
          />
          <CapabilityCard
            icon={Mic}
            title={en ? "Improve your speaking" : "Mejora tu speaking"}
            description={
              en
                ? "Record yourself and get instant feedback from the AI."
                : "Grábate y recibe retroalimentación instantánea de la IA."
            }
            delay={0.2}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label={en ? "Areas started" : "Áreas iniciadas"}
          value={isOverviewLoading ? "…" : areasStarted}
          accent="accent"
          delay={0.05}
        />
        <StatCard
          icon={CheckCircle2}
          label={en ? "Areas completed" : "Áreas completadas"}
          value={isOverviewLoading ? "…" : areasCompleted}
          accent="success"
          delay={0.1}
        />
        <StatCard
          icon={MessagesSquare}
          label={en ? "Best speaking score" : "Mejor speaking"}
          value={
            isOverviewLoading ? "…" : (bestSpeakingScore ?? "—")
          }
          accent="warning"
          delay={0.15}
        />
        <StatCard
          icon={Award}
          label={en ? "Badges earned" : "Insignias obtenidas"}
          value={isBadgesLoading ? "…" : badgesCount}
          accent="default"
          delay={0.2}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {en ? "Keep exploring" : "Sigue explorando"}
          </h2>
          <Link
            href="/student/progress"
            className="text-sm font-medium text-accent hover:underline"
          >
            {en ? "See all" : "Ver todas"}
          </Link>
        </div>

        {continueItems.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {continueItems.map((item, index) => (
              <StudentProgressAreaCard
                key={item.protectedAreaId}
                progress={item}
                index={index}
              />
            ))}
          </div>
        ) : !isOverviewLoading ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-secondary/30 p-6 text-center text-sm text-muted">
            {en
              ? "No protected areas are available yet."
              : "Todavía no hay áreas protegidas disponibles."}
          </div>
        ) : null}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-soft text-warning-soft-foreground">
            <Medal className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="text-base font-semibold text-foreground">
            {en ? "My badges" : "Mis insignias"}
          </h2>
        </div>

        {badgesCount > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-1">
            {badges!.map((badge, index) => (
              <BadgeStripItem key={badge.id} badge={badge} index={index} />
            ))}
          </div>
        ) : !isBadgesLoading ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface-secondary/30 p-6 text-center">
            <Sparkles className="h-6 w-6 text-muted" aria-hidden="true" />
            <p className="text-sm text-muted">
              {en
                ? "Finish a protected area's tour to earn your first badge."
                : "Termina el recorrido de un área protegida para ganar tu primera insignia."}
            </p>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

function BadgeStripItem({ badge, index }: { badge: Badge; index: number }) {
  const translatedName = useTranslatedText(badge.name);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex w-24 shrink-0 flex-col items-center gap-2 text-center"
    >
      {badge.imageUrl ? (
        <Image
          src={badge.imageUrl}
          alt={badge.name}
          width={64}
          height={64}
          className="h-16 w-16 rounded-full border-2 border-surface object-contain shadow-sm"
        />
      ) : (
        <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-surface bg-warning-soft text-warning-soft-foreground shadow-sm">
          <Medal className="h-7 w-7" aria-hidden="true" />
        </span>
      )}
      <p className="line-clamp-2 text-xs font-medium text-foreground">
        {translatedName}
      </p>
    </motion.div>
  );
}
