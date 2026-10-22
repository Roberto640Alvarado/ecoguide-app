"use client";

import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/** Peso de cada barra: el centro sube más que los extremos. */
const BAR_WEIGHTS = [0.45, 0.7, 1, 0.8, 0.55, 0.9, 0.6];
const MIN_SCALE = 0.18;

type WaveMode = "idle" | "assistant" | "user";

interface CallVoiceWaveProps {
  mode: WaveMode;
  /** Volumen real del micrófono (0–1), usado en el modo "user". */
  level: MotionValue<number>;
}

function LevelBar({ level, weight }: { level: MotionValue<number>; weight: number }) {
  const scaleY = useTransform(level, (value) =>
    Math.max(MIN_SCALE, Math.min(1, value * weight * 1.6)),
  );

  return (
    <motion.span
      style={{ scaleY }}
      className="h-full w-1.5 origin-center rounded-full bg-accent"
    />
  );
}

/**
 * Ondas de voz bajo el nombre del contacto:
 * - "user": siguen el volumen real del micrófono del estudiante.
 * - "assistant": laten mientras EcoGuía habla.
 * - "idle": quietas.
 */
export function CallVoiceWave({ mode, level }: CallVoiceWaveProps) {
  const reduceMotion = useReducedMotion();
  const smoothLevel = useSpring(level, { stiffness: 300, damping: 30 });

  return (
    <div className="flex h-8 items-center justify-center gap-1" aria-hidden="true">
      {BAR_WEIGHTS.map((weight, index) =>
        mode === "user" ? (
          <LevelBar key={index} level={smoothLevel} weight={weight} />
        ) : (
          <motion.span
            key={index}
            className="h-full w-1.5 origin-center rounded-full bg-accent"
            initial={false}
            animate={
              mode === "assistant" && !reduceMotion
                ? { scaleY: [MIN_SCALE, weight, MIN_SCALE * 1.5, weight * 0.7, MIN_SCALE] }
                : { scaleY: MIN_SCALE }
            }
            transition={
              mode === "assistant" && !reduceMotion
                ? { duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: index * 0.09 }
                : { duration: 0.3 }
            }
          />
        ),
      )}
    </div>
  );
}
