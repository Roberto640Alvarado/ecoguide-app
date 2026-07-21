"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { deactivateUser } from "../api/users.api";
import type { ApiError } from "@/lib/api/client";

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation<null, ApiError, string>({
    mutationFn: (id) => deactivateUser(id),
    onSuccess: () => {
      toast.success("Usuario desactivado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
