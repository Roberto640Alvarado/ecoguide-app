"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { usePageTitleContext } from "@/components/layout/page-title-context";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
}

// Empuja ícono + título al topbar compartido (ver dashboard-shell.tsx /
// page-title-context.tsx). El título ya no se repite en el contenido — aquí
// solo se pinta, alineada a la derecha, la acción principal de la página
// (ej. "New area") cuando existe. Ver CLAUDE.md, sección "Sistema de
// Diseño".
export function PageHeader({ icon: Icon, title, action }: PageHeaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const { setPageTitle } = usePageTitleContext();

  useEffect(() => {
    setPageTitle({ icon: Icon, title });

    return () => {
      setPageTitle({ icon: null, title: "" });
    };
  }, [Icon, title, setPageTitle]);

  if (!action) {
    return null;
  }

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-end"
    >
      {action}
    </motion.div>
  );
}
