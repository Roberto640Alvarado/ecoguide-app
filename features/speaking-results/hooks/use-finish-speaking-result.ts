"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { finishSpeakingResult } from "../api/speaking-results.api";
import type { SpeakingResult } from "../types/speaking-result.types";
import type { ApiError } from "@/lib/api/client";

export function useFinishSpeakingResult() {
  const queryClient = useQueryClient();

  return useMutation<SpeakingResult, ApiError, string>({
    mutationFn: finishSpeakingResult,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["speaking-results", result.protectedAreaId],
      });
    },
  });
}
