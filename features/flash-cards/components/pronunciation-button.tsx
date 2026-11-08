"use client";

import { Volume2 } from "lucide-react";

interface PronunciationButtonProps {
  isPlaying: boolean;
  onClick: () => void;
  /** Texto accesible, ej. "Escuchar en inglés: River". */
  label: string;
  /** primary (Sea Green) para inglés, accent (Steel Blue) para español. */
  tone?: "primary" | "accent";
  size?: "sm" | "md";
}

const TONE_CLASSES = {
  primary: {
    idle: "bg-success-soft text-success-soft-foreground hover:bg-primary hover:text-primary-foreground",
    playing: "bg-primary text-primary-foreground",
    ring: "bg-primary/40",
  },
  accent: {
    idle: "bg-accent-soft text-accent-soft-foreground hover:bg-accent hover:text-accent-foreground",
    playing: "bg-accent text-accent-foreground",
    ring: "bg-accent/40",
  },
} as const;

/** Botón circular para escuchar una pronunciación (con onda mientras suena). */
export function PronunciationButton({
  isPlaying,
  onClick,
  label,
  tone = "primary",
  size = "md",
}: PronunciationButtonProps) {
  const classes = TONE_CLASSES[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={isPlaying}
      className={`relative flex shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
        size === "sm" ? "size-9" : "size-11"
      } ${isPlaying ? classes.playing : classes.idle}`}
    >
      {isPlaying && (
        <span
          aria-hidden="true"
          className={`absolute inset-0 rounded-full motion-safe:animate-ping ${classes.ring}`}
        />
      )}
      <Volume2
        className={`relative ${size === "sm" ? "size-4" : "size-5"}`}
        aria-hidden="true"
      />
    </button>
  );
}
