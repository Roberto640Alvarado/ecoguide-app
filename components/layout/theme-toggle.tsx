"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  className?: string;
  /** Oculta el texto junto al ícono (usado en el sidebar colapsado a modo ícono). */
  labelClassName?: string;
  labels: { light: string; dark: string };
}

// Toggle claro/oscuro sobre next-themes (ya configurado con attribute="class"
// en app/providers.tsx). El guard de `mounted` evita el mismatch de
// hidratación: el servidor no sabe qué tema eligió el usuario, así que el
// ícono real solo se pinta una vez montado en el cliente.
export function ThemeToggle({
  className,
  labelClassName,
  labels,
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className={className} disabled>
        <Sun className="size-4 shrink-0" aria-hidden="true" />
        <span className={labelClassName}>{labels.light}</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? labels.light : labels.dark}
    >
      {isDark ? (
        <Sun className="size-4 shrink-0" aria-hidden="true" />
      ) : (
        <Moon className="size-4 shrink-0" aria-hidden="true" />
      )}
      <span className={labelClassName}>{isDark ? labels.light : labels.dark}</span>
    </Button>
  );
}
