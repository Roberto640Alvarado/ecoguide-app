"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Lock,
  MapPinned,
  MessagesSquare,
} from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import type { StudentAreaProgress } from "../types/student-progress.types";

interface StudentProgressAreaCardProps {
  progress: StudentAreaProgress;
  index: number;
  /** Ruta a la que enlaza la tarjeta. Por defecto va al área del estudiante. */
  href?: string;
  /** La vista del docente no navega al hacer clic — expande el detalle in situ. */
  disableLink?: boolean;
  onClick?: () => void;
}

interface StepChipProps {
  icon: typeof BookOpen;
  label: string;
  available: boolean;
  done: boolean;
  detail: string;
}

/** Anillo de progreso circular (SVG) para el % general del área. */
function ProgressRing({ percent }: { percent: number }) {
  const size = 44;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-11 w-11 shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-white/25"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-white transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
        {percent}%
      </span>
    </div>
  );
}

function StepChip({ icon: Icon, label, available, done, detail }: StepChipProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";

  return (
    <div
      className={`flex flex-1 flex-col gap-2 rounded-xl border p-3 ${
        !available
          ? "border-dashed border-border bg-surface-secondary/30"
          : done
            ? "border-success/30 bg-success-soft/30"
            : "border-border bg-surface-secondary/40"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
            !available
              ? "bg-default-soft text-muted"
              : done
                ? "bg-success-soft text-success-soft-foreground"
                : "bg-accent-soft text-accent-soft-foreground"
          }`}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        {!available ? (
          <Lock className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
        ) : done ? (
          <CheckCircle2
            className="h-3.5 w-3.5 shrink-0 text-success"
            aria-hidden="true"
          />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="truncate text-[11px] text-muted">
          {!available ? (en ? "Not configured" : "No configurado") : detail}
        </p>
      </div>
    </div>
  );
}

/**
 * Tarjeta de avance por área: banner con la imagen del área (mismo patrón
 * visual que las tarjetas del listado principal) con un anillo de progreso
 * superpuesto, más 4 chips de estado (uno por paso) que muestran de un
 * vistazo qué está disponible, hecho, o pendiente.
 */
export function StudentProgressAreaCard({
  progress,
  index,
  href,
  disableLink = false,
  onClick,
}: StudentProgressAreaCardProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const linkHref = href ?? `/student/protected-areas/${progress.protectedAreaId}`;

  const bannerContent = (
    <>
      {progress.areaImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={progress.areaImage}
          alt={progress.areaName}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <MapPinned
            className="h-7 w-7 text-accent-soft-foreground"
            aria-hidden="true"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">
            {progress.areaName}
          </h3>
          <p className="text-[11px] text-white/80">
            {progress.stepsCompleted}/{progress.stepsTotal}{" "}
            {en ? "steps completed" : "pasos completados"}
          </p>
        </div>
        <ProgressRing percent={progress.progressPercent} />
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface"
    >
      {disableLink ? (
        <button
          type="button"
          onClick={onClick}
          className="relative block h-24 w-full bg-accent-soft text-left"
        >
          {bannerContent}
        </button>
      ) : (
        <Link
          href={linkHref}
          className="relative block h-24 w-full bg-accent-soft hover:opacity-95"
        >
          {bannerContent}
        </Link>
      )}

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
        <StepChip
          icon={BookOpen}
          label="FlashCards"
          available={progress.flashCards.available}
          done={progress.flashCards.completed}
          detail={
            progress.flashCards.completed
              ? en
                ? "Done"
                : "Completado"
              : en
                ? "Not started"
                : "Sin empezar"
          }
        />
        <StepChip
          icon={MessagesSquare}
          label={en ? "Speaking" : "Speaking"}
          available={progress.speaking.available}
          done={progress.speaking.attempts > 0}
          detail={
            progress.speaking.attempts === 0
              ? en
                ? "No attempts"
                : "Sin intentos"
              : en
                ? `Best ${progress.speaking.bestScore}/10`
                : `Mejor ${progress.speaking.bestScore}/10`
          }
        />
        <StepChip
          icon={Bot}
          label="Chatbot"
          available={progress.chatbot.available}
          done={progress.chatbot.finishedConversations > 0}
          detail={
            progress.chatbot.conversations === 0
              ? en
                ? "No chats"
                : "Sin chats"
              : `${progress.chatbot.finishedConversations}/${progress.chatbot.conversations} ${en ? "finished" : "finalizadas"}`
          }
        />
        <StepChip
          icon={ClipboardCheck}
          label={en ? "Test" : "Examen"}
          available={progress.test.available}
          done={progress.test.passed}
          detail={
            progress.test.attemptsUsed === 0
              ? `0/${progress.test.maxAttempts} ${en ? "attempts" : "intentos"}`
              : `${progress.test.attemptsUsed}/${progress.test.maxAttempts} · ${progress.test.bestScore}/${progress.test.passingScore}`
          }
        />
      </div>
    </motion.div>
  );
}
