"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SkyToggle } from "@/components/ui/sky-toggle";
import { useLanguageStore } from "@/store/language-store";

interface ThemeSwitchProps {
  size?: number;
}

/**
 * Interruptor de tema (claro/oscuro) del encabezado del panel, sobre
 * next-themes. El tema real solo se conoce en el cliente: antes de montar
 * se pinta deshabilitado en modo día para no desfasar la hidratación.
 */
export function ThemeSwitch({ size }: ThemeSwitchProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <SkyToggle
      size={size}
      checked={isDark}
      disabled={!mounted}
      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      label={
        language === "en"
          ? isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
          : isDark
            ? "Cambiar a modo claro"
            : "Cambiar a modo oscuro"
      }
    />
  );
}
