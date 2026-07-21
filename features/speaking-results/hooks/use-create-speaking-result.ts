"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSpeakingResult } from "../api/speaking-results.api";
import type {
  CreateSpeakingResultPayload,
  SpeakingResult,
} from "../types/speaking-result.types";
import type { ApiError } from "@/lib/api/client";

export function useCreateSpeakingResult() {
  const queryClient = useQueryClient();

  return useMutation<SpeakingResult, ApiError, CreateSpeakingResultPayload>({
    mutationFn: createSpeakingResult,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["speaking-results", result.protectedAreaId],
      });
    },
  });
}
