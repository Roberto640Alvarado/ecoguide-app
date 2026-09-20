"use client";

import { motion } from "framer-motion";
import { useLanguageStore } from "@/store/language-store";
import {
  FLASH_CARD_TYPE_LABELS,
  FLASH_CARD_TYPE_TONE,
  type FlashCardType,
} from "../types/flash-card.types";

interface FlashCardTypeBadgeProps {
  type: FlashCardType;
  /**
   * `soft` (por defecto): pastilla con el fondo suave del tono de la
   * categoría — sobre fondos neutros (tabla del docente, listados).
   * `contrast`: pastilla sobre `surface`, para cuando el fondo YA es el
   * tono suave de la categoría (panel de la mascota en
   * FlashCardStudentCard), donde la variante `soft` quedaría invisible.
   */
  variant?: "soft" | "contrast";
}

export function FlashCardTypeBadge({
  type,
  variant = "soft",
}: FlashCardTypeBadgeProps) {
  const language = useLanguageStore((state) => state.language);
  const theme = FLASH_CARD_TYPE_TONE[type];

  return (
    <motion.span
      key={type}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        variant === "contrast"
          ? `bg-surface shadow-sm ${theme.chipText}`
          : theme.badge
      }`}
    >
      {FLASH_CARD_TYPE_LABELS[type][language]}
    </motion.span>
  );
}
