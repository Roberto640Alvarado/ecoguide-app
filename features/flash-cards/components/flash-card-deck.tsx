"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { BookX, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { FlashCardFinishDialog } from "./flash-card-finish-dialog";
import { FlashCardStepper } from "./flash-card-stepper";
import { FlashCardStudentCard } from "./flash-card-student-card";
import type { FlashCard } from "../types/flash-card.types";

interface FlashCardDeckProps {
  cards: FlashCard[];
  /** Área protegida del mazo, para marcar las flashcards como completadas. */
  protectedAreaId: string;
  /** A dónde volver desde la tarjeta de cierre al llegar al final del mazo. */
  tourHref: string;
}

/**
 * Mazo de flashcards del estudiante: un carrusel Embla (swipe nativo, igual
 * patrón que ProtectedAreaImageCarousel) con una tarjeta a la vez. Las
 * flashcards ya llegan ordenadas por categoría (`order` autoasignado en el
 * backend), así que el mazo cuenta una historia: bienvenida → gastronomía →
 * flora y fauna → quiz ambiental → dato curioso → vocabulario. En la última
 * tarjeta, "Siguiente" se reemplaza por el botón "Terminado"
 * (FlashCardFinishDialog), que celebra con confeti y deja elegir entre
 * repasar de nuevo o volver al recorrido.
 *
 * Navegación: swipe (Embla), `FlashCardStepper` arriba —una caja por
 * tarjeta, con su mascota, que permite saltar a cualquier punto del mazo y
 * a la vez muestra el avance— y los botones Anterior/Siguiente abajo. Ya no
 * hay una fila de chips de categoría separada del stepper: mostraban la
 * misma información dos veces.
 *
 * El mazo vive dentro de `mx-auto w-full max-w-6xl`: ocupa el ancho
 * disponible (la tarjeta se parte en dos columnas desde `lg`), con un tope
 * en monitores muy anchos para que la línea de texto no se vuelva
 * incómoda de leer.
 */
export function FlashCardDeck({
  cards,
  protectedAreaId,
  tourHref,
}: FlashCardDeckProps) {
  const language = useLanguageStore((state) => state.language);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const cardTypes = useMemo(() => cards.map((card) => card.type), [cards]);

  if (cards.length === 0) {
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

  const isFirst = selectedIndex === 0;
  const isLast = selectedIndex === cards.length - 1;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <FlashCardStepper
        types={cardTypes}
        currentIndex={selectedIndex}
        onStepClick={(index) => emblaApi?.scrollTo(index)}
      />

      <div className="relative min-w-0">
        <div className="min-w-0 overflow-hidden" ref={emblaRef}>
          <div className="flex items-stretch">
            {cards.map((card, index) => (
              <div key={card.id} className="flex min-w-0 flex-[0_0_100%] px-0.5">
                <FlashCardStudentCard
                  card={card}
                  isActive={index === selectedIndex}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Flechas solo en mobile/tablet: ahí la tarjeta es tan alta que los
            botones Anterior/Siguiente del final quedan fuera de pantalla, y
            el swipe no es una afordancia visible. Van centradas sobre la
            franja de la mascota, que en mobile tiene alto fijo (h-56 en
            FlashCardStudentCard) — por eso el offset `top-28` es estable
            para todas las tarjetas, sin importar cuánto texto traigan.
            Desde `lg` se ocultan: ahí la tarjeta es horizontal y los
            botones de abajo ya quedan a la vista. */}
        {!isFirst && (
          <motion.button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label={language === "en" ? "Previous card" : "Tarjeta anterior"}
            whileTap={{ scale: 0.9 }}
            className="absolute left-3 top-28 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/90 text-foreground shadow-md backdrop-blur-sm lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </motion.button>
        )}
        {!isLast && (
          <motion.button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label={language === "en" ? "Next card" : "Siguiente tarjeta"}
            whileTap={{ scale: 0.9 }}
            className="absolute right-3 top-28 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/90 text-foreground shadow-md backdrop-blur-sm lg:hidden"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </motion.button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <motion.button
          type="button"
          disabled={isFirst}
          onClick={() => emblaApi?.scrollPrev()}
          whileHover={!isFirst ? { x: -2 } : undefined}
          whileTap={!isFirst ? { scale: 0.96 } : undefined}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-layer-hover disabled:pointer-events-none disabled:opacity-40 sm:min-w-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          {language === "en" ? "Previous" : "Anterior"}
        </motion.button>

        {isLast ? (
          <FlashCardFinishDialog
            protectedAreaId={protectedAreaId}
            tourHref={tourHref}
            onReview={() => emblaApi?.scrollTo(0)}
          />
        ) : (
          <motion.button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover sm:min-w-40"
          >
            {language === "en" ? "Next" : "Siguiente"}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
