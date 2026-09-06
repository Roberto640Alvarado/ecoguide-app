"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  onDone?: () => void;
  showCursor?: boolean;
}

// Animación de "escritura": revela `text` letra por letra cada vez que el
// elemento entra en el viewport (useInView con once: false — antes solo
// se disparaba una vez, la primera vez que se cargaba/entraba a la
// página, y el usuario pidió que la animación "siga ahí" al volver a
// pasar por la sección). Al salir del viewport se reinicia a 0 en
// silencio (invisible, fuera de pantalla) para que la próxima vez que
// entre en vista arranque limpia desde el principio, sin mostrar el
// texto completo de golpe. El texto completo se mantiene accesible para
// lectores de pantalla vía un span sr-only, mientras el span visible
// (parcial, en progreso) se marca aria-hidden.
export function TypewriterText({
  text,
  delay = 0,
  speed = 32,
  className,
  onDone,
  showCursor = true,
}: TypewriterTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.6 });
  const [charCount, setCharCount] = useState(0);
  const onDoneRef = useRef(onDone);

  // Mantener la referencia actualizada fuera del render (en un efecto),
  // en vez de mutarla directamente en el cuerpo del componente.
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!isInView) {
      // Reinicia en silencio mientras está fuera de pantalla (invisible),
      // para que la próxima vez que entre en vista arranque limpia desde
      // el principio. Mismo patrón que el guard de "mounted" en
      // ThemeToggle: es intencional, no un efecto derivado de props/state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCharCount(0);
      return;
    }

    let index = 0;
    let interval: ReturnType<typeof setInterval> | undefined;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        index += 1;
        setCharCount(index);
        if (index >= text.length) {
          if (interval) clearInterval(interval);
          onDoneRef.current?.();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [isInView, text, delay, speed]);

  const displayed = text.slice(0, charCount);
  const done = charCount >= text.length;

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">
        {displayed}
        {showCursor && !done && charCount > 0 && (
          <span
            className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.1em] animate-pulse bg-current align-middle"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
