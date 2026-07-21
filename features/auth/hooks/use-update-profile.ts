"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { updateProfileRequest } from "../api/auth.api";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import type { AuthUser } from "../types/auth.types";
import type { UpdateProfileFormValues } from "../schemas/update-profile.schema";
import type { ApiError } from "@/lib/api/client";

/**
 * Al tener éxito, sincroniza el store de auth (`setUser`) con los datos
 * devueltos por la API — así el sidebar (avatar/nombre) y cualquier otra
 * vista que lea `useAuthStore` reflejan el cambio de inmediato, sin
 * necesidad de recargar la página.
 */
export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const language = useLanguageStore((state) => state.language);

  return useMutation<AuthUser, ApiError, UpdateProfileFormValues>({
    mutationFn: updateProfileRequest,
    onSuccess: (user) => {
      setUser(user);
      toast.success(
        language === "en"
          ? "Profile updated successfully."
          : "Perfil actualizado correctamente.",
      );
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
