"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { generatePronunciation } from "../api/flash-cards.api";
import type { PronunciationLanguage } from "../types/flash-card.types";
import type { ApiError } from "@/lib/api/client";

interface GeneratePronunciationVariables {
  text: string;
  language: PronunciationLanguage;
}

/** Genera (o regenera) el audio de una palabra desde el formulario. */
export function useGeneratePronunciation() {
  return useMutation<{ url: string }, ApiError, GeneratePronunciationVariables>({
    mutationFn: ({ text, language }) =>
      generatePronunciation(text.trim(), language),
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
