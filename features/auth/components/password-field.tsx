"use client";

import { useEffect, useId, useState } from "react";
import { Check, Eye, EyeOff, Lock, X } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";

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

const WEAKNESS_TEXT = {
  en: ["Empty", "Weak", "Medium", "Strong"],
  es: ["Vacía", "Débil", "Media", "Fuerte"],
};

/**
 * Input de contraseña con el estilo Preline UI, más el indicador de fuerza
 * hs-strong-password cuando `showRequirements` está activo (registro y
 * recuperación de contraseña).
 *
 * Nuestras reglas reales son solo 3 (ver register.schema.ts /
 * reset-password.schema.ts): mínimo 8 caracteres, al menos una letra y al
 * menos un número — sin distinguir mayúsculas/minúsculas ni exigir
 * caracteres especiales. El plugin de Preline no tiene una regla "letra sin
 * distinguir mayúsculas", así que excluimos "uppercase" y
 * "special-characters" y reetiquetamos el check "lowercase" restante como
 * "contiene una letra". Esto deja un caso borde no reflejado en el
 * indicador visual (una contraseña solo en mayúsculas + números es válida
 * para el esquema pero el indicador la marcaría como incompleta); la
 * validación real que decide si el formulario se envía sigue siendo el
 * esquema zod vía `errorMessage`, este indicador es solo una ayuda visual.
 */
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
  const language = useLanguageStore((state) => state.language);
  const rawId = useId().replace(/:/g, "");
  const inputId = `pw-input-${rawId}`;
  const hintsId = `pw-hints-${rawId}`;
  const stripsId = `pw-strips-${rawId}`;

  useEffect(() => {
    if (!showRequirements) return;
    import("preline").then(() => {
      window.HSStaticMethods.autoInit(["strong-password"]);
    });
  }, [showRequirements]);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <Lock
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
          autoComplete={autoComplete}
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
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {errorMessage && <p className="text-xs text-danger">{errorMessage}</p>}

      {showRequirements && (
        <>
          <div
            id={stripsId}
            data-hs-strong-password={JSON.stringify({
              target: `#${inputId}`,
              hints: `#${hintsId}`,
              checksExclude: ["uppercase", "special-characters"],
              minLength: 8,
              stripClasses:
                "hs-strong-password:opacity-100 hs-strong-password-accepted:bg-success h-2 flex-auto rounded-full bg-primary opacity-50 mx-1",
            })}
            className="flex -mx-1"
          />
          <div id={hintsId}>
            <span className="text-sm text-foreground">
              {language === "en" ? "Level: " : "Nivel: "}
            </span>
            <span
              data-hs-strong-password-hints-weakness-text={JSON.stringify(
                WEAKNESS_TEXT[language],
              )}
              className="text-sm font-semibold text-foreground"
            />
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground-1">
              <li
                data-hs-strong-password-hints-rule-text="min-length"
                className="hs-strong-password-active:text-success flex items-center gap-x-2"
              >
                <span className="hidden" data-check>
                  <Check className="size-4 shrink-0" aria-hidden="true" />
                </span>
                <span data-uncheck>
                  <X className="size-4 shrink-0" aria-hidden="true" />
                </span>
                {language === "en"
                  ? "Minimum 8 characters."
                  : "Mínimo 8 caracteres."}
              </li>
              <li
                data-hs-strong-password-hints-rule-text="lowercase"
                className="hs-strong-password-active:text-success flex items-center gap-x-2"
              >
                <span className="hidden" data-check>
                  <Check className="size-4 shrink-0" aria-hidden="true" />
                </span>
                <span data-uncheck>
                  <X className="size-4 shrink-0" aria-hidden="true" />
                </span>
                {language === "en" ? "Contains a letter." : "Contiene una letra."}
              </li>
              <li
                data-hs-strong-password-hints-rule-text="numbers"
                className="hs-strong-password-active:text-success flex items-center gap-x-2"
              >
                <span className="hidden" data-check>
                  <Check className="size-4 shrink-0" aria-hidden="true" />
                </span>
                <span data-uncheck>
                  <X className="size-4 shrink-0" aria-hidden="true" />
                </span>
                {language === "en" ? "Contains a number." : "Contiene un número."}
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
