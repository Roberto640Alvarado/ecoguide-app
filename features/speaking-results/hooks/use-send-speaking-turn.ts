"use client";

import { useMutation } from "@tanstack/react-query";
import { sendSpeakingTurn } from "../api/speaking-results.api";
import type { SpeakingResult } from "../types/speaking-result.types";
import type { ApiError } from "@/lib/api/client";

export function useSendSpeakingTurn() {
  return useMutation<
    SpeakingResult,
    ApiError,
    { id: string; audioBlob: Blob }
  >({
    mutationFn: ({ id, audioBlob }) => sendSpeakingTurn(id, audioBlob),
  });
}
