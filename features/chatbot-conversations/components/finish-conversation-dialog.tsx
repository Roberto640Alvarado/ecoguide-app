"use client";

import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
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

interface FinishConversationDialogProps {
  isLoading: boolean;
  onConfirm: () => Promise<void>;
}

/**
 * Confirmación de "Finalizar chat" con el AlertDialog de shadcn/ui. El
 * diálogo queda abierto (con spinner) hasta que la API devuelve la
 * retroalimentación general, y luego se cierra.
 */
export function FinishConversationDialog({
  isLoading,
  onConfirm,
}: FinishConversationDialogProps) {
  const language = useLanguageStore((state) => state.language);
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    await onConfirm();
    setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {/* Rojo y con texto también en móvil: es la acción principal del
            encabezado y antes, solo con el ícono, pasaba desapercibida. */}
        <Button
          variant="destructive"
          size="sm"
          className="h-9 shrink-0 gap-1.5 rounded-full px-3.5 font-semibold shadow-sm shadow-destructive/30 sm:px-4"
        >
          <Flag className="size-3.5" aria-hidden="true" />
          <span className="sm:hidden">
            {language === "en" ? "Finish" : "Finalizar"}
          </span>
          <span className="hidden sm:inline">
            {language === "en" ? "Finish chat" : "Finalizar chat"}
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {language === "en" ? "Finish this chat?" : "¿Finalizar este chat?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {language === "en"
              ? "You'll get overall feedback on this conversation. You can always start a new chat afterwards."
              : "Recibirás una retroalimentación general de esta conversación. Después siempre puedes iniciar un chat nuevo."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {language === "en" ? "Cancel" : "Cancelar"}
          </AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {language === "en" ? "Finish" : "Finalizar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
