"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFlashCard } from "../api/flash-cards.api";

export function useFlashCard(id: string) {
  return useQuery({
    queryKey: ["flash-card", id],
    queryFn: () => fetchFlashCard(id),
    enabled: !!id,
  });
}
