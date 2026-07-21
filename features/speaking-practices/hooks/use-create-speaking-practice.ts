"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { createSpeakingPractice } from "../api/speaking-practices.api";
import type { SpeakingPractice } from "../types/speaking-practice.types";
import type { SpeakingPracticeFormValues } from "../schemas/speaking-practice.schema";
import type { ApiError } from "@/lib/api/client";

export function useCreateSpeakingPractice() {
  const queryClient = useQueryClient();

  return useMutation<SpeakingPractice, ApiError, SpeakingPracticeFormValues>({
    mutationFn: createSpeakingPractice,
    onSuccess: (data) => {
      toast.success("Práctica de speaking creada correctamente.");
      queryClient.invalidateQueries({
        queryKey: ["speaking-practices", "by-area", data.protectedAreaId],
      });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
