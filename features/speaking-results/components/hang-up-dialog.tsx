"use client";

import { useState } from "react";
import { Loader2, PhoneOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/store/language-store";
import { CallControlButton } from "./call-control-button";

interface HangUpDialogProps {
  isLoading: boolean;
  onConfirm: () => Promise<void>;
}

/** Botón rojo de colgar + confirmación (AlertDialog de shadcn/ui). */
export function HangUpDialog({ isLoading, onConfirm }: HangUpDialogProps) {
  const language = useLanguageStore((state) => state.language);
  const en = language === "en";
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    await onConfirm();
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <CallControlButton
          tone="danger"
          label={en ? "Hang up" : "Colgar"}
          disabled={isLoading}
          icon={
            isLoading ? (
              <Loader2 className="size-6 animate-spin" aria-hidden="true" />
            ) : (
              <PhoneOff className="size-6" aria-hidden="true" />
            )
          }
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {en ? "Finish this call?" : "¿Finalizar esta llamada?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {en
              ? "You'll get feedback and a score based on this conversation. You won't be able to add more turns afterward."
              : "Recibirás retroalimentación y una calificación basada en esta conversación. Después no podrás agregar más turnos."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {en ? "Keep talking" : "Seguir hablando"}
          </AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {en ? "Hang up" : "Colgar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
