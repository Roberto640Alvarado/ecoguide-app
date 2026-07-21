"use client";

import { useMutation } from "@tanstack/react-query";
import { forgotPasswordRequest } from "../api/auth.api";
import type { ForgotPasswordFormValues } from "../schemas/forgot-password.schema";
import type { ApiError } from "@/lib/api/client";

export function useForgotPassword() {
  return useMutation<null, ApiError, ForgotPasswordFormValues>({
    mutationFn: (payload) => forgotPasswordRequest(payload),
  });
}
