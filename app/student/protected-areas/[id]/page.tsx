"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Compass,
  MapPin,
  MapPinned,
  MessageCircle,
  Mic,
} from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { ProtectedAreaImageCarousel } from "@/features/protected-areas/components/protected-area-image-carousel";
import { richTextDisplayClassName, sanitizeRichText } from "@/lib/utils/rich-text";

export default function StudentProtectedAreaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const language = useLanguageStore((state) => state.language);
  const { data: area, isLoading } = useProtectedArea(params.id);

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
          {language === "en"
            ? "Protected area not found."
            : "Área protegida no encontrada."}
        </p>
        <Link
          href="/student/protected-areas"
          className="text-sm font-medium text-accent hover:underline"
        >
          {language === "en" ? "Back to areas" : "Volver a áreas"}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/student/protected-areas"
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to areas" : "Volver a áreas"}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="overflow-hidden rounded-3xl border border-border bg-surface"
      >
        <ProtectedAreaImageCarousel images={area.images} alt={area.name} />

        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-2xl font-bold text-foreground sm:text-3xl"
          >
            {area.name}
          </motion.h1>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className={`text-sm leading-relaxed text-muted sm:text-base ${richTextDisplayClassName}`}
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(area.description),
              }}
            />

            <motion.aside
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.24 }}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-secondary/50 p-5 lg:sticky lg:top-6"
            >
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                {language === "en" ? "Location" : "Ubicación"}
              </h2>
              <div className="flex items-start gap-2 text-sm font-medium text-foreground">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}
              </div>
              <a
                href={`https://www.google.com/maps?q=${area.latitude},${area.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-accent hover:underline"
              >
                {language === "en"
                  ? "Open in Google Maps"
                  : "Abrir en Google Maps"}
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
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/30">
            <Compass className="h-7 w-7" aria-hidden="true" />
          </span>

          <div>
            <h3 className="text-xl font-bold text-foreground sm:text-2xl">
              {language === "en" ? "Ready to explore?" : "¿Listo para explorar?"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted sm:text-base">
              {language === "en"
                ? "Flashcards, speaking practice, a chatbot and a final test await you."
                : "Flashcards, práctica de speaking, chatbot y un examen final te esperan."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              {
                icon: BookOpen,
                label: language === "en" ? "Flashcards" : "Flashcards",
              },
              {
                icon: Mic,
                label: language === "en" ? "Speaking" : "Speaking",
              },
              { icon: MessageCircle, label: "Chatbot" },
              {
                icon: ClipboardCheck,
                label: language === "en" ? "Final test" : "Examen final",
              },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted"
              >
                <Icon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
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
            {language === "en"
              ? "Let's start the tour!"
              : "¡Empecemos el recorrido!"}
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
