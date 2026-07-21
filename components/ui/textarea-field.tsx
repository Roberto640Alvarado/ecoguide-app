"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

export interface TextareaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label: string;
  error?: string;
  containerClassName?: string;
}

/**
 * Textarea nativo con el estilo Preline UI, hermano de TextField. Mismo
 * fondo/borde/foco, más el scrollbar delgado consistente con el resto del
 * proyecto (sidebar, carrusel).
 */
export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(function TextareaField(
  { label, error, containerClassName, id, rows = 4, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName ?? ""}`}>
      <label
        htmlFor={textareaId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <textarea
        {...props}
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={!!error}
        className={`py-2 px-3 sm:py-3 sm:px-4 block w-full bg-layer border rounded-lg sm:text-sm text-foreground placeholder:text-muted-foreground-1 focus:outline-hidden focus:ring-1 disabled:opacity-50 disabled:pointer-events-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb ${
          error
            ? "border-danger focus:border-danger focus:ring-danger"
            : "border-layer-line focus:border-primary-focus focus:ring-primary-focus"
        }`}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});
