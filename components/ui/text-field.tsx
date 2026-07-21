"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  containerClassName?: string;
}

/**
 * Input de texto nativo con el estilo Preline UI ("input-base"): fondo
 * bg-layer, borde layer-line, foco en el acento de la marca (ver alias en
 * app/globals.css). Reemplaza el patrón TextField+Input de HeroUI repetido
 * en todos los formularios del proyecto (login, registro, área protegida,
 * flashcards, usuarios, proveedores de IA).
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, icon: Icon, error, containerClassName, id, ...props },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName ?? ""}`}>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
        <div className="relative">
          {Icon && (
            <Icon
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground-1"
              aria-hidden="true"
            />
          )}
          <input
            {...props}
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={`py-2.5 sm:py-3 ${
              Icon ? "pl-9 pr-4" : "px-4"
            } block w-full bg-layer border rounded-lg sm:text-sm text-foreground placeholder:text-muted-foreground-1 focus:outline-hidden focus:ring-1 disabled:opacity-50 disabled:pointer-events-none ${
              error
                ? "border-danger focus:border-danger focus:ring-danger"
                : "border-layer-line focus:border-primary-focus focus:ring-primary-focus"
            }`}
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
