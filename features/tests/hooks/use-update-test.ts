"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { updateTest } from "../api/tests.api";
import type { Test } from "../types/test.types";
import type { TestFormValues } from "../schemas/test.schema";
import type { ApiError } from "@/lib/api/client";

export function useUpdateTest(id: string, protectedAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation<Test, ApiError, Partial<TestFormValues>>({
    mutationFn: (payload) => updateTest(id, payload),
    onSuccess: () => {
      toast.success("Examen actualizado correctamente.");
      queryClient.invalidateQueries({
        queryKey: ["tests", "by-area", protectedAreaId],
      });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
