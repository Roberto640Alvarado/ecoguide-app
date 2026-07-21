"use client";

import { useLanguageStore } from "@/store/language-store";
import {
  FLASH_CARD_TYPE_LABELS,
  FLASH_CARD_TYPE_TONE,
  type FlashCardType,
} from "../types/flash-card.types";

interface FlashCardTypeBadgeProps {
  type: FlashCardType;
}

export function FlashCardTypeBadge({ type }: FlashCardTypeBadgeProps) {
  const language = useLanguageStore((state) => state.language);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${FLASH_CARD_TYPE_TONE[type].badge}`}
    >
      {FLASH_CARD_TYPE_LABELS[type][language]}
    </span>
  );
}
