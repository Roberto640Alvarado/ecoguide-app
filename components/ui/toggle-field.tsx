"use client";

interface ToggleFieldProps {
  label: string;
  /** Texto de apoyo debajo del label, para aclarar qué implica el switch
   *  cuando su nombre por sí solo no es suficientemente descriptivo (ej.
   *  "Publicada" en el formulario de área protegida). */
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleField({
  label,
  description,
  checked,
  onChange,
}: ToggleFieldProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border bg-surface-secondary px-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-muted">
            {description}
          </span>
        )}
      </span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-default-soft transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-5" />
      </span>
    </label>
  );
}
