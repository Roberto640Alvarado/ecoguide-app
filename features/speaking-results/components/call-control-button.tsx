"use client";

import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type ControlTone = "glass" | "primary" | "danger";
type ControlSize = "md" | "lg";

interface CallControlButtonProps
  extends Omit<ComponentProps<typeof motion.button>, "children"> {
  icon: ReactNode;
  label: string;
  tone?: ControlTone;
  size?: ControlSize;
  /** Halo pulsante alrededor del botón (ej. mientras se graba). */
  isPulsing?: boolean;
}

const TONE_CLASS: Record<ControlTone, string> = {
  glass:
    "border border-border bg-surface/70 text-foreground shadow-sm hover:bg-surface",
  primary: "bg-accent text-accent-foreground shadow-lg shadow-accent/30 hover:bg-accent/90",
  danger: "bg-danger text-white shadow-lg shadow-danger/30 hover:bg-danger/90",
};

const SIZE_CLASS: Record<ControlSize, string> = {
  md: "size-14 sm:size-16",
  lg: "size-20 sm:size-[5.5rem]",
};

/**
 * Botón circular de la barra de controles de la llamada, con su etiqueta
 * debajo (estilo FaceTime/WhatsApp). `forwardRef` para poder usarse como
 * trigger de AlertDialog (`asChild`).
 */
export const CallControlButton = forwardRef<HTMLButtonElement, CallControlButtonProps>(
  function CallControlButton(
    {
      icon,
      label,
      tone = "glass",
      size = "md",
      isPulsing = false,
      className,
      disabled,
      ...props
    },
    ref,
  ) {
    const reduceMotion = useReducedMotion();

    return (
      <div className="flex flex-col items-center gap-2">
        <motion.button
          ref={ref}
          type="button"
          aria-label={label}
          disabled={disabled}
          whileTap={disabled || reduceMotion ? undefined : { scale: 0.9 }}
          className={cn(
            "relative isolate flex items-center justify-center rounded-full backdrop-blur-md transition-[background-color,opacity] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40",
            TONE_CLASS[tone],
            SIZE_CLASS[size],
            className,
          )}
          {...props}
        >
          {isPulsing && !reduceMotion && (
            <span
              className="absolute inset-0 -z-10 animate-ping rounded-full bg-current opacity-30"
              aria-hidden="true"
            />
          )}
          {icon}
        </motion.button>
        <span className="text-xs font-medium text-muted">{label}</span>
      </div>
    );
  },
);
