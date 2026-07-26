import axios, { AxiosError, type AxiosResponse } from "axios";
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

// El interceptor de abajo no es un componente/hook — no puede usar
// `useRouter()` directamente. `Providers` registra aquí, al montar la app,
// un callback que hace una navegación de cliente (router.push) en vez de un
// window.location.href, para que un 401 nunca provoque un refresh completo
// del navegador y así se pierda el estado de la página (ej. el banner de
// error de un formulario).
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.response.use(
  (response) => {
    // Los endpoints binarios (ej. /speaking-results/tts) devuelven el audio
    // crudo, no el envelope {status,message,data} — no hay nada que
    // desenvolver, así que se devuelve tal cual (ver apiPostBinary).
    if (
      response.config.responseType === 'arraybuffer' ||
      response.config.responseType === 'blob'
    ) {
      return response.data as unknown as AxiosResponse;
    }

    const envelope = response.data as ApiSuccessResponse<unknown>;
    // El interceptor desenvuelve el envelope y retorna solo `data`, no un
    // AxiosResponse completo. Los helpers apiGet/apiPost/etc. ya asumen esto
    // (ver comentario debajo) y hacen el cast final a T; este cast solo
    // satisface la firma que espera Axios para el callback `fulfilled`.
    return envelope?.data as unknown as AxiosResponse;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data?.message ??
      "No se pudo conectar con el servidor. Intenta de nuevo.";

    // Los endpoints públicos de auth (login, registro, recuperación de
    // contraseña) pueden devolver 401 por credenciales/códigos inválidos —
    // eso es un error de formulario que la propia página debe mostrar, no
    // una sesión expirada. `/auth/me` queda fuera de esta lista porque sí es
    // un request autenticado (con el JWT ya adjunto) y su 401 sí significa
    // sesión expirada.
    const publicAuthPaths = [
      "/auth/login",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];
    const requestUrl = error.config?.url ?? "";
    const isPublicAuthRequest = publicAuthPaths.some((path) =>
      requestUrl.includes(path),
    );

    if (status === 401 && !isPublicAuthRequest) {
      useAuthStore.getState().clear();

      if (typeof window !== "undefined") {
        // Limpia también la cookie httpOnly: si no se borra, la próxima vez
        // que se monte la app (incluso ya parado en /login) el token vencido
        // vuelve a fallar contra /auth/me y dispara este mismo bloque otra
        // vez. El DELETE es "fire and forget" — no bloquea la redirección.
        fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
      }

      if (unauthorizedHandler) {
        unauthorizedHandler();
      } else if (typeof window !== "undefined") {
        // Fallback por si el 401 ocurre antes de que Providers registre el
        // handler (ej. muy al inicio del montaje) — evita quedar sin salida.
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

/**
 * Para endpoints que devuelven un binario (ej. audio MP3 de
 * /speaking-results/tts) en vez del envelope JSON de siempre — ver el
 * bypass correspondiente en el interceptor de respuesta arriba.
 */
export function apiPostBinary(
  url: string,
  data?: unknown,
  config?: Parameters<typeof apiClient.post>[2],
): Promise<ArrayBuffer> {
  return apiClient.post(url, data, {
    ...config,
    responseType: 'arraybuffer',
  }) as unknown as Promise<ArrayBuffer>;
}
