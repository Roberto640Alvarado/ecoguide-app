"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { updateUser } from "../api/users.api";
import type { User } from "../types/user.types";
import type { UpdateUserFormValues } from "../schemas/update-user.schema";
import type { ApiError } from "@/lib/api/client";

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation<User, ApiError, UpdateUserFormValues>({
    mutationFn: (payload) => updateUser(id, payload),
    onSuccess: () => {
      toast.success("Usuario actualizado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
