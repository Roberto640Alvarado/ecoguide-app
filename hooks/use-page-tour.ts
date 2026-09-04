"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import { useLanguageStore } from "@/store/language-store";

interface UsePageTourOptions {
  /** Pasos del tour. Pasar `[]` mientras la página no tenga contenido real
   *  que resaltar (ej. mientras `isLoading` sigue true) — el auto-inicio
   *  espera a que haya al menos un paso. */
  steps: DriveStep[];
  /** Identifica la página para la key de localStorage (ej. "teacher-users"). */
  storageKey: string;
  /** Desactiva el auto-inicio la primera vez (el botón manual sigue
   *  funcionando). Default: true. */
  autoStart?: boolean;
}

function readTourSeen(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return true; // localStorage no disponible: no forzar el autoplay
  }
}

function markTourSeen(key: string): void {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // modo privado / storage bloqueado: no es crítico, el botón manual sigue
    // disponible para volver a ver el tour.
  }
}

// Wrapper de driver.js compartido por las vistas de listado de docente
// (Users, Protected Areas, AI Providers): cada página define sus propios
// `steps` apuntando a elementos vía `data-tour="..."`. El tour se
// autoreproduce una sola vez por navegador (localStorage) y siempre puede
// volver a lanzarse manualmente (botón "?" en el toolbar de cada página).
// Ver CLAUDE.md, sección "Sistema de Diseño", y el theming en
// app/globals.css (`.ecoguide-tour-popover`).
export function usePageTour({
  steps,
  storageKey,
  autoStart = true,
}: UsePageTourOptions) {
  const language = useLanguageStore((state) => state.language);
  const hasAutoStartedRef = useRef(false);

  const start = useCallback(() => {
    if (steps.length === 0) {
      return;
    }

    const tour = driver({
      showProgress: true,
      animate: true,
      overlayColor: "rgba(1, 22, 39, 0.7)",
      stagePadding: 6,
      stageRadius: 8,
      popoverClass: "ecoguide-tour-popover",
      progressText: language === "en" ? "{{current}} of {{total}}" : "{{current}} de {{total}}",
      nextBtnText: language === "en" ? "Next" : "Siguiente",
      prevBtnText: language === "en" ? "Previous" : "Anterior",
      doneBtnText: language === "en" ? "Done" : "Listo",
      steps,
    });

    tour.drive();
  }, [steps, language]);

  useEffect(() => {
    if (!autoStart || steps.length === 0 || hasAutoStartedRef.current) {
      return;
    }

    const key = `ecoguide-tour-seen:${storageKey}`;

    if (readTourSeen(key)) {
      return;
    }

    hasAutoStartedRef.current = true;
    markTourSeen(key);
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length > 0, autoStart, storageKey]);

  return { start };
}
