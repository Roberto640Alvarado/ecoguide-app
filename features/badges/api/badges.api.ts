import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { PaginatedResult } from "@/types/api";
import type { Badge, FindBadgesParams } from "../types/badge.types";
import type { BadgeFormValues } from "../schemas/badge.schema";

export function fetchBadges(params: FindBadgesParams) {
  return apiGet<PaginatedResult<Badge>>("/badges", { params });
}

export function fetchBadge(id: string) {
  return apiGet<Badge>(`/badges/${id}`);
}

export function createBadge(protectedAreaId: string, payload: BadgeFormValues) {
  return apiPost<Badge>("/badges", { ...payload, protectedAreaId });
}

export function updateBadge(id: string, payload: Partial<BadgeFormValues>) {
  return apiPatch<Badge>(`/badges/${id}`, payload);
}

export function removeBadge(id: string) {
  return apiDelete<null>(`/badges/${id}`);
}

/**
 * Ver el comentario equivalente en flash-cards.api.ts: hay que anular el
 * header Content-Type para que Axios envíe multipart/form-data en vez de
 * convertir el FormData a JSON. Usa el endpoint dedicado /upload-files/
 * badge-image, que solo acepta PNG (validado también en el backend).
 */
export function uploadBadgeImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiPost<{ url: string }>("/upload-files/badge-image", formData, {
    params: { folder: "badges" },
    headers: { "Content-Type": undefined },
  });
}
