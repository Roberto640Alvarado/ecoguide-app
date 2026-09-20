"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, PartyPopper, RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/store/language-store";
import { useMarkFlashcardsCompleted } from "@/features/student-progress/hooks/use-mark-flashcards-completed";

interface FlashCardFinishDialogProps {
  /** Área protegida del mazo, para marcar las flashcards como completadas. */
  protectedAreaId: string;
  /** A dónde volver si el estudiante elige salir del mazo. */
  tourHref: string;
  /** Vuelve a la primera tarjeta del mazo (elige "Repasar de nuevo"). */
  onReview: () => void;
}

/**
 * Dos ráfagas laterales + una central (patrón "Canvas Confetti" de Preline)
 * para que la celebración se sienta más completa que un solo estallido.
 */
function launchConfetti() {
  const shared = { zIndex: 60, disableForReducedMotion: true };
  confetti({ ...shared, particleCount: 90, spread: 100, origin: { x: 0.5, y: 0.7 } });
  confetti({ ...shared, particleCount: 55, spread: 70, angle: 60, origin: { x: 0.1, y: 0.75 } });
  confetti({ ...shared, particleCount: 55, spread: 70, angle: 120, origin: { x: 0.9, y: 0.75 } });
}

/**
 * Botón "Terminado" (última tarjeta del mazo) que dispara confeti y abre un
 * diálogo preguntando si el estudiante quiere repasar el mazo de nuevo o
 * volver al recorrido del área protegida. Migrado de AlertDialogRoot
 * (HeroUI) al AlertDialog de shadcn/ui (components/ui/alert-dialog.tsx,
 * sobre radix-ui) como parte del rediseño de las vistas de estudiante —
 * el estado abierto/cerrado ahora se controla explícitamente con
 * `useState` para poder disparar el confeti en el mismo click que abre el
 * diálogo.
 */
export function FlashCardFinishDialog({
  protectedAreaId,
  tourHref,
  onReview,
}: FlashCardFinishDialogProps) {
  const language = useLanguageStore((state) => state.language);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutate: markFlashcardsCompleted } =
    useMarkFlashcardsCompleted(protectedAreaId);

  const handleFinish = () => {
    launchConfetti();
    markFlashcardsCompleted();
    setOpen(true);
  };

  return (
    <>
      <motion.div
        className="flex w-full sm:w-auto"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <Button
          onClick={handleFinish}
          className="h-auto w-full gap-1.5 rounded-xl px-5 py-2.5 shadow-sm sm:min-w-40"
        >
          <PartyPopper className="h-4 w-4" aria-hidden="true" />
          {language === "en" ? "Finished" : "Terminado"}
        </Button>
      </motion.div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground sm:mx-0"
          >
            <PartyPopper className="h-6 w-6" aria-hidden="true" />
          </motion.div>

          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "en" ? "Deck completed!" : "¡Mazo completado!"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "en"
                ? "Nice work! Do you want to review the deck again, or go back to the tour?"
                : "¡Buen trabajo! ¿Quieres repasar el mazo de nuevo o volver al recorrido?"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => {
                setOpen(false);
                onReview();
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {language === "en" ? "Review again" : "Repasar de nuevo"}
            </Button>
            <Button
              className="gap-1.5"
              onClick={() => {
                setOpen(false);
                router.push(tourHref);
              }}
            >
              {language === "en" ? "Back to tour" : "Volver al recorrido"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
