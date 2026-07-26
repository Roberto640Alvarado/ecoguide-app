"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
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
  /** Si el detalle de esta tarjeta está actualmente expandido (vista docente). */
  expanded?: boolean;
  /** Oculta el indicador de flecha (panel de detalle fijo, no colapsable). */
  showExpandIndicator?: boolean;
  /**
   * Cuántas columnas usar para los 4 chips de etapa. El ancho real de la
   * tarjeta varía mucho según dónde se use (tarjeta angosta del dashboard vs.
   * panel maestro/detalle del docente, casi a todo el ancho), y depender de
   * un grid con auto-fit resultó frágil entre esos contextos — el consumidor
   * indica explícitamente qué layout le corresponde. Por defecto 2 (2x2),
   * que es lo correcto para tarjetas angostas.
   */
  stepsColumns?: 2 | 4;
  onClick?: () => void;
}

interface StepChipProps {
  icon: typeof BookOpen;
  label: string;
  available: boolean;
  done: boolean;
  detail: string;
  chipIndex: number;
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

function StepChip({
  icon: Icon,
  label,
  available,
  done,
  detail,
  chipIndex,
}: StepChipProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 + chipIndex * 0.05 }}
      whileHover={available ? { y: -2 } : undefined}
      className={`flex flex-1 flex-col gap-2 rounded-xl border p-2.5 transition-colors ${
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
        <p className="truncate text-xs font-semibold text-foreground">
          {label}
        </p>
        <p className="truncate text-[11px] text-muted">
          {!available ? (en ? "Not configured" : "No configurado") : detail}
        </p>
      </div>
    </motion.div>
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
  expanded = false,
  showExpandIndicator = true,
  stepsColumns = 2,
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3.5">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-base">
            {progress.areaName}
          </h3>
          <p className="mt-0.5 text-[11px] text-white/80">
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
      className={`flex flex-col overflow-hidden rounded-2xl border bg-surface transition-shadow ${
        expanded
          ? "border-accent/40 shadow-md"
          : "border-border"
      }`}
    >
      {disableLink ? (
        <motion.button
          type="button"
          onClick={onClick}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="relative block h-36 w-full bg-accent-soft text-left"
        >
          {bannerContent}
          {showExpandIndicator && (
            <span
              className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            >
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}
        </motion.button>
      ) : (
        <Link
          href={linkHref}
          className="relative block h-36 w-full bg-accent-soft hover:opacity-95"
        >
          {bannerContent}
        </Link>
      )}

      <div
        className={`grid gap-2 p-3 ${
          stepsColumns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
        }`}
      >
        <StepChip
          chipIndex={0}
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
          chipIndex={1}
          icon={MessagesSquare}
          label={en ? "Speaking" : "Speaking"}
          available={progress.speaking.available}
          done={progress.speaking.finished > 0}
          detail={
            progress.speaking.finished === 0
              ? en
                ? "No calls yet"
                : "Sin llamadas"
              : en
                ? `Best ${progress.speaking.bestScore}/10`
                : `Mejor ${progress.speaking.bestScore}/10`
          }
        />
        <StepChip
          chipIndex={2}
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
          chipIndex={3}
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
