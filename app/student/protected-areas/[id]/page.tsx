"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Spinner } from "@heroui/react";
import { ArrowLeft, Compass, MapPin, MapPinned } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { ProtectedAreaImageCarousel } from "@/features/protected-areas/components/protected-area-image-carousel";

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

        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col gap-2"
          >
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {area.name}
            </h1>
            <span className="flex w-fit items-center gap-1.5 rounded-full bg-default-soft px-3 py-1 text-xs font-medium text-muted">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base"
          >
            {area.description}
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-gradient-to-br from-accent-soft to-surface p-8 text-center sm:p-10"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Compass className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {language === "en" ? "Ready to explore?" : "¿Listo para explorar?"}
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            {language === "en"
              ? "Start the guided tour: flashcards, speaking practice, chatbot and a final test await."
              : "Comienza el recorrido guiado: flashcards, práctica de speaking, chatbot y un examen final te esperan."}
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onPress={() =>
            router.push(`/student/protected-areas/${area.id}/tour`)
          }
        >
          {language === "en" ? "Start tour" : "Empezar recorrido"}
        </Button>
      </motion.div>
    </div>
  );
}
