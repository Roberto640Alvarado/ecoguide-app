"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { createTest } from "../api/tests.api";
import type { Test } from "../types/test.types";
import type { TestFormValues } from "../schemas/test.schema";
import type { ApiError } from "@/lib/api/client";

export function useCreateTest() {
  const queryClient = useQueryClient();

  return useMutation<Test, ApiError, TestFormValues>({
    mutationFn: createTest,
    onSuccess: (test) => {
      toast.success("Examen creado correctamente.");
      queryClient.invalidateQueries({
        queryKey: ["tests", "by-area", test.protectedAreaId],
      });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
