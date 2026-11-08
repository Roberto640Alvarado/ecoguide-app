"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { FlashCardAvatar } from "./flash-card-avatar";
import { FLASH_CARD_TYPE_TONE, type FlashCard } from "../types/flash-card.types";

interface FlashCardMediaPanelProps {
  card: FlashCard;
}

/**
 * Panel visual de la tarjeta del estudiante. La imagen del docente es la
 * protagonista (a todo el panel, con la mascota de la categoría como sello
 * en la esquina); si la tarjeta no tiene imagen, la mascota ocupa el panel
 * sobre el tono de la categoría, rodeada de anillos que evocan las curvas
 * de nivel de un mapa topográfico.
 *
 * Móvil: franja superior de alto fijo. Desde `lg`: columna izquierda a
 * todo el alto de la tarjeta.
 */
export function FlashCardMediaPanel({ card }: FlashCardMediaPanelProps) {
  const reduceMotion = useReducedMotion();
  const theme = FLASH_CARD_TYPE_TONE[card.type];

  if (card.image) {
    return (
      <div className="relative h-52 overflow-hidden sm:h-64 lg:h-auto">
        <motion.div
          initial={reduceMotion ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={card.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 480px, 100vw"
            className="object-cover"
          />
        </motion.div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
        />
        <div
          className={`absolute bottom-4 left-4 flex size-14 items-center justify-center rounded-full border-4 border-surface shadow-lg sm:size-16 ${theme.chipBg}`}
        >
          <FlashCardAvatar type={card.type} className="size-10 object-contain sm:size-12" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-48 items-center justify-center overflow-hidden sm:h-56 lg:h-auto ${theme.chipBg}`}
    >
      <span
        aria-hidden="true"
        className="absolute size-72 rounded-full border border-surface/60 lg:size-[26rem]"
      />
      <span
        aria-hidden="true"
        className="absolute size-52 rounded-full border border-surface/70 lg:size-80"
      />
      <span
        aria-hidden="true"
        className="absolute size-32 rounded-full bg-surface/50 lg:size-52"
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
        className="relative"
      >
        <FlashCardAvatar
          type={card.type}
          className="h-32 w-32 object-contain drop-shadow-lg sm:h-36 sm:w-36 lg:h-48 lg:w-48"
        />
      </motion.div>
    </div>
  );
}
