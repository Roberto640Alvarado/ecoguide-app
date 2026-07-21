"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { BookX, ChevronLeft, ChevronRight, PartyPopper } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { FlashCardAvatar } from "./flash-card-avatar";
import { FlashCardStudentCard } from "./flash-card-student-card";
import {
  FLASH_CARD_TYPE_LABELS,
  FLASH_CARD_TYPE_TONE,
  type FlashCard,
  type FlashCardType,
} from "../types/flash-card.types";

interface FlashCardDeckProps {
  cards: FlashCard[];
  /** A dónde volver desde la tarjeta de cierre al llegar al final del mazo. */
  tourHref: string;
}

/**
 * Mazo de flashcards del estudiante: un carrusel Embla (swipe nativo, igual
 * patrón que ProtectedAreaImageCarousel) con una tarjeta a la vez, chips
 * para saltar directo a una categoría y una barra de progreso. Las
 * flashcards ya llegan ordenadas por categoría (`order` autoasignado en el
 * backend), así que el mazo cuenta una historia: bienvenida → gastronomía →
 * flora y fauna → quiz ambiental → dato curioso → vocabulario.
 */
export function FlashCardDeck({ cards, tourHref }: FlashCardDeckProps) {
  const language = useLanguageStore((state) => state.language);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Primera tarjeta de cada categoría presente, en el orden en que aparecen
  // en el mazo — alimenta los chips de navegación rápida por categoría.
  const categoryChips = useMemo(() => {
    const seen = new Set<FlashCardType>();
    const chips: { type: FlashCardType; index: number }[] = [];
    cards.forEach((card, index) => {
      if (!seen.has(card.type)) {
        seen.add(card.type);
        chips.push({ type: card.type, index });
      }
    });
    return chips;
  }, [cards]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-surface-secondary/40 py-16 text-center">
        <BookX className="h-8 w-8 text-muted" aria-hidden="true" />
        <p className="text-sm text-muted">
          {language === "en"
            ? "No flashcards for this area yet. Check back soon."
            : "Todavía no hay flashcards para esta área. Vuelve pronto."}
        </p>
      </div>
    );
  }

  const currentCard = cards[selectedIndex];
  const isFirst = selectedIndex === 0;
  const isLast = selectedIndex === cards.length - 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {categoryChips.map(({ type, index }) => {
          const isActive = currentCard.type === type;
          const theme = FLASH_CARD_TYPE_TONE[type];

          return (
            <button
              key={type}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? `${theme.badge} border-transparent`
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              <FlashCardAvatar type={type} className="h-4 w-4 object-contain" />
              {FLASH_CARD_TYPE_LABELS[type][language]}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-default-soft">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${((selectedIndex + 1) / cards.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-muted">
          {selectedIndex + 1}/{cards.length}
        </span>
      </div>

      <div className="group relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {cards.map((card) => (
              <div key={card.id} className="min-w-0 flex-[0_0_100%] px-0.5">
                <FlashCardStudentCard card={card} />
              </div>
            ))}
          </div>
        </div>

        {!isFirst && (
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label={language === "en" ? "Previous card" : "Tarjeta anterior"}
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        {!isLast && (
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label={language === "en" ? "Next card" : "Siguiente tarjeta"}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => emblaApi?.scrollPrev()}
          className="text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-0"
        >
          {language === "en" ? "← Previous" : "← Anterior"}
        </button>
        {!isLast ? (
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className="text-sm font-semibold text-accent hover:underline"
          >
            {language === "en" ? "Next →" : "Siguiente →"}
          </button>
        ) : (
          <span className="text-sm font-medium text-muted">
            {language === "en" ? "Last card" : "Última tarjeta"}
          </span>
        )}
      </div>

      {isLast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-accent-soft p-6 text-center"
        >
          <PartyPopper
            className="h-6 w-6 text-accent-soft-foreground"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-accent-soft-foreground">
            {language === "en"
              ? "You've reached the end of the deck. Swipe back anytime to review."
              : "Llegaste al final del mazo. Puedes repasar deslizando hacia atrás cuando quieras."}
          </p>
          <Link
            href={tourHref}
            className="text-sm font-semibold text-accent hover:underline"
          >
            {language === "en" ? "Back to tour" : "Volver al recorrido"}
          </Link>
        </motion.div>
      )}
    </div>
  );
}
