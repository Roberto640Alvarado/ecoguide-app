"use client";

import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaInstallState {
  /** El navegador ofrece el aviso nativo de instalación (Chrome/Edge/Android). */
  canPrompt: boolean;
  /** La app ya está instalada o corre en modo standalone. */
  isInstalled: boolean;
  /** iPhone/iPad: no hay aviso nativo, se instala desde "Compartir". */
  isIos: boolean;
}

const SERVER_STATE: PwaInstallState = {
  canPrompt: false,
  isInstalled: false,
  isIos: false,
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let started = false;
let state: PwaInstallState = SERVER_STATE;
const listeners = new Set<() => void>();

function update(partial: Partial<PwaInstallState>) {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
}

/**
 * Registra (una sola vez) los listeners de instalación. El evento
 * `beforeinstallprompt` se dispara una vez por carga de página y puede llegar
 * antes de que se monte cualquier componente, por eso se inicia desde el
 * layout raíz (ServiceWorkerRegister) y no solo desde el botón.
 */
export function startPwaInstallListener() {
  if (started || typeof window === "undefined") return;
  started = true;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  state = { canPrompt: false, isInstalled: isStandalone, isIos };

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    update({ canPrompt: true });
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    update({ canPrompt: false, isInstalled: true });
  });

  listeners.forEach((listener) => listener());
}

async function promptInstall() {
  if (!deferredPrompt) return;
  const promptEvent = deferredPrompt;
  deferredPrompt = null;
  update({ canPrompt: false });
  await promptEvent.prompt();
  await promptEvent.userChoice;
}

function subscribe(listener: () => void) {
  startPwaInstallListener();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePwaInstall() {
  const current = useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );

  return { ...current, promptInstall };
}
