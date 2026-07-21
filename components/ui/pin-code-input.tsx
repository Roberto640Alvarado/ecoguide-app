"use client";

import { useEffect, useRef } from "react";

interface PinCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  isInvalid?: boolean;
  disabled?: boolean;
}

/**
 * Código de un solo uso (recuperación de contraseña) con el plugin
 * hs-pin-input de Preline: mueve el foco entre casillas automáticamente y
 * reparte el contenido al pegar un código completo. Las casillas quedan sin
 * controlar por React (Preline manipula su `value` directamente); en su
 * lugar se escucha el evento nativo `input` a nivel del contenedor para
 * ensamblar el string completo y notificarlo a react-hook-form.
 */
export function PinCodeInput({
  length = 6,
  value,
  onChange,
  onBlur,
  isInvalid,
  disabled,
}: PinCodeInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    import("preline").then(() => {
      window.HSStaticMethods.autoInit(["pin-input"]);
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function syncValue() {
      const inputs = Array.from(
        container?.querySelectorAll<HTMLInputElement>(
          "[data-hs-pin-input-item]",
        ) ?? [],
      );
      onChangeRef.current(inputs.map((input) => input.value).join(""));
    }

    container.addEventListener("input", syncValue);
    container.addEventListener("keyup", syncValue);
    return () => {
      container.removeEventListener("input", syncValue);
      container.removeEventListener("keyup", syncValue);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex justify-center gap-x-3"
      data-hs-pin-input
      onBlur={onBlur}
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          disabled={disabled}
          defaultValue={value[index] ?? ""}
          aria-invalid={isInvalid}
          className={`block size-10 text-center bg-layer border rounded-md sm:text-sm text-foreground placeholder:text-muted-foreground-1 focus:outline-hidden focus:ring-1 disabled:opacity-50 disabled:pointer-events-none ${
            isInvalid
              ? "border-danger focus:border-danger focus:ring-danger"
              : "border-layer-line focus:border-primary-focus focus:ring-primary-focus"
          }`}
          placeholder="⚬"
          data-hs-pin-input-item
        />
      ))}
    </div>
  );
}
