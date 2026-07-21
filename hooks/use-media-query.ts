"use client";

import { useSyncExternalStore } from "react";

function subscribe(query: string, callback: () => void) {
  const mediaQueryList = window.matchMedia(query);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

/**
 * true si el viewport coincide con el media query dado (ej.
 * "(max-width: 1023px)"). Usa useSyncExternalStore (en vez de
 * useState+useEffect) para suscribirse a `window.matchMedia` sin el
 * problema clásico de "setState dentro de un efecto"; el snapshot de
 * servidor es `false` ya que el viewport real no existe hasta el cliente.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => window.matchMedia(query).matches,
    () => false,
  );
}
