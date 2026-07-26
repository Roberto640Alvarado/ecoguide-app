"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  MapPin,
  MapPinned,
  Medal,
  MessageCircle,
  Mic,
} from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { ProtectedAreaImageCarousel } from "@/features/protected-areas/components/protected-area-image-carousel";
import { useStudentAreaProgress } from "@/features/student-progress/hooks/use-student-area-progress";
import { useEarnedAreaBadges } from "@/features/student-progress/hooks/use-earned-area-badges";
import { richTextDisplayClassName, sanitizeRichText } from "@/lib/utils/rich-text";
import { useTranslatedTexts } from "@/features/translation/hooks/use-translated-texts";

export default function StudentProtectedAreaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const { data: area, isLoading } = useProtectedArea(params.id);
  const { data: progress } = useStudentAreaProgress(params.id);
  const { data: earnedBadges } = useEarnedAreaBadges(params.id);
  const [translatedName, translatedDescriptionHtml] = useTranslatedTexts([
    area?.name ?? "",
    area?.description ?? "",
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="md" />
      </div>
    );
  }

  if (!area) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <MapPinned className="h-8 w-8 text-muted" aria-hidden="true" />
        <p className="text-sm text-muted">
          {en
            ? "Protected area not found."
            : "Área protegida no encontrada."}
        </p>
        <Link
          href="/student/protected-areas"
          className="text-sm font-medium text-accent hover:underline"
        >
          {en ? "Back to areas" : "Volver a áreas"}
        </Link>
      </div>
    );
  }

  const progressPercent = progress?.progressPercent ?? 0;
  const hasStarted = (progress?.stepsCompleted ?? 0) > 0;
  const hasBadge = (earnedBadges?.length ?? 0) > 0;

  const steps = [
    {
      key: "flashCards",
      icon: BookOpen,
      label: en ? "Flashcards" : "Flashcards",
      available: progress?.flashCards.available ?? true,
      done: progress?.flashCards.completed ?? false,
    },
    {
      key: "speaking",
      icon: Mic,
      label: "Speaking",
      available: progress?.speaking.available ?? true,
      done: (progress?.speaking.finished ?? 0) > 0,
    },
    {
      key: "chatbot",
      icon: MessageCircle,
      label: "Chatbot",
      available: progress?.chatbot.available ?? true,
      done: (progress?.chatbot.finishedConversations ?? 0) > 0,
    },
    {
      key: "test",
      icon: ClipboardCheck,
      label: en ? "Final test" : "Examen final",
      available: progress?.test.available ?? true,
      done: progress?.test.passed ?? false,
    },
  ];

  const ctaTitle = hasBadge
    ? en
      ? "Tour completed!"
      : "¡Recorrido completado!"
    : hasStarted
      ? en
        ? "Keep going!"
        : "¡Sigue así!"
      : en
        ? "Ready to explore?"
        : "¿Listo para explorar?";

  const ctaDescription = hasBadge
    ? en
      ? "You've already earned your badge for this area. Feel free to revisit any step."
      : "Ya obtuviste tu insignia de esta área. Puedes repasar cualquier paso cuando quieras."
    : hasStarted
      ? en
        ? `You're ${progressPercent}% of the way through this area's tour.`
        : `Vas ${progressPercent}% del recorrido de esta área.`
      : en
        ? "Flashcards, speaking practice, a chatbot and a final test await you."
        : "Flashcards, práctica de speaking, chatbot y un examen final te esperan.";

  const ctaButtonLabel = hasBadge
    ? en
      ? "Revisit the tour"
      : "Repasar el recorrido"
    : hasStarted
      ? en
        ? "Continue the tour"
        : "Continuar el recorrido"
      : en
        ? "Let's start the tour!"
        : "¡Empecemos el recorrido!";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/student/protected-areas"
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {en ? "Back to areas" : "Volver a áreas"}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <ProtectedAreaImageCarousel images={area.images} alt={area.name} />

        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-soft-foreground">
                <MapPinned className="h-3.5 w-3.5" aria-hidden="true" />
                {en ? "Protected area" : "Área protegida"}
              </span>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {translatedName}
              </h1>
            </div>

            {hasStarted && (
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                  hasBadge
                    ? "bg-warning-soft text-warning-soft-foreground"
                    : "bg-success-soft text-success-soft-foreground"
                }`}
              >
                {hasBadge ? (
                  <Medal className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                )}
                {progressPercent}% {en ? "complete" : "completado"}
              </span>
            )}
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className={`text-sm leading-relaxed text-muted sm:text-base ${richTextDisplayClassName}`}
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(translatedDescriptionHtml),
              }}
            />

            <motion.aside
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24 }}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-secondary/50 p-5 lg:sticky lg:top-6"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-soft-foreground">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {en ? "Location" : "Ubicación"}
                </h2>
              </div>
              <p className="font-mono text-sm font-medium text-foreground">
                {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}
              </p>
              <a
                href={`https://www.google.com/maps?q=${area.latitude},${area.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-layer-hover"
              >
                {en ? "Open in Google Maps" : "Abrir en Google Maps"}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </motion.aside>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent-soft via-surface to-surface p-8 text-center sm:p-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative flex flex-col items-center gap-5">
          {hasBadge && earnedBadges![0].imageUrl ? (
            <div className="relative">
              <div
                className="absolute inset-0 -z-10 rounded-full bg-warning-soft blur-xl"
                aria-hidden="true"
              />
              <Image
                src={earnedBadges![0].imageUrl}
                alt={earnedBadges![0].name}
                width={56}
                height={56}
                className="h-14 w-14 rounded-2xl border-2 border-surface object-contain shadow-lg"
              />
            </div>
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/30">
              <Compass className="h-7 w-7" aria-hidden="true" />
            </span>
          )}

          <div>
            <h3 className="text-xl font-bold text-foreground sm:text-2xl">
              {ctaTitle}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted sm:text-base">
              {ctaDescription}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {steps.map(({ key, icon: Icon, label, available, done }) => (
              <span
                key={key}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  !available
                    ? "border-dashed border-border bg-surface text-muted opacity-60"
                    : done
                      ? "border-success/30 bg-success-soft text-success-soft-foreground"
                      : "border-border bg-surface text-muted"
                }`}
              >
                {done && available ? (
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Icon
                    className={`h-3.5 w-3.5 ${available ? "text-accent" : "text-muted"}`}
                    aria-hidden="true"
                  />
                )}
                {label}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(`/student/protected-areas/${area.id}/tour`)
            }
            className="group mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/30 transition-all hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-xl active:translate-y-0 sm:px-10 sm:py-5 sm:text-lg"
          >
            {ctaButtonLabel}
            <ArrowRight
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
