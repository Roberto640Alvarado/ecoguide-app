"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { createBadge } from "../api/badges.api";
import type { Badge } from "../types/badge.types";
import type { BadgeFormValues } from "../schemas/badge.schema";
import type { ApiError } from "@/lib/api/client";

export function useCreateBadge(protectedAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation<Badge, ApiError, BadgeFormValues>({
    mutationFn: (payload) => createBadge(protectedAreaId, payload),
    onSuccess: () => {
      toast.success("Insignia creada correctamente.");
      queryClient.invalidateQueries({ queryKey: ["badges", protectedAreaId] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
