"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { meRequest } from "../api/auth.api";

interface SessionPayload {
  data?: { accessToken?: string | null };
}

/**
 * Al montar la app, lee la cookie httpOnly (vía el route handler propio,
 * ya que el JS del navegador no puede leerla) y rehidrata el store en
 * memoria con el accessToken + el usuario actual.
 */
export function useSessionHydration() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const markHydrated = useAuthStore((state) => state.markHydrated);

  useEffect(() => {
    if (isHydrated) return;

    let cancelled = false;

    async function hydrate() {
      try {
        const response = await fetch("/api/auth/session");
        const json = (await response.json()) as SessionPayload;
        const accessToken = json.data?.accessToken ?? null;

        if (accessToken && !cancelled) {
          useAuthStore.setState({ accessToken });
          const user = await meRequest();
          if (!cancelled) setUser(user);
        }
      } catch {
        // No hay sesión válida; el usuario deberá iniciar sesión.
      } finally {
        if (!cancelled) markHydrated();
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, setUser, markHydrated]);
}
