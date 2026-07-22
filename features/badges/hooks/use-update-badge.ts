"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { updateBadge } from "../api/badges.api";
import type { Badge } from "../types/badge.types";
import type { BadgeFormValues } from "../schemas/badge.schema";
import type { ApiError } from "@/lib/api/client";

export function useUpdateBadge(id: string, protectedAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation<Badge, ApiError, Partial<BadgeFormValues>>({
    mutationFn: (payload) => updateBadge(id, payload),
    onSuccess: () => {
      toast.success("Insignia actualizada correctamente.");
      queryClient.invalidateQueries({ queryKey: ["badges", protectedAreaId] });
      queryClient.invalidateQueries({ queryKey: ["badge", id] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
