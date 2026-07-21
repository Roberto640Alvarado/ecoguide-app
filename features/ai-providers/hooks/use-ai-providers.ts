"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchAIProviders } from "../api/ai-providers.api";
import type { FindAIProvidersParams } from "../types/ai-provider.types";

export function useAIProviders(params: FindAIProvidersParams) {
  return useQuery({
    queryKey: ["ai-providers", params],
    queryFn: () => fetchAIProviders(params),
    placeholderData: keepPreviousData,
  });
}
