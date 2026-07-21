"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "@heroui/react";
import { uploadFlashCardImage } from "../api/flash-cards.api";
import type { ApiError } from "@/lib/api/client";

export function useUploadFlashCardImage() {
  return useMutation<{ url: string }, ApiError, File>({
    mutationFn: uploadFlashCardImage,
    onError: (error) => {
      toast.danger(error.message);
    },
  });
}
