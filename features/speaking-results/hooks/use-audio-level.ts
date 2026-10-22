"use client";

import { useEffect } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

// El RMS de la voz rara vez pasa de ~0.25: se amplifica para usar todo el
// rango 0–1 de la animación.
const LEVEL_GAIN = 4;

/**
 * Volumen en vivo (0–1) de un AnalyserNode, como MotionValue: se actualiza
 * en cada frame sin provocar renders de React.
 */
export function useAudioLevel(analyser: AnalyserNode | null): MotionValue<number> {
  const level = useMotionValue(0);

  useEffect(() => {
    if (!analyser) {
      level.set(0);
      return;
    }

    const samples = new Uint8Array(analyser.fftSize);
    let frame = 0;

    const tick = () => {
      analyser.getByteTimeDomainData(samples);

      let sumOfSquares = 0;

      for (const sample of samples) {
        const normalized = (sample - 128) / 128;
        sumOfSquares += normalized * normalized;
      }

      const rms = Math.sqrt(sumOfSquares / samples.length);
      level.set(Math.min(1, rms * LEVEL_GAIN));
      frame = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(frame);
      level.set(0);
    };
  }, [analyser, level]);

  return level;
}
