"use client";

import { useEffect, useRef, useState } from "react";
import { useCheckAreaBadges } from "../hooks/use-check-area-badges";
import { BadgeUnlockDialog } from "@/features/badges/components/badge-unlock-dialog";
import type { Badge } from "@/features/badges/types/badge.types";

interface BadgeUnlockWatcherProps {
  /** Ids de las áreas visibles en la vista actual de avance del estudiante. */
  protectedAreaIds: string[];
}

/**
 * Revisa en segundo plano, una sola vez por área y por carga de página, si
 * el estudiante ya terminó el recorrido y desbloqueó alguna insignia nueva
 * (ver checkAndAwardBadges en la API). Las insignias recién desbloqueadas se
 * encolan y se muestran una a la vez en BadgeUnlockDialog, con confeti.
 */
export function BadgeUnlockWatcher({
  protectedAreaIds,
}: BadgeUnlockWatcherProps) {
  const { mutate: checkAreaBadges } = useCheckAreaBadges();
  const checkedIdsRef = useRef<Set<string>>(new Set());
  const [queue, setQueue] = useState<Badge[]>([]);

  useEffect(() => {
    for (const protectedAreaId of protectedAreaIds) {
      if (checkedIdsRef.current.has(protectedAreaId)) continue;
      checkedIdsRef.current.add(protectedAreaId);

      checkAreaBadges(protectedAreaId, {
        onSuccess: (result) => {
          if (result.justUnlocked.length > 0) {
            setQueue((prev) => [...prev, ...result.justUnlocked]);
          }
        },
      });
    }
  }, [protectedAreaIds, checkAreaBadges]);

  return (
    <BadgeUnlockDialog
      badge={queue[0] ?? null}
      onClose={() => setQueue((prev) => prev.slice(1))}
    />
  );
}
