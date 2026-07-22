"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { uploadBadgeImage } from "../api/badges.api";
import type { ApiError } from "@/lib/api/client";

export function useUploadBadgeImage() {
  return useMutation<{ url: string }, ApiError, File>({
    mutationFn: uploadBadgeImage,
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
