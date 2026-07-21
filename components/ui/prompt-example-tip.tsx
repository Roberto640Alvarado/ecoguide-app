"use client";

import { Lightbulb } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";

interface PromptExampleTipProps {
  title: string;
  example: string;
  onUseExample: () => void;
}

/**
 * Callout con un ejemplo de buena práctica de prompt (rol + objetivo +
 * criterio claro) y un botón para precargarlo en el editor. Usado por
 * SpeakingPracticeForm y ChatbotConfigForm — cada uno le pasa su propio
 * ejemplo, específico a lo que ese prompt debe lograr.
 */
export function PromptExampleTip({
  title,
  example,
  onUseExample,
}: PromptExampleTipProps) {
  const language = useLanguageStore((state) => state.language);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-accent-soft bg-accent-soft/40 p-4">
      <div className="flex items-start gap-2">
        <Lightbulb
          className="mt-0.5 h-4 w-4 shrink-0 text-accent-soft-foreground"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-accent-soft-foreground">
            {title}
          </p>
          <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-accent-soft-foreground/90">
            {example}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onUseExample}
        className="self-start text-xs font-semibold text-accent hover:underline"
      >
        {language === "en" ? "Use this example" : "Usar este ejemplo"}
      </button>
    </div>
  );
}
