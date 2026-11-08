"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookX, ChevronLeft, ChevronRight, Hand } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { FlashCardFinishDialog } from "./flash-card-finish-dialog";
import { FlashCardTrailProgress } from "./flash-card-trail-progress";
import { FlashCardDeckCard } from "./flash-card-deck-card";
import {
  FLASH_CARD_TYPE_LABELS,
  FLASH_CARD_TYPE_TONE,
  type FlashCard,
} from "../types/flash-card.types";

interface FlashCardDeckProps {
  cards: FlashCard[];
  /** Área protegida del mazo, para marcar las flashcards como completadas. */
  protectedAreaId: string;
  /** A dónde volver desde la tarjeta de cierre al llegar al final del mazo. */
  tourHref: string;
}

/** Cuántas tarjetas siguientes asoman detrás de la actual. */
const STACK_PEEK = 2;

/**
 * Mazo de flashcards del estudiante. Las tarjetas llegan ordenadas por
 * categoría (bienvenida → gastronomía → flora y fauna → quiz ambiental →
 * dato curioso → vocabulario) y se recorren como un mazo físico:
 *
 * - Sendero de progreso arriba (FlashCardTrailProgress): la mascota avanza
 *   por el camino; cada punto salta a esa tarjeta.
 * - Pila: detrás de la tarjeta actual asoman las siguientes, con el tono de
 *   su categoría, para anticipar qué viene.
 * - Pasar de tarjeta: arrastrar/deslizar la tarjeta, flechas ← → del
 *   teclado, o los botones Anterior/Siguiente. En móvil esa barra queda
 *   fija abajo para no tener que bajar hasta el final de tarjetas largas.
 * - Última tarjeta: "Siguiente" se convierte en "Terminado"
 *   (FlashCardFinishDialog, con confeti).
 *
 * Solo la tarjeta actual está montada; las respuestas del quiz se guardan
 * aquí para conservarlas al ir y volver.
 */
export function FlashCardDeck({
  cards,
  protectedAreaId,
  tourHref,
}: FlashCardDeckProps) {
  const language = useLanguageStore((state) => state.language);
  const reduceMotion = useReducedMotion();
  const deckRef = useRef<HTMLDivElement>(null);
  const hasNavigatedRef = useRef(false);
  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  const total = cards.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= total) return;
      hasNavigatedRef.current = true;
      setPage(([current]) =>
        next === current ? [current, 0] : [next, next > current ? 1 : -1],
      );
    },
    [total],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Flechas del teclado (salvo mientras se escribe en un campo).
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  // Si el estudiante bajó para leer una tarjeta larga y pasa a la
  // siguiente, se le regresa al inicio del mazo.
  useEffect(() => {
    if (!hasNavigatedRef.current) return;
    const top = deckRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) {
      deckRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  }, [index, reduceMotion]);

  if (total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-surface-secondary/40 py-16 text-center"
      >
        <BookX className="h-8 w-8 text-muted" aria-hidden="true" />
        <p className="text-sm text-muted">
          {language === "en"
            ? "No flashcards for this area yet. Check back soon."
            : "Todavía no hay flashcards para esta área. Vuelve pronto."}
        </p>
      </motion.div>
    );
  }

  const card = cards[index];
  const nextCard = cards[index + 1];
  const peekCards = cards.slice(index + 1, index + 1 + STACK_PEEK);

  return (
    <div
      ref={deckRef}
      className="mx-auto flex w-full max-w-6xl scroll-mt-4 flex-col gap-5"
    >
      <FlashCardTrailProgress
        types={cards.map((deckCard) => deckCard.type)}
        currentIndex={index}
        onStepClick={goTo}
      />

      <section
        aria-roledescription={language === "en" ? "card deck" : "mazo de tarjetas"}
        aria-label={
          language === "en"
            ? `Card ${index + 1} of ${total}`
            : `Tarjeta ${index + 1} de ${total}`
        }
        className="relative grid pb-5"
      >
        {/* Tarjetas siguientes asomando por debajo (solo decorativas). */}
        {peekCards
          .map((peekCard, position) => ({ peekCard, depth: position + 1 }))
          .reverse()
          .map(({ peekCard, depth }) => (
            <div
              key={peekCard.id}
              aria-hidden="true"
              className="absolute inset-x-0 bottom-5 top-0 overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-md transition-transform duration-300"
              style={{
                transform: `translateY(${depth * 12}px) scale(${1 - depth * 0.04})`,
                opacity: 1 - depth * 0.3,
              }}
            >
              {/* Borde inferior con el tono de la categoría que viene. */}
              <span
                className={`absolute inset-x-0 bottom-0 h-3 ${FLASH_CARD_TYPE_TONE[peekCard.type].chipBg}`}
              />
            </div>
          ))}

        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <FlashCardDeckCard
            key={card.id}
            card={card}
            direction={direction}
            canGoNext={!isLast}
            canGoPrev={!isFirst}
            onSwipe={(swipe) => (swipe > 0 ? goNext() : goPrev())}
            quizAnswer={quizAnswers[card.id] ?? null}
            onQuizAnswer={(option) =>
              setQuizAnswers((answers) => ({ ...answers, [card.id]: option }))
            }
          />
        </AnimatePresence>
      </section>

      <div className="sticky bottom-3 z-20 flex items-center gap-2 rounded-2xl border border-border bg-surface/90 p-2 shadow-lg backdrop-blur-md sm:static sm:gap-4 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
        <motion.button
          type="button"
          disabled={isFirst}
          onClick={goPrev}
          whileTap={!isFirst ? { scale: 0.94 } : undefined}
          aria-label={language === "en" ? "Previous card" : "Tarjeta anterior"}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-layer-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 sm:min-w-36"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
          <span className="hidden sm:inline">
            {language === "en" ? "Previous" : "Anterior"}
          </span>
        </motion.button>

        <p className="hidden flex-1 items-center justify-center gap-2 text-center text-xs text-muted sm:flex">
          <Hand className="size-4 shrink-0" aria-hidden="true" />
          {language === "en"
            ? "Drag the card or use the ← → keys"
            : "Arrastra la tarjeta o usa las teclas ← →"}
        </p>

        <div className="flex flex-1 sm:flex-none">
          {isLast ? (
            <FlashCardFinishDialog
              protectedAreaId={protectedAreaId}
              tourHref={tourHref}
              onReview={() => goTo(0)}
            />
          ) : (
            <motion.button
              type="button"
              onClick={goNext}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex h-12 w-full items-center justify-between gap-3 rounded-xl bg-primary px-4 text-left text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:min-w-56"
            >
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-sm font-semibold">
                  {language === "en" ? "Next" : "Siguiente"}
                </span>
                {nextCard && (
                  <span className="truncate text-xs opacity-80">
                    {FLASH_CARD_TYPE_LABELS[nextCard.type][language]}
                  </span>
                )}
              </span>
              <ChevronRight
                className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
