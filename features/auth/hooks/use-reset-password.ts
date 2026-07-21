"use client";

import { useMutation } from "@tanstack/react-query";
import { resetPasswordRequest } from "../api/auth.api";
import type { ResetPasswordFormValues } from "../schemas/reset-password.schema";
import type { ApiError } from "@/lib/api/client";

export function useResetPassword() {
  return useMutation<null, ApiError, ResetPasswordFormValues>({
    mutationFn: ({ code, newPassword }) =>
      resetPasswordRequest({ code, newPassword }),
  });
}
