"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { unpublishProtectedArea } from "../api/protected-areas.api";
import type { ApiError } from "@/lib/api/client";

export function useUnpublishProtectedArea() {
  const queryClient = useQueryClient();

  return useMutation<null, ApiError, string>({
    mutationFn: (id) => unpublishProtectedArea(id),
    onSuccess: () => {
      toast.success("Área protegida despublicada correctamente.");
      queryClient.invalidateQueries({ queryKey: ["protected-areas"] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
