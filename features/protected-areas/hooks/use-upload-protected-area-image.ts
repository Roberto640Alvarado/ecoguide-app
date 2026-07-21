"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { uploadProtectedAreaImage } from "../api/protected-areas.api";
import type { ApiError } from "@/lib/api/client";

export function useUploadProtectedAreaImage() {
  return useMutation<{ url: string }, ApiError, File>({
    mutationFn: uploadProtectedAreaImage,
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
