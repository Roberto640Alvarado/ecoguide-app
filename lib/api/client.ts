import axios, { AxiosError } from "axios";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";
import { useAuthStore } from "@/store/auth-store";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export interface ApiError {
  message: string;
  status: number;
}

apiClient.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiSuccessResponse<unknown>;
    return envelope?.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data?.message ??
      "No se pudo conectar con el servidor. Intenta de nuevo.";

    if (status === 401) {
      useAuthStore.getState().clear();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    const apiError: ApiError = { message, status };
    return Promise.reject(apiError);
  },
);

/**
 * El interceptor de respuesta ya desenvuelve el envelope {status,message,data},
 * por lo que estos helpers devuelven T directamente en lugar de AxiosResponse<T>.
 */
export function apiGet<T>(
  url: string,
  config?: Parameters<typeof apiClient.get>[1],
): Promise<T> {
  return apiClient.get(url, config) as unknown as Promise<T>;
}

export function apiPost<T>(
  url: string,
  data?: unknown,
  config?: Parameters<typeof apiClient.post>[2],
): Promise<T> {
  return apiClient.post(url, data, config) as unknown as Promise<T>;
}

export function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: Parameters<typeof apiClient.patch>[2],
): Promise<T> {
  return apiClient.patch(url, data, config) as unknown as Promise<T>;
}

export function apiDelete<T>(
  url: string,
  config?: Parameters<typeof apiClient.delete>[1],
): Promise<T> {
  return apiClient.delete(url, config) as unknown as Promise<T>;
}
