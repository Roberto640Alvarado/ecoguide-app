"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { updateSpeakingPractice } from "../api/speaking-practices.api";
import type { SpeakingPractice } from "../types/speaking-practice.types";
import type { SpeakingPracticeFormValues } from "../schemas/speaking-practice.schema";
import type { ApiError } from "@/lib/api/client";

export function useUpdateSpeakingPractice(id: string, protectedAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    SpeakingPractice,
    ApiError,
    Partial<SpeakingPracticeFormValues>
  >({
    mutationFn: (payload) => updateSpeakingPractice(id, payload),
    onSuccess: () => {
      toast.success("Práctica de speaking actualizada correctamente.");
      queryClient.invalidateQueries({
        queryKey: ["speaking-practices", "by-area", protectedAreaId],
      });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
