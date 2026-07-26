"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllEarnedBadges } from "../api/student-progress.api";

export function useAllEarnedBadges() {
  return useQuery({
    queryKey: ["student-progress", "badges", "all"],
    queryFn: () => fetchAllEarnedBadges(),
  });
}
