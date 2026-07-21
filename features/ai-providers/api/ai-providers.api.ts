import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { PaginatedResult } from "@/types/api";
import type { AIProvider, FindAIProvidersParams } from "../types/ai-provider.types";
import type { CreateAIProviderFormValues } from "../schemas/create-ai-provider.schema";
import type { UpdateAIProviderFormValues } from "../schemas/update-ai-provider.schema";
import type { ModelFormValues } from "../schemas/model.schema";

export function fetchAIProviders(params: FindAIProvidersParams) {
  return apiGet<PaginatedResult<AIProvider>>("/ai-providers", { params });
}

export function fetchAIProvider(id: string) {
  return apiGet<AIProvider>(`/ai-providers/${id}`);
}

export function createAIProvider(payload: CreateAIProviderFormValues) {
  return apiPost<AIProvider>("/ai-providers", payload);
}

export function updateAIProvider(
  id: string,
  payload: Partial<UpdateAIProviderFormValues>,
) {
  return apiPatch<AIProvider>(`/ai-providers/${id}`, payload);
}

export function deactivateAIProvider(id: string) {
  return apiDelete<null>(`/ai-providers/${id}`);
}

export function addModel(providerId: string, payload: ModelFormValues) {
  return apiPost<AIProvider>(`/ai-providers/${providerId}/models`, payload);
}

export function updateModel(
  providerId: string,
  modelId: string,
  payload: ModelFormValues,
) {
  return apiPatch<AIProvider>(
    `/ai-providers/${providerId}/models/${modelId}`,
    payload,
  );
}

export function removeModel(providerId: string, modelId: string) {
  return apiDelete<AIProvider>(
    `/ai-providers/${providerId}/models/${modelId}`,
  );
}
