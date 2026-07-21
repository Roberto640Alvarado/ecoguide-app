"use client";

import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import {
  AlertDialogRoot,
  AlertDialogBackdrop,
  AlertDialogContainer,
  AlertDialogDialog,
  AlertDialogHeader,
  AlertDialogHeading,
  AlertDialogIcon,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from "@heroui/react";
import { PartyPopper, RotateCcw } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";

interface FlashCardFinishDialogProps {
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
 * modal preguntando si el estudiante quiere repasar el mazo de nuevo o
 * volver al recorrido del área protegida. Reutiliza AlertDialogRoot (mismo
 * patrón que ConfirmDialog), usando el propio botón "Terminado" como
 * trigger — react-aria compone el onPress del trigger con su lógica interna
 * de apertura, así que el confeti y el modal disparan en el mismo click.
 */
export function FlashCardFinishDialog({
  tourHref,
  onReview,
}: FlashCardFinishDialogProps) {
  const language = useLanguageStore((state) => state.language);
  const router = useRouter();

  return (
    <AlertDialogRoot>
      <Button variant="primary" onPress={launchConfetti} className="gap-1.5">
        <PartyPopper className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Finished" : "Terminado"}
      </Button>
      <AlertDialogBackdrop variant="blur">
        <AlertDialogContainer size="sm">
          <AlertDialogDialog>
            {({ close }) => (
              <>
                <AlertDialogHeader>
                  <AlertDialogIcon status="success">
                    <PartyPopper className="h-5 w-5" aria-hidden="true" />
                  </AlertDialogIcon>
                  <AlertDialogHeading>
                    {language === "en"
                      ? "Deck completed!"
                      : "¡Mazo completado!"}
                  </AlertDialogHeading>
                </AlertDialogHeader>
                <AlertDialogBody>
                  <p>
                    {language === "en"
                      ? "Nice work! Do you want to review the deck again, or go back to the tour?"
                      : "¡Buen trabajo! ¿Quieres repasar el mazo de nuevo o volver al recorrido?"}
                  </p>
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    onPress={() => {
                      onReview();
                      close();
                    }}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    {language === "en" ? "Review again" : "Repasar de nuevo"}
                  </Button>
                  <Button
                    variant="primary"
                    onPress={() => {
                      close();
                      router.push(tourHref);
                    }}
                  >
                    {language === "en" ? "Back to tour" : "Volver al recorrido"}
                  </Button>
                </AlertDialogFooter>
              </>
            )}
          </AlertDialogDialog>
        </AlertDialogContainer>
      </AlertDialogBackdrop>
    </AlertDialogRoot>
  );
}
