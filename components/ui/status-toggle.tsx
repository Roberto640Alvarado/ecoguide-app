"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface StatusToggleProps {
  /** Estado actual comprometido en el servidor (fuente de verdad). */
  isActive: boolean;
  isLoading?: boolean;
  activateLabel: string;
  deactivateLabel: string;
  icon?: ReactNode;
  confirmTitle: (next: boolean) => string;
  confirmDescription: (next: boolean) => ReactNode;
  confirmNote?: (next: boolean) => ReactNode;
  confirmLabel: (next: boolean) => string;
  cancelLabel?: string;
  onConfirm: (next: boolean) => void;
}

// Switch bidireccional (activar/desactivar) que nunca cambia de estado por sí
// solo: al accionarlo solo abre un ConfirmDialog controlado, y el `checked`
// del Switch se mantiene atado a `isActive` (el valor real del servidor) en
// todo momento. El valor visual solo se mueve cuando la mutación confirma y
// la query se invalida — no de forma optimista al hacer click.
export function StatusToggle({
  isActive,
  isLoading,
  activateLabel,
  deactivateLabel,
  icon,
  confirmTitle,
  confirmDescription,
  confirmNote,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: StatusToggleProps) {
  const [pending, setPending] = useState<boolean | null>(null);

  return (
    <>
      <Switch
        checked={isActive}
        disabled={isLoading}
        aria-label={isActive ? deactivateLabel : activateLabel}
        onCheckedChange={(next) => setPending(next)}
      />
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        icon={icon}
        title={pending !== null ? confirmTitle(pending) : ""}
        description={pending !== null ? confirmDescription(pending) : null}
        note={pending !== null ? confirmNote?.(pending) : undefined}
        confirmLabel={pending !== null ? confirmLabel(pending) : undefined}
        cancelLabel={cancelLabel}
        isLoading={isLoading}
        onConfirm={() => {
          if (pending !== null) {
            onConfirm(pending);
          }
        }}
      />
    </>
  );
}
