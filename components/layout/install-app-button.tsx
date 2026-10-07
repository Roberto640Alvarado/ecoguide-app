"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/store/language-store";
import { usePwaInstall } from "@/hooks/use-pwa-install";

/**
 * Botón "Instalar app" del menú lateral. Solo se muestra si la app no está
 * instalada y hay forma de instalarla: aviso nativo (Chrome/Edge/Android) o,
 * en iPhone/iPad, instrucciones de "Añadir a pantalla de inicio".
 */
export function InstallAppButton() {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const { canPrompt, isInstalled, isIos, promptInstall } = usePwaInstall();
  const [showIosHelp, setShowIosHelp] = useState(false);

  if (isInstalled || (!canPrompt && !isIos)) return null;

  function handleClick() {
    if (canPrompt) {
      void promptInstall();
      return;
    }
    setShowIosHelp((open) => !open);
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleClick}
        aria-label={en ? "Install app" : "Instalar app"}
      >
        <Download className="size-4 shrink-0" aria-hidden="true" />
        <span className="group-data-[collapsible=icon]:hidden">
          {en ? "Install app" : "Instalar app"}
        </span>
      </Button>
      {showIosHelp && !canPrompt && (
        <p className="px-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          {en
            ? "Tap the Share button, then “Add to Home Screen”."
            : "Toca el botón Compartir y luego «Añadir a pantalla de inicio»."}
        </p>
      )}
    </div>
  );
}
