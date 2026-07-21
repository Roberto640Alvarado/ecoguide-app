"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";

interface PasswordRequirementsProps {
  password: string;
}

const RULES = [
  {
    id: "length",
    test: (pw: string) => pw.length >= 8,
    label: { en: "At least 8 characters", es: "Al menos 8 caracteres" },
  },
  {
    id: "letter",
    test: (pw: string) => /[a-zA-Z]/.test(pw),
    label: { en: "At least one letter", es: "Al menos una letra" },
  },
  {
    id: "number",
    test: (pw: string) => /\d/.test(pw),
    label: { en: "At least one number", es: "Al menos un número" },
  },
];

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const language = useLanguageStore((state) => state.language);

  return (
    <ul className="flex flex-col gap-1.5 pt-1">
      {RULES.map((rule) => {
        const passed = password.length > 0 && rule.test(password);
        return (
          <li
            key={rule.id}
            className={`flex items-center gap-2 text-xs transition-colors ${
              passed ? "text-success" : "text-muted"
            }`}
          >
            <motion.span
              animate={{ scale: passed ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.25 }}
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                passed ? "bg-success-soft" : "bg-default-soft"
              }`}
            >
              {passed ? (
                <Check className="h-2.5 w-2.5" aria-hidden="true" />
              ) : (
                <X className="h-2.5 w-2.5 opacity-50" aria-hidden="true" />
              )}
            </motion.span>
            {rule.label[language]}
          </li>
        );
      })}
    </ul>
  );
}
