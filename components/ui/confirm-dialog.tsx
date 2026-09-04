"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";
import { Pressable } from "react-aria-components";
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
import { TriangleAlert } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";

interface ConfirmDialogProps {
  /** Elemento que abre el diálogo al hacer click. Omitir cuando el diálogo
   *  se controla externamente con `open`/`onOpenChange` (ej. un toggle que
   *  primero debe confirmar antes de aplicar el cambio). */
  trigger?: ReactElement;
  /** Controla el diálogo desde afuera en vez de depender del `trigger`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: ReactNode;
  /** Nota tranquilizadora opcional (ej. "Puedes reactivarlo luego"). */
  note?: ReactNode;
  /** Ícono del badge circular del encabezado. Por defecto un triángulo de alerta. */
  icon?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  note,
  icon,
  confirmLabel,
  cancelLabel,
  isLoading,
  onConfirm,
}: ConfirmDialogProps) {
  const language = useLanguageStore((state) => state.language);

  return (
    <AlertDialogRoot isOpen={open} onOpenChange={onOpenChange}>
      {trigger && (
        <Pressable>
          {/* Igual que en FormModal: un <button> crudo pasado directo como
           *  hijo nunca recibe el gesto de click de React Aria sin este
           *  wrapper. El cast es porque Pressable exige en TS un elemento
           *  DOM nativo, aunque en runtime clona cualquier elemento. */}
          {trigger as unknown as ComponentProps<typeof Pressable>["children"]}
        </Pressable>
      )}
      <AlertDialogBackdrop variant="blur">
        <AlertDialogContainer size="sm">
          <AlertDialogDialog>
            {({ close }) => (
              <>
                <AlertDialogHeader>
                  <AlertDialogIcon status="danger">
                    {icon ?? (
                      <TriangleAlert className="h-5 w-5" aria-hidden="true" />
                    )}
                  </AlertDialogIcon>
                  <AlertDialogHeading>{title}</AlertDialogHeading>
                </AlertDialogHeader>
                <AlertDialogBody className="flex flex-col gap-3">
                  <p>{description}</p>
                  {note && (
                    <p className="rounded-xl bg-default-soft px-3 py-2 text-xs leading-relaxed text-muted">
                      {note}
                    </p>
                  )}
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button variant="outline" onPress={close}>
                    {cancelLabel ?? (language === "en" ? "Cancel" : "Cancelar")}
                  </Button>
                  <Button
                    variant="danger"
                    isDisabled={isLoading}
                    onPress={() => {
                      onConfirm();
                      close();
                    }}
                  >
                    {confirmLabel ?? (language === "en" ? "Confirm" : "Confirmar")}
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
