"use client";

import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";

const MAX_TEXTAREA_HEIGHT_PX = 160;

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Bloquea el envío (no la escritura) mientras EcoGuía responde. */
  isSendDisabled: boolean;
}

/**
 * Input tipo píldora (estilo iMessage): el textarea crece con el contenido
 * hasta un máximo, Enter envía y Shift+Enter hace salto de línea, y el
 * botón de enviar "se enciende" con un resorte cuando hay texto.
 */
export function ChatComposer({
  value,
  onChange,
  onSubmit,
  isSendDisabled,
}: ChatComposerProps) {
  const language = useLanguageStore((state) => state.language);
  const reduceMotion = useReducedMotion();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !isSendDisabled;

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }, [value]);

  function submit() {
    if (!canSend) {
      return;
    }

    onSubmit();
    textareaRef.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    submit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 rounded-[24px] border border-border bg-background py-1.5 pl-4 pr-1.5 transition-[border-color,box-shadow] focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20"
    >
      <label htmlFor="chat-composer" className="sr-only">
        {language === "en" ? "Message" : "Mensaje"}
      </label>
      <textarea
        id="chat-composer"
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={
          language === "en" ? "Type a message..." : "Escribe un mensaje..."
        }
        // text-base en móvil evita el zoom automático de iOS al enfocar.
        className="max-h-40 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-base leading-6 text-foreground outline-none placeholder:text-muted sm:text-[15px]"
      />
      <motion.button
        type="submit"
        disabled={!canSend}
        aria-label={language === "en" ? "Send message" : "Enviar mensaje"}
        initial={false}
        animate={{ scale: canSend ? 1 : 0.85, opacity: canSend ? 1 : 0.4 }}
        whileTap={canSend && !reduceMotion ? { scale: 0.85 } : undefined}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed"
      >
        <ArrowUp className="size-5" strokeWidth={2.5} aria-hidden="true" />
      </motion.button>
    </form>
  );
}
