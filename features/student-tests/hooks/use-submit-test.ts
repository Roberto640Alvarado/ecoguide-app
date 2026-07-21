"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { submitTest, type SubmitTestPayload } from "../api/student-tests.api";
import type { StudentTestResult } from "../types/student-test.types";
import type { ApiError } from "@/lib/api/client";

export function useSubmitTest(protectedAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation<StudentTestResult, ApiError, SubmitTestPayload>({
    mutationFn: submitTest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-tests", "config", protectedAreaId],
      });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
