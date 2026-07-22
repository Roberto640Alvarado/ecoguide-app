"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useFlashCards } from "@/features/flash-cards/hooks/use-flash-cards";
import { FlashCardDeck } from "@/features/flash-cards/components/flash-card-deck";

// Límite máximo permitido por PaginationQueryDto en la API: alcanza de
// sobra para traer el mazo completo de un área en una sola petición, sin
// necesidad de paginar un carrusel.
const FULL_DECK_LIMIT = 100;

export default function StudentFlashCardsPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const { data: area, isLoading: isLoadingArea } = useProtectedArea(params.id);
  const { data, isLoading: isLoadingCards } = useFlashCards({
    protectedAreaId: params.id,
    limit: FULL_DECK_LIMIT,
    sort: "order:asc",
  });

  const isLoading = isLoadingArea || isLoadingCards;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/student/protected-areas/${params.id}/tour`}
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to tour" : "Volver al recorrido"}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">FlashCards</h1>
          <p className="text-sm text-muted">
            {isLoadingArea
              ? language === "en"
                ? "Loading area..."
                : "Cargando área..."
              : area?.name}
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="md" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <FlashCardDeck
            cards={data?.items ?? []}
            protectedAreaId={params.id}
            tourHref={`/student/protected-areas/${params.id}/tour`}
          />
        </motion.div>
      )}
    </div>
  );
}
