"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Lightbulb } from "lucide-react";
import {
  isBlankRichText,
  richTextDisplayClassName,
  sanitizeRichText,
} from "@/lib/utils/rich-text";
import { useLanguageStore } from "@/store/language-store";
import { useTranslatedTexts } from "@/features/translation/hooks/use-translated-texts";
import { FlashCardMediaPanel } from "./flash-card-media-panel";
import { FlashCardTypeBadge } from "./flash-card-type-badge";
import { FlashCardQuiz } from "./flash-card-quiz";
import { FlashCardVocabularyList } from "./flash-card-vocabulary-list";
import type { FlashCard } from "../types/flash-card.types";

interface FlashCardStudentCardProps {
  card: FlashCard;
  /** Respuesta del quiz (solo ENVIRONMENTAL), guardada en el mazo. */
  quizAnswer: string | null;
  onQuizAnswer: (option: string) => void;
}

const contentVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/**
 * Tarjeta del estudiante. Estructura común para todos los tipos —panel
 * visual (imagen o mascota) + columna de contenido— y un cuerpo propio de
 * cada categoría:
 *  - WELCOME: texto de bienvenida más grande.
 *  - CURIOUS_FACT: el dato destacado en un recuadro "¿Sabías que…?".
 *  - ENVIRONMENTAL: quiz de opción múltiple.
 *  - VOCABULARY: lista de palabras con pronunciación (las antiguas, sin
 *    lista, siguen mostrando su contenido).
 *  - GASTRONOMY / FLORA_FAUNA: texto con la imagen como protagonista.
 *
 * El contenido entra escalonado cada vez que la tarjeta aparece (solo hay
 * una montada a la vez), salvo con `prefers-reduced-motion`.
 */
export function FlashCardStudentCard({
  card,
  quizAnswer,
  onQuizAnswer,
}: FlashCardStudentCardProps) {
  const language = useLanguageStore((state) => state.language);
  const reduceMotion = useReducedMotion();
  const [translatedTitle, translatedContent] = useTranslatedTexts([
    card.title,
    card.content,
  ]);

  const vocabularyItems = card.vocabularyItems ?? [];
  const hasVocabularyList =
    card.type === "VOCABULARY" && vocabularyItems.length > 0;
  const hasContent =
    card.type !== "ENVIRONMENTAL" && !isBlankRichText(card.content);
  const contentHtml = sanitizeRichText(translatedContent);

  return (
    <article className="grid w-full overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-xl shadow-foreground/5 lg:min-h-[30rem] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <FlashCardMediaPanel card={card} />

      <motion.div
        variants={contentVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        className="flex min-w-0 flex-col gap-4 p-5 sm:gap-5 sm:p-8 lg:justify-center lg:p-10"
      >
        <motion.div variants={itemVariants}>
          <FlashCardTypeBadge type={card.type} />
        </motion.div>

        <motion.h2
          variants={itemVariants}
          className={`text-balance font-bold leading-tight tracking-tight text-foreground ${
            card.type === "WELCOME" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
          }`}
        >
          {translatedTitle}
        </motion.h2>

        {card.type === "ENVIRONMENTAL" && (
          <motion.div variants={itemVariants}>
            <FlashCardQuiz
              card={card}
              selected={quizAnswer}
              onSelect={onQuizAnswer}
            />
          </motion.div>
        )}

        {hasContent && card.type === "CURIOUS_FACT" && (
          <motion.aside
            variants={itemVariants}
            className="flex flex-col gap-2 rounded-2xl border-l-4 border-accent bg-accent-soft/50 p-5"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-accent-soft-foreground">
              <Lightbulb className="size-4" aria-hidden="true" />
              {language === "en" ? "Did you know?" : "¿Sabías que…?"}
            </p>
            <div
              className={`break-words text-base leading-relaxed text-foreground sm:text-lg ${richTextDisplayClassName}`}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </motion.aside>
        )}

        {hasContent && card.type !== "CURIOUS_FACT" && (
          <motion.div
            variants={itemVariants}
            className={`max-w-prose break-words leading-relaxed text-muted ${
              card.type === "WELCOME" ? "text-base sm:text-lg" : "text-sm sm:text-base"
            } ${richTextDisplayClassName}`}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}

        {hasVocabularyList && (
          <motion.div variants={itemVariants}>
            <FlashCardVocabularyList items={vocabularyItems} />
          </motion.div>
        )}
      </motion.div>
    </article>
  );
}
