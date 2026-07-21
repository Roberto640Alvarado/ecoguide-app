"use client";

import { useState } from "react";
import { FieldError, Input, Label, TextField } from "@heroui/react";
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

  return (
    <TextField isInvalid={isInvalid} fullWidth className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="relative">
        <KeyRound
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <Input
          fullWidth
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="off"
          className="pl-9 pr-10"
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
          aria-label={isVisible ? "Ocultar" : "Mostrar"}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {description && !errorMessage && (
        <p className="text-xs text-muted">{description}</p>
      )}
      <FieldError className="text-xs">{errorMessage}</FieldError>
    </TextField>
  );
}
