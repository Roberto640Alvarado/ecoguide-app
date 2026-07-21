"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { updateProtectedArea } from "../api/protected-areas.api";
import type { ProtectedArea } from "../types/protected-area.types";
import type { ProtectedAreaFormValues } from "../schemas/protected-area.schema";
import type { ApiError } from "@/lib/api/client";

export function useUpdateProtectedArea(id: string) {
  const queryClient = useQueryClient();

  return useMutation<ProtectedArea, ApiError, Partial<ProtectedAreaFormValues>>({
    mutationFn: (payload) => updateProtectedArea(id, payload),
    onSuccess: () => {
      toast.success("Área protegida actualizada correctamente.");
      queryClient.invalidateQueries({ queryKey: ["protected-areas"] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
