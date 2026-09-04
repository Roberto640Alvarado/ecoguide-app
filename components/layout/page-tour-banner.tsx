"use client";

import { CircleHelp, PlayCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PageTourBannerProps {
  title: string;
  description: string;
  buttonLabel: string;
  onStart: () => void;
}

// Banner que invita a tomar el tour guiado de la página (ver
// hooks/use-page-tour.ts). Vive entre el bloque de descripción de
// <PageHeader /> y la fila de búsqueda/filtros de cada vista de listado de
// docente.
export function PageTourBanner({
  title,
  description,
  buttonLabel,
  onStart,
}: PageTourBannerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <CircleHelp
          className="h-5 w-5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={onStart}
        className="shrink-0 self-start rounded-full sm:self-auto"
      >
        <PlayCircle className="h-4 w-4" aria-hidden="true" />
        {buttonLabel}
      </Button>
    </motion.div>
  );
}
