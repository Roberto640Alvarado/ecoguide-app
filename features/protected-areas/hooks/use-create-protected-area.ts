"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { createProtectedArea } from "../api/protected-areas.api";
import type { ProtectedArea } from "../types/protected-area.types";
import type { ProtectedAreaFormValues } from "../schemas/protected-area.schema";
import type { ApiError } from "@/lib/api/client";

export function useCreateProtectedArea() {
  const queryClient = useQueryClient();

  return useMutation<ProtectedArea, ApiError, ProtectedAreaFormValues>({
    mutationFn: createProtectedArea,
    onSuccess: () => {
      toast.success("Área protegida creada correctamente.");
      queryClient.invalidateQueries({ queryKey: ["protected-areas"] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
