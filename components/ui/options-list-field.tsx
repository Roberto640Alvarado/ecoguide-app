"use client";

import { Plus, Trash2 } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";

const DEFAULT_MAX_OPTIONS = 6;

interface OptionsListFieldProps {
  options: string[];
  onChange: (options: string[]) => void;
  error?: string;
  label?: string;
  maxOptions?: number;
}

/**
 * Editor genérico de una lista de opciones de texto (arreglo controlado vía
 * onChange, sin useFieldArray porque son strings planos, no objetos).
 * Compartido entre FlashCards (quiz ENVIRONMENTAL) y Tests (preguntas de
 * opción múltiple) — ver CLAUDE.md: "si dos features necesitan compartir
 * algo, ese algo sube a components/".
 */
export function OptionsListField({
  options,
  onChange,
  error,
  label,
  maxOptions = DEFAULT_MAX_OPTIONS,
}: OptionsListFieldProps) {
  const language = useLanguageStore((state) => state.language);

  function handleOptionChange(index: number, value: string) {
    const next = [...options];
    next[index] = value;
    onChange(next);
  }

  function handleRemove(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  function handleAdd() {
    onChange([...options, ""]);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        {label ?? (language === "en" ? "Answer options" : "Opciones de respuesta")}
      </label>

      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={
                language === "en" ? `Option ${index + 1}` : `Opción ${index + 1}`
              }
              className="py-2.5 sm:py-3 px-4 block flex-1 bg-layer border border-layer-line rounded-lg sm:text-sm text-foreground placeholder:text-muted-foreground-1 focus:outline-hidden focus:border-primary-focus focus:ring-1 focus:ring-primary-focus disabled:opacity-50 disabled:pointer-events-none"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={language === "en" ? "Remove option" : "Quitar opción"}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-layer-line bg-layer text-muted-foreground-1 transition-colors hover:border-danger hover:text-danger"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < maxOptions && (
        <button
          type="button"
          onClick={handleAdd}
          className="py-1.5 px-2 inline-flex w-fit items-center gap-x-1 text-xs font-medium rounded-full bg-layer border border-dashed border-layer-line text-layer-foreground hover:bg-layer-hover focus:outline-hidden focus:bg-layer-focus disabled:opacity-50 disabled:pointer-events-none"
        >
          <Plus className="size-3.5 shrink-0" aria-hidden="true" />
          {language === "en" ? "Add option" : "Agregar opción"}
        </button>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
