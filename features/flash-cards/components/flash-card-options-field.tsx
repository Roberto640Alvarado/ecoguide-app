"use client";

import { Plus, Trash2 } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";

const MAX_OPTIONS = 6;

interface FlashCardOptionsFieldProps {
  options: string[];
  onChange: (options: string[]) => void;
  error?: string;
}

/**
 * Editor de las opciones de respuesta para flashcards ENVIRONMENTAL. Sigue
 * el mismo patrón que ImageUploader (arreglo controlado vía onChange, sin
 * useFieldArray) porque `options` es un array de strings planos, no de
 * objetos — useFieldArray de react-hook-form requiere lo segundo.
 */
export function FlashCardOptionsField({
  options,
  onChange,
  error,
}: FlashCardOptionsFieldProps) {
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
        {language === "en" ? "Answer options" : "Opciones de respuesta"}
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
              className="input flex-1"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={language === "en" ? "Remove option" : "Quitar opción"}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-danger hover:text-danger"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < MAX_OPTIONS && (
        <button
          type="button"
          onClick={handleAdd}
          className="flex w-fit items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {language === "en" ? "Add option" : "Agregar opción"}
        </button>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
