"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { createFlashCard } from "../api/flash-cards.api";
import type { FlashCard } from "../types/flash-card.types";
import type { FlashCardFormValues } from "../schemas/flash-card.schema";
import type { ApiError } from "@/lib/api/client";
import {
  isMissingPronunciationAudio,
  MISSING_PRONUNCIATION_AUDIO_MESSAGE,
} from "../utils/pronunciation-audio";

export function useCreateFlashCard(protectedAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation<FlashCard, ApiError, FlashCardFormValues>({
    mutationFn: (payload) => createFlashCard(protectedAreaId, payload),
    onSuccess: (flashCard) => {
      toast.success("Flashcard creada correctamente.");
      if (isMissingPronunciationAudio(flashCard)) {
        toast.warning(MISSING_PRONUNCIATION_AUDIO_MESSAGE);
      }
      queryClient.invalidateQueries({
        queryKey: ["flash-cards", protectedAreaId],
      });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
