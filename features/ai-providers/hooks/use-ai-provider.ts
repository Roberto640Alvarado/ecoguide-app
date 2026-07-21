"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAIProvider } from "../api/ai-providers.api";

export function useAIProvider(id: string) {
  return useQuery({
    queryKey: ["ai-providers", id],
    queryFn: () => fetchAIProvider(id),
    enabled: !!id,
  });
}
