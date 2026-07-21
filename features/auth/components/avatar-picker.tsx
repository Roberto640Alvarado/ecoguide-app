"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AVATAR_OPTIONS } from "@/lib/constants/avatars";
import { useLanguageStore } from "@/store/language-store";

interface AvatarPickerProps {
  value: string;
  onChange: (value: string) => void;
  isInvalid?: boolean;
  label: string;
}

export function AvatarPicker({
  value,
  onChange,
  isInvalid,
  label,
}: AvatarPickerProps) {
  const language = useLanguageStore((state) => state.language);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex gap-3 sm:gap-4">
        {AVATAR_OPTIONS.map((option) => {
          const isSelected = value === option.src;
          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => onChange(option.src)}
              aria-pressed={isSelected}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`group relative flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-colors sm:p-4 ${
                isSelected
                  ? "border-accent bg-accent-soft shadow-sm shadow-accent/20"
                  : "border-border bg-surface hover:border-accent/50 hover:bg-surface-secondary"
              }`}
            >
              <div
                className={`relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-surface transition-colors sm:h-20 sm:w-20 ${
                  isSelected ? "ring-accent" : "ring-transparent"
                }`}
              >
                <Image
                  src={option.src}
                  alt={option.label[language]}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <span
                className={`text-xs font-medium transition-colors sm:text-sm ${
                  isSelected ? "text-accent-soft-foreground" : "text-foreground"
                }`}
              >
                {option.label[language]}
              </span>

              {isSelected && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm"
                >
                  <Check className="h-3 w-3" aria-hidden="true" />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
      {isInvalid && (
        <span className="text-xs text-danger">
          {language === "en" ? "Choose an avatar." : "Selecciona un avatar."}
        </span>
      )}
    </div>
  );
}
