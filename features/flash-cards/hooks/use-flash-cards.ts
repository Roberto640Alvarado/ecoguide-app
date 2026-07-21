"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchFlashCards } from "../api/flash-cards.api";
import type { FindFlashCardsParams } from "../types/flash-card.types";

export function useFlashCards(params: FindFlashCardsParams) {
  return useQuery({
    queryKey: ["flash-cards", params.protectedAreaId, params],
    queryFn: () => fetchFlashCards(params),
    enabled: !!params.protectedAreaId,
    placeholderData: keepPreviousData,
  });
}
