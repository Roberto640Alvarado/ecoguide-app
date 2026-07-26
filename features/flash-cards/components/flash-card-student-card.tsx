"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { richTextDisplayClassName, sanitizeRichText } from "@/lib/utils/rich-text";
import { useTranslatedTexts } from "@/features/translation/hooks/use-translated-texts";
import { FlashCardAvatar } from "./flash-card-avatar";
import { FlashCardTypeBadge } from "./flash-card-type-badge";
import { FlashCardQuiz } from "./flash-card-quiz";
import { FLASH_CARD_TYPE_TONE, type FlashCard } from "../types/flash-card.types";

interface FlashCardStudentCardProps {
  card: FlashCard;
}

/**
 * Una tarjeta del mazo del estudiante: degradado de fondo según la
 * categoría (ver FLASH_CARD_TYPE_TONE) con la mascota "hablando" al lado
 * del contenido, en vez de encerrada en un círculo — el título y el texto
 * (o el quiz interactivo para ENVIRONMENTAL) viven dentro de una burbuja de
 * diálogo con una "colita" apuntando hacia el avatar, para reforzar que es
 * la mascota quien le explica la tarjeta al estudiante.
 */
export function FlashCardStudentCard({ card }: FlashCardStudentCardProps) {
  const theme = FLASH_CARD_TYPE_TONE[card.type];
  const isEnvironmental = card.type === "ENVIRONMENTAL";
  const [translatedTitle, translatedContent] = useTranslatedTexts([
    card.title,
    card.content,
  ]);

  return (
    <div
      className={`flex min-h-[26rem] w-full flex-col gap-5 overflow-y-auto rounded-3xl border border-border bg-gradient-to-br p-6 sm:p-8 ${theme.cardGradient}`}
    >
      <div className="flex justify-center sm:justify-start">
        <FlashCardTypeBadge type={card.type} />
      </div>

      <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0"
        >
          <FlashCardAvatar
            type={card.type}
            className="h-28 w-28 object-contain drop-shadow-md sm:h-36 sm:w-36"
          />
        </motion.div>

        <div className="relative w-full rounded-2xl bg-surface p-5 text-center shadow-sm sm:flex-1 sm:text-left">
          {/* Colita de la burbuja: arriba (apuntando al avatar) en móvil,
              a la izquierda (apuntando al avatar) desde sm hacia arriba. */}
          <span
            aria-hidden="true"
            className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-surface sm:hidden"
          />
          <span
            aria-hidden="true"
            className="absolute -left-2 top-8 hidden h-4 w-4 rotate-45 bg-surface sm:block"
          />

          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            {translatedTitle}
          </h2>

          <div className="mt-3">
            {isEnvironmental ? (
              <FlashCardQuiz card={card} />
            ) : (
              <div
                className={`text-sm leading-relaxed text-muted sm:text-base ${richTextDisplayClassName}`}
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(translatedContent) }}
              />
            )}
          </div>

          {card.image && !isEnvironmental && (
            <div className="relative mt-4 h-40 w-full overflow-hidden rounded-2xl sm:h-48">
              <Image
                src={card.image}
                alt=""
                fill
                sizes="600px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
