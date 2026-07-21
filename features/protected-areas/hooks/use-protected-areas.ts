"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchProtectedAreas } from "../api/protected-areas.api";
import type { FindProtectedAreasParams } from "../types/protected-area.types";

export function useProtectedAreas(params: FindProtectedAreasParams) {
  return useQuery({
    queryKey: ["protected-areas", params],
    queryFn: () => fetchProtectedAreas(params),
    placeholderData: keepPreviousData,
  });
}
