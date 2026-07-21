"use client";

import { useState } from "react";
import { FieldError, Input, Label, TextField } from "@heroui/react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { PasswordRequirements } from "./password-requirements";

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  label: string;
  placeholder?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  autoComplete?: string;
  showRequirements?: boolean;
}

export function PasswordField({
  value,
  onChange,
  onBlur,
  name,
  label,
  placeholder,
  isInvalid,
  errorMessage,
  autoComplete = "current-password",
  showRequirements = false,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField isInvalid={isInvalid} fullWidth className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="relative">
        <Lock
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
          autoComplete={autoComplete}
          className="pl-9 pr-10"
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <FieldError className="text-xs">{errorMessage}</FieldError>
      {showRequirements && <PasswordRequirements password={value} />}
    </TextField>
  );
}
