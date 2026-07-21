"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FlashCardAvatar } from "./flash-card-avatar";
import { FlashCardTypeBadge } from "./flash-card-type-badge";
import { FlashCardQuiz } from "./flash-card-quiz";
import { FLASH_CARD_TYPE_TONE, type FlashCard } from "../types/flash-card.types";

interface FlashCardStudentCardProps {
  card: FlashCard;
}

/**
 * Una tarjeta del mazo del estudiante: degradado + mascota + insignia según
 * la categoría (ver FLASH_CARD_TYPE_TONE), título y, según el tipo,
 * contenido de lectura o el quiz interactivo (ENVIRONMENTAL).
 */
export function FlashCardStudentCard({ card }: FlashCardStudentCardProps) {
  const theme = FLASH_CARD_TYPE_TONE[card.type];
  const isEnvironmental = card.type === "ENVIRONMENTAL";

  return (
    <div
      className={`flex min-h-[26rem] w-full flex-col items-center gap-5 overflow-y-auto rounded-3xl border border-border bg-gradient-to-br p-6 text-center sm:p-10 ${theme.cardGradient}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface shadow-sm sm:h-24 sm:w-24"
      >
        <FlashCardAvatar
          type={card.type}
          className="h-full w-full object-contain p-2"
        />
      </motion.div>

      <FlashCardTypeBadge type={card.type} />

      <h2 className="text-xl font-bold text-foreground sm:text-2xl">
        {card.title}
      </h2>

      {isEnvironmental ? (
        <FlashCardQuiz card={card} />
      ) : (
        <p className="max-w-md text-sm leading-relaxed text-muted sm:text-base">
          {card.content}
        </p>
      )}

      {card.image && !isEnvironmental && (
        <div className="relative mt-1 h-40 w-full max-w-sm overflow-hidden rounded-2xl sm:h-48">
          <Image
            src={card.image}
            alt=""
            fill
            sizes="400px"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
