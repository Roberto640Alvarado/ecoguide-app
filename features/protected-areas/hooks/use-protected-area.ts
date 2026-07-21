"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProtectedArea } from "../api/protected-areas.api";

export function useProtectedArea(id: string) {
  return useQuery({
    queryKey: ["protected-areas", id],
    queryFn: () => fetchProtectedArea(id),
    enabled: !!id,
  });
}
