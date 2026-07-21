"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

interface SecretFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  label: string;
  placeholder?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
}

export function SecretField({
  value,
  onChange,
  onBlur,
  name,
  label,
  placeholder,
  isInvalid,
  errorMessage,
  description,
}: SecretFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputId = `secret-${useId().replace(/:/g, "")}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <KeyRound
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground-1"
          aria-hidden="true"
        />
        <input
          id={inputId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={isInvalid}
          className={`py-2.5 sm:py-3 pl-9 pr-10 block w-full bg-layer border rounded-lg sm:text-sm text-foreground placeholder:text-muted-foreground-1 focus:outline-hidden focus:ring-1 disabled:opacity-50 disabled:pointer-events-none ${
            isInvalid
              ? "border-danger focus:border-danger focus:ring-danger"
              : "border-layer-line focus:border-primary-focus focus:ring-primary-focus"
          }`}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground-1 transition-colors hover:text-foreground"
          aria-label={isVisible ? "Ocultar" : "Mostrar"}
        >
          {isVisible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {description && !errorMessage && (
        <p className="text-xs text-muted-foreground-1">{description}</p>
      )}
      {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}
    </div>
  );
}
