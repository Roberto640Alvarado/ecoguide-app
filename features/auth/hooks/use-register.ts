"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { registerRequest } from "../api/auth.api";
import { useAuthStore } from "@/store/auth-store";
import { getDashboardPath } from "../utils/get-dashboard-path";
import type { RegisterFormValues } from "../schemas/register.schema";
import type { AuthUser } from "../types/auth.types";
import type { ApiError } from "@/lib/api/client";

export function useRegister() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<AuthUser, ApiError, RegisterFormValues>({
    mutationFn: async (values) => {
      const payload = {
        name: values.name,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        avatarUrl: values.avatarUrl,
      };
      const { accessToken, user } = await registerRequest(payload);

      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      setSession(accessToken, user);
      return user;
    },
    onSuccess: (user) => {
      router.push(getDashboardPath(user.role));
      router.refresh();
    },
  });
}
