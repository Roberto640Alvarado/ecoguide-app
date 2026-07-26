"use client";

import { useEffect } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import {
  ModalRoot,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  Button,
  useOverlayState,
} from "@heroui/react";
import { Medal } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useTranslatedTexts } from "@/features/translation/hooks/use-translated-texts";
import type { Badge } from "../types/badge.types";

interface BadgeUnlockDialogProps {
  /** Insignia a celebrar. `null` mantiene el modal cerrado. */
  badge: Badge | null;
  /** Se llama al cerrar (botón o click afuera) — el padre debe pasar a
   * `null` o avanzar a la siguiente insignia de la cola. */
  onClose: () => void;
}

/**
 * Dos ráfagas laterales + una central en dorado/verde (mismo patrón de
 * FlashCardFinishDialog) para celebrar el desbloqueo de una insignia.
 */
function launchConfetti() {
  const shared = {
    zIndex: 60,
    disableForReducedMotion: true,
    colors: ["#facc15", "#22c55e", "#38bdf8"],
  };
  confetti({
    ...shared,
    particleCount: 100,
    spread: 100,
    origin: { x: 0.5, y: 0.6 },
  });
  confetti({
    ...shared,
    particleCount: 60,
    spread: 70,
    angle: 60,
    origin: { x: 0.1, y: 0.7 },
  });
  confetti({
    ...shared,
    particleCount: 60,
    spread: 70,
    angle: 120,
    origin: { x: 0.9, y: 0.7 },
  });
}

/**
 * Modal totalmente controlado (sin trigger clicable): se abre solo cuando
 * `badge` deja de ser null, disparando el confeti en el mismo momento. Se
 * usa `useOverlayState` + `ModalRoot state={state}` (ver form-modal.tsx para
 * el patrón habitual con trigger) porque acá la apertura la decide el
 * padre — normalmente justo después de terminar el recorrido de un área.
 */
export function BadgeUnlockDialog({ badge, onClose }: BadgeUnlockDialogProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const isOpen = badge !== null;
  const state = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });
  const [translatedName, translatedDescription, translatedMessage] =
    useTranslatedTexts([
      badge?.name ?? "",
      badge?.description ?? "",
      badge?.message ?? "",
    ]);

  useEffect(() => {
    if (isOpen) {
      launchConfetti();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badge?.id]);

  return (
    <ModalRoot state={state}>
      <ModalBackdrop variant="blur">
        <ModalContainer size="sm">
          <ModalDialog>
            {badge && (
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <div className="relative">
                  <div
                    className="absolute inset-0 -z-10 rounded-full bg-warning-soft blur-2xl"
                    aria-hidden="true"
                  />
                  {badge.imageUrl ? (
                    <Image
                      src={badge.imageUrl}
                      alt={badge.name}
                      width={112}
                      height={112}
                      className="h-28 w-28 rounded-full border-4 border-surface object-contain shadow-lg"
                    />
                  ) : (
                    <span className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-surface bg-warning-soft text-warning-soft-foreground shadow-lg">
                      <Medal className="h-12 w-12" aria-hidden="true" />
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {en ? "Badge unlocked!" : "¡Insignia desbloqueada!"}
                  </p>
                  <h3 className="text-lg font-bold text-foreground">
                    {translatedName}
                  </h3>
                  <p className="text-sm text-muted">{translatedDescription}</p>
                </div>

                {badge.message && (
                  <p className="rounded-2xl bg-accent-soft/50 px-4 py-3 text-sm text-foreground">
                    {translatedMessage}
                  </p>
                )}

                <Button
                  variant="primary"
                  className="mt-1 w-full"
                  onPress={() => state.close()}
                >
                  {en ? "Awesome!" : "¡Genial!"}
                </Button>
              </div>
            )}
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </ModalRoot>
  );
}
