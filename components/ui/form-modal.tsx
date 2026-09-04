"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";
import { Pressable } from "react-aria-components";
import {
  ModalRoot,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalCloseTrigger,
} from "@heroui/react";
import { X } from "lucide-react";

interface FormModalRenderProps {
  close: () => void;
}

interface FormModalProps {
  trigger: ReactElement;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: (helpers: FormModalRenderProps) => ReactNode;
}

// El `trigger` se recibe como un elemento crudo (ej. el <Button> de shadcn) y
// se pasa directo como hijo de <ModalRoot>. HeroUI conecta el gesto de click
// al estado del modal mediante React Aria (`DialogTrigger` + un único
// `PressResponder` compartido vía contexto), pero ese contexto solo lo
// consume un elemento envuelto en `Pressable` (o los componentes de RAC).
// Un <button> nativo de shadcn no lo consume por sí solo, así que sin este
// wrapper el trigger nunca abre el modal al hacer click.
export function FormModal({
  trigger,
  title,
  description,
  size = "lg",
  children,
}: FormModalProps) {
  return (
    <ModalRoot>
      <Pressable>
        {/* Pressable exige en TS un elemento DOM nativo (ReactElement<..., string>),
         *  pero en runtime solo clona lo que reciba (ver Pressable.mjs:
         *  React.Children.only + cloneElement) — un componente custom como
         *  nuestro <Button> funciona igual que un <button> nativo. */}
        {trigger as unknown as ComponentProps<typeof Pressable>["children"]}
      </Pressable>
      <ModalBackdrop>
        <ModalContainer size={size === "xl" ? "lg" : size}>
          <ModalDialog>
            {({ close }) => (
              <>
                <ModalHeader>
                  <ModalHeading>{title}</ModalHeading>
                  <ModalCloseTrigger>
                    <X className="h-4 w-4" aria-hidden="true" />
                  </ModalCloseTrigger>
                </ModalHeader>
                <ModalBody>
                  {description && (
                    <p className="-mt-1 mb-4 text-sm text-muted">{description}</p>
                  )}
                  {children({ close })}
                </ModalBody>
              </>
            )}
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </ModalRoot>
  );
}
