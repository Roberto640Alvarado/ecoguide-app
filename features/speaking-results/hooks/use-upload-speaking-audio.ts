"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadSpeakingAudio } from "../api/speaking-results.api";
import type { ApiError } from "@/lib/api/client";

export function useUploadSpeakingAudio() {
  return useMutation<{ url: string }, ApiError, Blob>({
    mutationFn: uploadSpeakingAudio,
  });
}
