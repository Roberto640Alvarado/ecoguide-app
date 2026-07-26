"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startSpeakingResult } from "../api/speaking-results.api";
import type { SpeakingResult } from "../types/speaking-result.types";
import type { ApiError } from "@/lib/api/client";

export function useStartSpeakingResult() {
  const queryClient = useQueryClient();

  return useMutation<SpeakingResult, ApiError, string>({
    mutationFn: startSpeakingResult,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["speaking-results", result.protectedAreaId],
      });
    },
  });
}
