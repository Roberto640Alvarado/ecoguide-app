"use client";

import { useEffect } from "react";
import { startPwaInstallListener } from "@/hooks/use-pwa-install";

/**
 * Registra el service worker (/sw.js) y empieza a escuchar el evento de
 * instalación. Solo en producción: en desarrollo un service worker activo
 * ensucia el hot reload y el debugging.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    startPwaInstallListener();

    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => {
        console.error("No se pudo registrar el service worker", error);
      });
  }, []);

  return null;
}
