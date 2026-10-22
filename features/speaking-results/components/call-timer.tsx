"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "../utils/format-duration";

const ONE_SECOND_MS = 1000;

/** Duración de la llamada (mm:ss) desde `startedAt`, como en una llamada real. */
export function CallTimer({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), ONE_SECOND_MS);

    return () => window.clearInterval(interval);
  }, []);

  const elapsedSeconds = (now - new Date(startedAt).getTime()) / ONE_SECOND_MS;

  return (
    <span className="font-medium tabular-nums">{formatDuration(elapsedSeconds)}</span>
  );
}
