"use client";

import type { Ref } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
  type Variants,
} from "framer-motion";
import { FlashCardStudentCard } from "./flash-card-student-card";
import type { FlashCard } from "../types/flash-card.types";

/** Distancia (px) o velocidad (px/s) de arrastre para cambiar de tarjeta. */
const SWIPE_OFFSET = 110;
const SWIPE_VELOCITY = 550;

/**
 * direction > 0: avanza. La tarjeta actual sale volando hacia la izquierda
 * y la siguiente sube desde la pila de atrás.
 * direction < 0: retrocede. La actual se hunde en la pila y la anterior
 * regresa desde la izquierda.
 */
const cardVariants: Variants = {
  enter: (direction: number) =>
    direction >= 0
      ? { opacity: 0, x: 0, y: 28, scale: 0.94 }
      : { opacity: 0, x: -420, y: 0, scale: 1 },
  center: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 32 },
  },
  exit: (direction: number) =>
    direction >= 0
      ? { opacity: 0, x: -460, transition: { duration: 0.3, ease: "easeOut" } }
      : {
          opacity: 0,
          y: 28,
          scale: 0.94,
          transition: { duration: 0.25, ease: "easeOut" },
        },
};

const reducedVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export interface FlashCardDeckCardProps {
  /**
   * AnimatePresence mode="popLayout" necesita el ref del elemento para
   * sacarlo del flujo mientras sale (React 19: ref llega como prop).
   */
  ref?: Ref<HTMLDivElement>;
  card: FlashCard;
  direction: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  onSwipe: (direction: 1 | -1) => void;
  quizAnswer: string | null;
  onQuizAnswer: (option: string) => void;
}

/**
 * Tarjeta arrastrable: se inclina según cuánto se arrastra y, al soltarla
 * más allá del umbral, pasa a la siguiente/anterior. `touch-action: pan-y`
 * deja hacer scroll vertical normal en el celular.
 */
export function FlashCardDeckCard({
  ref,
  card,
  direction,
  canGoNext,
  canGoPrev,
  onSwipe,
  quizAnswer,
  onQuizAnswer,
}: FlashCardDeckCardProps) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-320, 0, 320], [-7, 0, 7]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const swipedLeft =
      info.offset.x < -SWIPE_OFFSET || info.velocity.x < -SWIPE_VELOCITY;
    const swipedRight =
      info.offset.x > SWIPE_OFFSET || info.velocity.x > SWIPE_VELOCITY;

    if (swipedLeft && canGoNext) onSwipe(1);
    else if (swipedRight && canGoPrev) onSwipe(-1);
  }

  return (
    <motion.div
      ref={ref}
      custom={direction}
      variants={reduceMotion ? reducedVariants : cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      drag={reduceMotion ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.55}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      style={{ x, rotate, touchAction: "pan-y" }}
      className="relative z-10 w-full cursor-grab active:cursor-grabbing"
    >
      <FlashCardStudentCard
        card={card}
        quizAnswer={quizAnswer}
        onQuizAnswer={onQuizAnswer}
      />
    </motion.div>
  );
}
