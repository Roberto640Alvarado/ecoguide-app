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
  /**
   * Si esta es la tarjeta actualmente centrada en el mazo (ver
   * FlashCardDeck). Como Embla monta todas las tarjetas del mazo a la vez
   * (mismo patrón que FlashCardQuiz), este flag es lo que dispara el "pop"
   * de entrada de la mascota y el contenido cada vez que el estudiante
   * navega hacia esta tarjeta, en vez de animar una única vez al cargar la
   * página.
   */
  isActive: boolean;
}

/**
 * Una tarjeta del mazo del estudiante, partida en dos paneles:
 *
 *  - Panel de la mascota (tono de la categoría): badge + gesto de la
 *    mascota. A partir de `lg` va a la IZQUIERDA con ancho fijo; abajo de
 *    `lg` se apila arriba, a todo el ancho.
 *  - Panel de contenido (`surface`): título y texto (o el quiz de
 *    ENVIRONMENTAL) + imagen opcional.
 *
 * El corte entre ambos paneles es un cambio de color plano, no un
 * degradado que se desvanece hasta el fondo de la página — así el límite
 * de la tarjeta se ve siempre, sin importar cuánto texto traiga.
 * El layout horizontal aprovecha el ancho disponible en escritorio, que
 * antes quedaba vacío a los lados con la tarjeta en una sola columna.
 */
export function FlashCardStudentCard({ card, isActive }: FlashCardStudentCardProps) {
  const theme = FLASH_CARD_TYPE_TONE[card.type];
  const isEnvironmental = card.type === "ENVIRONMENTAL";
  const [translatedTitle, translatedContent] = useTranslatedTexts([
    card.title,
    card.content,
  ]);

  return (
    <div className="flex h-full min-h-[20rem] w-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm lg:flex-row">
      <div
        /* Alto fijo en mobile (h-56 = 224px): las flechas de navegación del
           mazo se posicionan sobre esta franja con un offset fijo
           (`top-28` en FlashCardDeck), así que su centro tiene que ser
           predecible y no depender del largo del título ni del contenido.
           Desde `lg` el panel pasa a ser la columna izquierda y el alto lo
           define el contenido. */
        className={`flex h-56 shrink-0 flex-col items-center justify-center gap-4 px-6 text-center lg:h-auto lg:w-72 lg:py-10 ${theme.chipBg}`}
      >
        <FlashCardTypeBadge type={card.type} variant="contrast" />

        <motion.div
          animate={
            isActive ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.85 }
          }
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="relative"
        >
          <span
            aria-hidden="true"
            className="absolute inset-1 -z-10 rounded-full bg-surface/70 blur-2xl"
          />
          <FlashCardAvatar
            type={card.type}
            className="h-28 w-28 object-contain drop-shadow-lg lg:h-36 lg:w-36"
          />
        </motion.div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden p-6 sm:p-8">
        <motion.h2
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 4 }}
          transition={{ duration: 0.3, delay: isActive ? 0.05 : 0 }}
          className="text-xl font-bold text-foreground sm:text-2xl"
        >
          {translatedTitle}
        </motion.h2>

        <motion.div
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 6 }}
          transition={{ duration: 0.3, delay: isActive ? 0.12 : 0 }}
          className="flex min-w-0 flex-col gap-4"
        >
          {isEnvironmental ? (
            <FlashCardQuiz card={card} />
          ) : (
            <div
              className={`break-words text-sm leading-relaxed text-muted sm:text-base ${richTextDisplayClassName}`}
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(translatedContent) }}
            />
          )}

          {card.image && !isEnvironmental && (
            <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-border/60 shadow-sm sm:h-56">
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 800px, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
