"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  label: string;
  error?: string;
  description?: string;
  containerClassName?: string;
}

/**
 * Select nativo con el mismo estilo Preline ("input-base") que TextField,
 * para no repetir la clase larga de `<select>` en cada formulario (antes
 * duplicada inline en flash-card-form.tsx/protected-area-form.tsx).
 */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    { label, error, description, containerClassName, id, children, ...props },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName ?? ""}`}>
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
        <select
          {...props}
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          className={`py-2.5 sm:py-3 px-4 block w-full bg-layer border rounded-lg sm:text-sm text-foreground focus:outline-hidden focus:ring-1 disabled:opacity-50 disabled:pointer-events-none ${
            error
              ? "border-danger focus:border-danger focus:ring-danger"
              : "border-layer-line focus:border-primary-focus focus:ring-primary-focus"
          }`}
        >
          {children}
        </select>
        {description && !error && (
          <p className="text-xs text-muted">{description}</p>
        )}
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
