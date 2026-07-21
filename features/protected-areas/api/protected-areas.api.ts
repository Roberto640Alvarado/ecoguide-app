import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { PaginatedResult } from "@/types/api";
import type {
  FindProtectedAreasParams,
  ProtectedArea,
} from "../types/protected-area.types";
import type { ProtectedAreaFormValues } from "../schemas/protected-area.schema";

export function fetchProtectedAreas(params: FindProtectedAreasParams) {
  return apiGet<PaginatedResult<ProtectedArea>>("/protected-areas", {
    params,
  });
}

export function fetchProtectedArea(id: string) {
  return apiGet<ProtectedArea>(`/protected-areas/${id}`);
}

export function createProtectedArea(payload: ProtectedAreaFormValues) {
  return apiPost<ProtectedArea>("/protected-areas", payload);
}

export function updateProtectedArea(
  id: string,
  payload: Partial<ProtectedAreaFormValues>,
) {
  return apiPatch<ProtectedArea>(`/protected-areas/${id}`, payload);
}

export function unpublishProtectedArea(id: string) {
  return apiDelete<null>(`/protected-areas/${id}`);
}

/**
 * Sube una imagen a Cloudinary vía el endpoint genérico /upload-files y
 * devuelve su URL. `apiClient` fija `Content-Type: application/json` por
 * defecto en todas las requests; con ese header ya presente, Axios convierte
 * el FormData a JSON en vez de enviarlo como multipart (ver
 * transformRequest en axios/lib/defaults). Hay que anular explícitamente el
 * header en esta request para que Axios lo deje en blanco y el navegador
 * pueda fijar el `multipart/form-data; boundary=...` correcto.
 */
export function uploadProtectedAreaImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiPost<{ url: string }>("/upload-files", formData, {
    params: { folder: "protected-areas" },
    headers: { "Content-Type": undefined },
  });
}
