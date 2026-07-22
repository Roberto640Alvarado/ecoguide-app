"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchBadges } from "../api/badges.api";
import type { FindBadgesParams } from "../types/badge.types";

export function useBadges(params: FindBadgesParams) {
  return useQuery({
    queryKey: ["badges", params.protectedAreaId, params],
    queryFn: () => fetchBadges(params),
    enabled: !!params.protectedAreaId,
    placeholderData: keepPreviousData,
  });
}
