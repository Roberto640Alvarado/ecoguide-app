"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBadge } from "../api/badges.api";

export function useBadge(id: string) {
  return useQuery({
    queryKey: ["badge", id],
    queryFn: () => fetchBadge(id),
    enabled: !!id,
  });
}
